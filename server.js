const express = require('express');
const session = require('express-session');
const cors = require('cors');
const csrf = require('csurf');
const path = require('path');
require('dotenv').config();
const MySQLStore = require('express-mysql-session')(session);

const { testConnection, pool } = require('./config/database');
const { sessionConfig } = require('./config/session');
const { protectAdminPage, requireGuest, noCacheHeaders } = require('./middleware/sessionAuth');
const authRoutes = require('./routes/auth');
const pratosRoutes = require('./routes/pratos');
const categoriasRoutes = require('./routes/categorias');
const pdfRoutes = require('./routes/pdf');
const usuariosRoutes = require('./routes/usuarios');
const configuracoesRoutes = require('./routes/configuracoes');
const viteManifest = require('./utils/vite-manifest');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy - CRITICAL for production with Nginx reverse proxy
// Allows Express to read X-Forwarded-* headers
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Helper function to inject Vite bundles into HTML
function sendHtmlWithBundles(res, filePath) {
    const manifest = viteManifest.loadManifest();
    let html = fs.readFileSync(filePath, 'utf-8');
    
    if (manifest) {
        html = html.replace(/<!--\s*VITE_BUNDLE:(\w+)\s*-->/g, (match, bundleName) => {
            const entry = `src/${bundleName}/main.js`;
            const bundle = manifest[entry];
            return bundle 
                ? `<script type="module" src="/${bundle.file}"></script>`
                : `<!-- Bundle ${bundleName} não encontrado -->`;
        });
    }
    
    res.send(html);
}

// Session middleware - MUST be before routes
app.use(session(sessionConfig));

// Request logger (optional - can be removed in production)
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path}`);
//     next();
// });

// CORS with credentials support (required for session cookies)
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true // CRITICAL: allow cookies
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSRF Protection - must be after body parsers and session
const csrfProtection = csrf({ cookie: false }); // Use session instead of cookies
app.use(csrfProtection);

// Make CSRF token available to all views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// ============================================
// ROTAS ESPECÍFICAS (DEVEM VIR ANTES DE express.static)
// ============================================

// Homepage route - check session and redirect if logged in
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/admin');
    }
    sendHtmlWithBundles(res, path.join(__dirname, 'public', 'index.html'));
});

// Login page - only accessible to guests (not logged in)
app.get('/login', requireGuest, (req, res) => {
    sendHtmlWithBundles(res, path.join(__dirname, 'public', 'login', 'login.html'));
});

// Admin page - protected route with no-cache headers
app.get('/admin', protectAdminPage, (req, res) => {
    sendHtmlWithBundles(res, path.join(__dirname, 'public', 'admin', 'admin.html'));
});

// Users management page - protected route (GET)
app.get('/users', protectAdminPage, async (req, res) => {
    try {
        const currentUserId = req.session.user.id;
        const currentUserRole = req.session.user.role;
        
        // Buscar usuários do banco
        let query = 'SELECT id, email, nome, role, ativo, foto_perfil, criado_em, atualizado_em FROM usuarios';
        
        // Se for gerente, não mostrar admins
        if (currentUserRole === 'gerente') {
            query += " WHERE role != 'admin'";
        }
        
        query += ' ORDER BY criado_em DESC';
        
        const [usuarios] = await pool.query(query);
        
        // Ler HTML
        const manifest = viteManifest.loadManifest();
        let html = fs.readFileSync(path.join(__dirname, 'public', 'admin', 'users.html'), 'utf-8');
        
        // Preparar script de dados
        const dataScript = `
    <script>
        // Dados injetados pelo servidor (carregam ANTES do bundle)
        window.__INITIAL_DATA__ = {
            usuarios: ${JSON.stringify(usuarios)},
            currentUser: ${JSON.stringify(req.session.user)}
        };
    </script>
`;
        
        // Injetar bundle E dados juntos
        if (manifest) {
            html = html.replace(/<!--\s*VITE_BUNDLE:(\w+)\s*-->/g, (match, bundleName) => {
                const entry = `src/${bundleName}/main.js`;
                const bundle = manifest[entry];
                
                if (bundle) {
                    return dataScript + `<script type="module" src="/${bundle.file}"></script>`;
                } else {
                    return `<!-- Bundle ${bundleName} não encontrado -->`;
                }
            });
        }
        
        res.send(html);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        res.status(500).send('Erro ao carregar página');
    }
});

// Criar usuário (POST - sem API)
app.post('/users/create', protectAdminPage, async (req, res) => {
    try {
        const { email, senha, nome, role } = req.body;
        const currentUserRole = req.session.user.role;
        
        // Validações
        if (!email || !senha || !nome || !role) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }
        
        // Gerente não pode criar admin
        if (currentUserRole === 'gerente' && role === 'admin') {
            return res.status(403).json({ error: 'Gerente não pode criar administradores' });
        }
        
        // Verificar se email já existe
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        // Hash da senha
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(senha, 10);
        
        // Criar usuário
        await pool.query(
            'INSERT INTO usuarios (email, senha, nome, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, nome, role]
        );
        
        res.json({ success: true, message: 'Usuário criado com sucesso' });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Editar usuário (POST - sem API)
app.post('/users/edit/:id', protectAdminPage, async (req, res) => {
    try {
        const { email, senha, nome, role, ativo } = req.body;
        const targetUserId = req.params.id;
        const currentUserId = req.session.user.id;
        const currentUserRole = req.session.user.role;
        
        // Buscar usuário alvo
        const [targetUser] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [targetUserId]);
        if (targetUser.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Gerente não pode editar admin
        if (currentUserRole === 'gerente' && targetUser[0].role === 'admin') {
            return res.status(403).json({ error: 'Gerente não pode editar administradores' });
        }
        
        // Preparar atualização
        let updateQuery = 'UPDATE usuarios SET email = ?, nome = ?, role = ?, ativo = ?';
        let params = [email, nome, role, ativo ? 1 : 0];
        
        // Se senha foi fornecida, atualizar também
        if (senha) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(senha, 10);
            updateQuery += ', senha = ?';
            params.push(hashedPassword);
        }
        
        updateQuery += ' WHERE id = ?';
        params.push(targetUserId);
        
        await pool.query(updateQuery, params);
        
        res.json({ success: true, message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Deletar usuário (POST - sem API)
app.post('/users/delete/:id', protectAdminPage, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.session.user.id;
        const currentUserRole = req.session.user.role;
        
        // Apenas admin pode deletar
        if (currentUserRole !== 'admin') {
            return res.status(403).json({ error: 'Apenas administradores podem deletar usuários' });
        }
        
        // Não pode deletar a si mesmo
        if (currentUserId == targetUserId) {
            return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
        }
        
        // Verificar se usuário existe
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [targetUserId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Deletar usuário
        await pool.query('DELETE FROM usuarios WHERE id = ?', [targetUserId]);
        
        res.json({ success: true, message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/pratos', pratosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        restaurant: process.env.RESTAURANT_NAME || 'La Casa del Chaufa'
    });
});

// ============================================
// STATIC FILES (DEVEM VIR DEPOIS DAS ROTAS ESPECÍFICAS)
// ============================================

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/pratos', express.static(path.join(__dirname, 'public/pratos')));

// Servir bundles do Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Servir arquivos públicos (HTML, CSS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        error_es: 'Ruta no encontrada'
    });
});

app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        error_es: 'Error interno del servidor'
    });
});

async function startServer() {
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('⚠ Não foi possível conectar ao banco de dados');
        console.error('⚠ Verifique as configurações no arquivo .env');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log('═══════════════════════════════════════════════════');
        console.log(`✓ Servidor rodando na porta ${PORT}`);
        console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`✓ Cardápio público: http://localhost:${PORT}`);
        console.log(`✓ Painel admin: http://localhost:${PORT}/admin`);
        console.log(`✓ API: http://localhost:${PORT}/api`);
        console.log('═══════════════════════════════════════════════════');
    });
}

startServer();

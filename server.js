const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const pratosRoutes = require('./routes/pratos');
const categoriasRoutes = require('./routes/categorias');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/pratos', pratosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        restaurant: process.env.RESTAURANT_NAME || 'La Casa del Chaufa'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

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

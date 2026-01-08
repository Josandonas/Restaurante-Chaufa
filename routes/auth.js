const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { loginValidation, handleValidationErrors } = require('../middleware/validators');
const { addUserRole } = require('../middleware/roleAuth');

const uploadDir = path.join(__dirname, '../public/uploads/perfil');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas'));
        }
    }
});

router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
    try {
        const { email, senha, rememberMe } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                error: 'Credenciais inválidas',
                error_es: 'Credenciales inválidas'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(senha, user.senha);

        if (!validPassword) {
            return res.status(401).json({ 
                error: 'Credenciais inválidas',
                error_es: 'Credenciales inválidas'
            });
        }

        // Create session (Laravel-style)
        req.session.user = {
            id: user.id,
            email: user.email,
            nome: user.nome,
            foto_perfil: user.foto_perfil,
            role: user.role
        };

        req.session.save((err) => {
            if (err) {
                console.error('Erro ao criar sessão:', err);
                res.status(500).json({ 
                    error: 'Erro ao criar sessão',
                    error_es: 'Error al crear sesión'
                });
            }
        });

        // Also generate JWT token for API requests (backward compatibility)
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        let rememberToken = null;
        
        if (rememberMe) {
            rememberToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            
            await pool.query(
                'UPDATE usuarios SET remember_token = ?, token_expira_em = ? WHERE id = ?',
                [rememberToken, expiresAt, user.id]
            );
            
            // Extend session expiry for remember me
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.json({
            token,
            rememberToken,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                foto_perfil: user.foto_perfil
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            error: 'Erro ao processar login',
            error_es: 'Error al procesar login'
        });
    }
});

router.post('/verify', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ valid: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ valid: false });
        }
        res.json({ valid: true, user });
    });
});

router.post('/verify-remember', async (req, res) => {
    try {
        const { rememberToken } = req.body;

        if (!rememberToken) {
            return res.status(401).json({ valid: false });
        }

        const [users] = await pool.query(
            'SELECT * FROM usuarios WHERE remember_token = ? AND token_expira_em > NOW()',
            [rememberToken]
        );

        if (users.length === 0) {
            return res.status(401).json({ valid: false });
        }

        const user = users[0];
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            valid: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                foto_perfil: user.foto_perfil
            }
        });
    } catch (error) {
        console.error('Erro ao verificar remember token:', error);
        res.status(500).json({ valid: false });
    }
});

router.post('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido',
                error_es: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { senhaAtual, novaSenha } = req.body;

        if (!senhaAtual || !novaSenha) {
            return res.status(400).json({ 
                error: 'Senha atual e nova senha são obrigatórias',
                error_es: 'Contraseña actual y nueva contraseña son obligatorias'
            });
        }

        if (novaSenha.length < 6) {
            return res.status(400).json({ 
                error: 'Nova senha deve ter no mínimo 6 caracteres',
                error_es: 'Nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const [users] = await pool.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                error_es: 'Usuario no encontrado'
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(senhaAtual, user.senha);

        if (!validPassword) {
            return res.status(401).json({ 
                error: 'Senha atual incorreta',
                error_es: 'Contraseña actual incorrecta'
            });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        await pool.query(
            'UPDATE usuarios SET senha = ? WHERE id = ?',
            [hashedPassword, decoded.id]
        );

        res.json({ 
            message: 'Senha alterada com sucesso',
            message_es: 'Contraseña cambiada con éxito'
        });
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ 
            error: 'Erro ao alterar senha',
            error_es: 'Error al cambiar contraseña'
        });
    }
});

router.post('/upload-foto', upload.single('foto'), async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido',
                error_es: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!req.file) {
            return res.status(400).json({ 
                error: 'Nenhuma imagem foi enviada',
                error_es: 'No se envió ninguna imagen'
            });
        }

        const [users] = await pool.query(
            'SELECT foto_perfil FROM usuarios WHERE id = ?',
            [decoded.id]
        );

        if (users.length > 0 && users[0].foto_perfil) {
            const oldPhotoPath = path.join(__dirname, '../public', users[0].foto_perfil);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        const fotoUrl = `/uploads/perfil/${req.file.filename}`;

        await pool.query(
            'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
            [fotoUrl, decoded.id]
        );

        res.json({ 
            message: 'Foto atualizada com sucesso',
            message_es: 'Foto actualizada con éxito',
            foto_perfil: fotoUrl
        });
    } catch (error) {
        console.error('Erro ao fazer upload da foto:', error);
        res.status(500).json({ 
            error: 'Erro ao fazer upload da foto',
            error_es: 'Error al subir la foto'
        });
    }
});

router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido',
                error_es: 'Token no proporcionado'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error('Erro ao verificar JWT:', jwtError.message);
            return res.status(403).json({ 
                error: 'Token inválido ou expirado',
                error_es: 'Token inválido o expirado'
            });
        }

        const [users] = await pool.query(
            'SELECT id, email, nome, foto_perfil, role FROM usuarios WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                error: 'Usuário não encontrado',
                error_es: 'Usuario no encontrado'
            });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message, error.stack);
        res.status(500).json({ 
            error: 'Erro ao buscar dados',
            error_es: 'Error al buscar datos',
            details: error.message
        });
    }
});

// Logout endpoint - destroy session
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
            return res.status(500).json({ 
                error: 'Erro ao fazer logout',
                error_es: 'Error al cerrar sesión'
            });
        }
        res.clearCookie('chaufa_session');
        res.json({ 
            message: 'Logout realizado com sucesso',
            message_es: 'Logout realizado con éxito'
        });
    });
});

// Check session endpoint
router.get('/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ 
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;

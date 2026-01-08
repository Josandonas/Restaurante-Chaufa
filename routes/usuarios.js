const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { requireAuth } = require('../middleware/sessionAuth');

// Middleware para verificar se é admin ou gerente (usando sessão)
const isAdminOrGerente = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        
        const userRole = req.session.user.role;
        if (userRole !== 'admin' && userRole !== 'gerente') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores e gerentes.' });
        }
        next();
    } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        res.status(500).json({ error: 'Erro ao verificar permissão' });
    }
};

// Middleware para verificar se é admin (usando sessão)
const isAdmin = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        
        if (req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        next();
    } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        res.status(500).json({ error: 'Erro ao verificar permissão' });
    }
};

// Listar usuários (admin vê todos, gerente não vê admins)
router.get('/', requireAuth, isAdminOrGerente, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [currentUser] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [userId]);
        
        let query = 'SELECT id, email, nome, role, ativo, foto_perfil, criado_em, atualizado_em FROM usuarios';
        
        // Se for gerente, não mostrar admins
        if (currentUser[0].role === 'gerente') {
            query += " WHERE role != 'admin'";
        }
        
        query += ' ORDER BY criado_em DESC';
        
        const [usuarios] = await pool.query(query);
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

// Buscar usuário por ID (admin e gerente)
router.get('/:id', requireAuth, isAdminOrGerente, async (req, res) => {
    try {
        const [usuarios] = await pool.query(
            'SELECT id, email, nome, role, ativo, foto_perfil, criado_em, atualizado_em FROM usuarios WHERE id = ?',
            [req.params.id]
        );
        
        if (usuarios.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json(usuarios[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// Criar novo usuário (admin e gerente)
router.post('/', requireAuth, isAdminOrGerente, async (req, res) => {
    try {
        const { email, senha, nome, role } = req.body;
        const userId = req.session.user.id;
        const [currentUser] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [userId]);
        
        // Validações
        if (!email || !senha || !nome) {
            return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
        }
        
        if (!['admin', 'gerente', 'editor'].includes(role)) {
            return res.status(400).json({ error: 'Role inválida. Use "admin", "gerente" ou "editor"' });
        }
        
        // Gerente não pode criar admin
        if (currentUser[0].role === 'gerente' && role === 'admin') {
            return res.status(403).json({ error: 'Gerentes não podem criar administradores' });
        }
        
        // Verificar se email já existe
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);
        
        // Inserir usuário
        const [result] = await pool.query(
            'INSERT INTO usuarios (email, senha, nome, role, ativo) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, nome, role, true]
        );
        
        res.status(201).json({ 
            success: true,
            id: result.insertId,
            message: 'Usuário criado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// Atualizar usuário (admin e gerente)
router.put('/:id', requireAuth, isAdminOrGerente, async (req, res) => {
    try {
        const { email, senha, nome, role, ativo } = req.body;
        const targetUserId = req.params.id;
        const currentUserId = req.user.id || req.user.userId;
        
        // Buscar usuário atual e alvo
        const [currentUser] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [currentUserId]);
        const [targetUser] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [targetUserId]);
        
        if (targetUser.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Gerente não pode editar admin
        if (currentUser[0].role === 'gerente' && targetUser[0].role === 'admin') {
            return res.status(403).json({ error: 'Gerentes não podem editar administradores' });
        }
        
        // Gerente não pode promover para admin
        if (currentUser[0].role === 'gerente' && role === 'admin') {
            return res.status(403).json({ error: 'Gerentes não podem criar administradores' });
        }
        
        // Não permitir que usuário altere seu próprio role
        if (currentUserId == targetUserId && role !== currentUser[0].role) {
            return res.status(400).json({ error: 'Você não pode alterar sua própria role' });
        }
        
        // Verificar se email já existe em outro usuário
        if (email) {
            const [emailCheck] = await pool.query('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, targetUserId]);
            if (emailCheck.length > 0) {
                return res.status(400).json({ error: 'Email já cadastrado' });
            }
        }
        
        // Preparar campos para atualização
        let updateFields = [];
        let updateValues = [];
        
        if (email) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        if (senha) {
            const hashedPassword = await bcrypt.hash(senha, 10);
            updateFields.push('senha = ?');
            updateValues.push(hashedPassword);
        }
        
        if (nome) {
            updateFields.push('nome = ?');
            updateValues.push(nome);
        }
        
        if (role && ['admin', 'gerente'].includes(role)) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        
        if (ativo !== undefined) {
            updateFields.push('ativo = ?');
            updateValues.push(ativo ? 1 : 0);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Nenhum campo para atualizar' });
        }
        
        updateValues.push(userId);
        
        await pool.query(
            `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        const [updated] = await pool.query(
            'SELECT id, email, nome, role, ativo, foto_perfil, criado_em, atualizado_em FROM usuarios WHERE id = ?',
            [userId]
        );
        
        res.json({ success: true, usuario: updated[0] });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// Deletar usuário (apenas admin)
router.delete('/:id', requireAuth, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Não permitir que admin delete a si mesmo
        const currentUserId = req.session.user.id;
        if (currentUserId == userId) {
            return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
        }
        
        // Verificar se usuário existe
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        await pool.query('DELETE FROM usuarios WHERE id = ?', [targetUserId]);
        
        res.json({ success: true, message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

module.exports = router;

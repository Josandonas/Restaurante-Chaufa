const { pool } = require('../config/database');

// Middleware para verificar se é admin
const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user.userId;
        const [users] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [userId]);
        
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        
        next();
    } catch (error) {
        console.error('Erro ao verificar role:', error);
        res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
};

// Middleware para verificar se é admin ou gerente
const isAdminOrGerente = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user.userId;
        const [users] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [userId]);
        if (users.length === 0 || !['admin', 'gerente'].includes(users[0].role)) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores e gerentes.' });
        }
        req.userRole = users[0].role;
        next();
    } catch (error) {
        console.error('Erro ao verificar role:', error);
        res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
};

// Middleware para verificar se pode deletar (admin e gerente)
const canDelete = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user.userId;
        const [users] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [userId]);
        if (users.length === 0 || !['admin', 'gerente'].includes(users[0].role)) {
            return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para deletar.' });
        }
        next();
    } catch (error) {
        console.error('Erro ao verificar role:', error);
        res.status(500).json({ error: 'Erro ao verificar permissões' });
    }
};

// Middleware para adicionar role do usuário à requisição
const addUserRole = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user.userId;
        const [users] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [userId]);
        if (users.length > 0) {
            req.userRole = users[0].role;
        }
        next();
    } catch (error) {
        console.error('Erro ao buscar role:', error);
        next();
    }
};

module.exports = {
    isAdmin,
    isAdminOrGerente,
    canDelete,
    addUserRole
};

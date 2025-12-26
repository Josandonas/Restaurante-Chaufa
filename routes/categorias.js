const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { canDelete } = require('../middleware/roleAuth');

// Listar todas as categorias (público)
router.get('/', async (req, res) => {
    try {
        const [categorias] = await pool.query(
            'SELECT * FROM categorias WHERE ativo = TRUE ORDER BY ordem ASC'
        );
        res.json(categorias);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Listar todas as categorias incluindo inativas (admin)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const [categorias] = await pool.query(
            'SELECT * FROM categorias ORDER BY ordem ASC'
        );
        res.json(categorias);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Buscar categoria por ID
router.get('/:id', async (req, res) => {
    try {
        const [categorias] = await pool.query(
            'SELECT * FROM categorias WHERE id = ?',
            [req.params.id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }

        res.json(categorias[0]);
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
});

// Criar nova categoria (admin)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nome_pt, nome_es, ordem, ativo } = req.body;

        if (!nome_pt || !nome_es) {
            return res.status(400).json({ 
                error: 'Nome em português e espanhol são obrigatórios' 
            });
        }

        const [result] = await pool.query(
            'INSERT INTO categorias (nome_pt, nome_es, ordem, ativo) VALUES (?, ?, ?, ?)',
            [nome_pt, nome_es, ordem || 0, ativo !== false]
        );

        const [newCategoria] = await pool.query(
            'SELECT * FROM categorias WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newCategoria[0]);
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
});

// Atualizar categoria (admin)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { nome_pt, nome_es, ordem, ativo } = req.body;
        const { id } = req.params;

        if (!nome_pt || !nome_es) {
            return res.status(400).json({ 
                error: 'Nome em português e espanhol são obrigatórios' 
            });
        }

        await pool.query(
            'UPDATE categorias SET nome_pt = ?, nome_es = ?, ordem = ?, ativo = ? WHERE id = ?',
            [nome_pt, nome_es, ordem || 0, ativo !== false, id]
        );

        const [updatedCategoria] = await pool.query(
            'SELECT * FROM categorias WHERE id = ?',
            [id]
        );

        if (updatedCategoria.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada' });
        }

        res.json(updatedCategoria[0]);
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
});

// Deletar categoria (admin)
router.delete('/:id', authenticateToken, canDelete, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se há pratos usando esta categoria
        const [pratos] = await pool.query(
            'SELECT COUNT(*) as count FROM pratos WHERE categoria_id = ?',
            [id]
        );

        if (pratos[0].count > 0) {
            return res.status(400).json({ 
                error: 'Não é possível deletar categoria com pratos associados',
                error_es: 'No se puede eliminar categoría con platos asociados'
            });
        }

        await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ message: 'Categoria deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
});

// Reordenar categorias (admin)
router.post('/reorder', authenticateToken, async (req, res) => {
    try {
        const { categorias } = req.body;

        if (!Array.isArray(categorias)) {
            return res.status(400).json({ error: 'Formato inválido' });
        }

        for (const cat of categorias) {
            await pool.query(
                'UPDATE categorias SET ordem = ? WHERE id = ?',
                [cat.ordem, cat.id]
            );
        }

        res.json({ message: 'Ordem atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao reordenar categorias:', error);
        res.status(500).json({ error: 'Erro ao reordenar categorias' });
    }
});

module.exports = router;

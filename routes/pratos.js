const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { pratoValidation, handleValidationErrors } = require('../middleware/validators');
const fs = require('fs');
const path = require('path');

router.get('/public', async (req, res) => {
    try {
        const [pratos] = await pool.query(
            'SELECT * FROM pratos WHERE ativo = TRUE ORDER BY destaque DESC, ordem ASC, nome_pt ASC'
        );
        res.json(pratos);
    } catch (error) {
        console.error('Erro ao buscar pratos:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar pratos',
            error_es: 'Error al buscar platos'
        });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const [pratos] = await pool.query(
            'SELECT * FROM pratos ORDER BY destaque DESC, ordem ASC, nome_pt ASC'
        );
        res.json(pratos);
    } catch (error) {
        console.error('Erro ao buscar pratos:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar pratos',
            error_es: 'Error al buscar platos'
        });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [pratos] = await pool.query(
            'SELECT * FROM pratos WHERE id = ?',
            [req.params.id]
        );

        if (pratos.length === 0) {
            return res.status(404).json({ 
                error: 'Prato não encontrado',
                error_es: 'Plato no encontrado'
            });
        }

        res.json(pratos[0]);
    } catch (error) {
        console.error('Erro ao buscar prato:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar prato',
            error_es: 'Error al buscar plato'
        });
    }
});

router.post('/', authenticateToken, upload.single('imagem'), pratoValidation, handleValidationErrors, async (req, res) => {
    try {
        const { nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo, ordem } = req.body;
        const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await pool.query(
            `INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo, imagem_url, ordem)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nome_pt, nome_es, descricao_pt || null, descricao_es || null, preco_brl, preco_bob, categoria_id || null, destaque === '1' || destaque === true, ativo !== undefined ? ativo : true, imagem_url, ordem || 0]
        );

        const [newPrato] = await pool.query('SELECT * FROM pratos WHERE id = ?', [result.insertId]);
        res.status(201).json(newPrato[0]);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Erro ao criar prato:', error);
        res.status(500).json({ 
            error: 'Erro ao criar prato',
            error_es: 'Error al crear plato'
        });
    }
});

router.put('/:id', authenticateToken, upload.single('imagem'), pratoValidation, handleValidationErrors, async (req, res) => {
    try {
        const { nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo, ordem } = req.body;
        
        const [existing] = await pool.query('SELECT * FROM pratos WHERE id = ?', [req.params.id]);
        if (existing.length === 0) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({ 
                error: 'Prato não encontrado',
                error_es: 'Plato no encontrado'
            });
        }

        let imagem_url = existing[0].imagem_url;
        
        if (req.file) {
            if (existing[0].imagem_url) {
                const oldImagePath = path.join(__dirname, '..', 'public', existing[0].imagem_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagem_url = `/uploads/${req.file.filename}`;
        }

        await pool.query(
            `UPDATE pratos 
             SET nome_pt = ?, nome_es = ?, descricao_pt = ?, descricao_es = ?, 
                 preco_brl = ?, preco_bob = ?, categoria_id = ?, destaque = ?, ativo = ?, imagem_url = ?, ordem = ?
             WHERE id = ?`,
            [nome_pt, nome_es, descricao_pt || null, descricao_es || null, preco_brl, preco_bob, categoria_id || null, destaque === '1' || destaque === true, ativo !== undefined ? ativo : true, imagem_url, ordem || 0, req.params.id]
        );

        const [updated] = await pool.query('SELECT * FROM pratos WHERE id = ?', [req.params.id]);
        res.json(updated[0]);
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Erro ao atualizar prato:', error);
        res.status(500).json({ 
            error: 'Erro ao atualizar prato',
            error_es: 'Error al actualizar plato'
        });
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [existing] = await pool.query('SELECT * FROM pratos WHERE id = ?', [req.params.id]);
        
        if (existing.length === 0) {
            return res.status(404).json({ 
                error: 'Prato não encontrado',
                error_es: 'Plato no encontrado'
            });
        }

        if (existing[0].imagem_url) {
            const imagePath = path.join(__dirname, '..', 'public', existing[0].imagem_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await pool.query('DELETE FROM pratos WHERE id = ?', [req.params.id]);
        res.json({ 
            message: 'Prato excluído com sucesso',
            message_es: 'Plato eliminado con éxito'
        });
    } catch (error) {
        console.error('Erro ao excluir prato:', error);
        res.status(500).json({ 
            error: 'Erro ao excluir prato',
            error_es: 'Error al eliminar plato'
        });
    }
});

module.exports = router;

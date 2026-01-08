const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { requireAuth } = require('../middleware/sessionAuth');
const { canDelete } = require('../middleware/roleAuth');
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

// Endpoint para verificar última atualização dos pratos
router.get('/public/last-update', async (req, res) => {
    try {
        const [result] = await pool.query(
            'SELECT MAX(atualizado_em) as last_update FROM pratos'
        );
        res.json({ 
            lastUpdate: result[0].last_update || new Date().toISOString()
        });
    } catch (error) {
        console.error('Erro ao buscar última atualização:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar última atualização'
        });
    }
});

router.get('/', requireAuth, async (req, res) => {
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

router.get('/:id', requireAuth, async (req, res) => {
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

router.post('/', requireAuth, upload.single('imagem'), pratoValidation, handleValidationErrors, async (req, res) => {
    try {
        const { nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo, ordem } = req.body;
        const imagem_url = req.file ? `/uploads/pratos/${req.file.filename}` : null;

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

router.put('/:id', requireAuth, upload.single('imagem'), pratoValidation, handleValidationErrors, async (req, res) => {
    try {
        const { nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo, ordem, remover_imagem } = req.body;
        
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
        
        // Se marcou para remover imagem
        if (remover_imagem === '1') {
            if (existing[0].imagem_url) {
                const oldImagePath = path.join(__dirname, '..', 'public', existing[0].imagem_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagem_url = null;
        }
        // Se enviou nova imagem
        else if (req.file) {
            if (existing[0].imagem_url) {
                const oldImagePath = path.join(__dirname, '..', 'public', existing[0].imagem_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagem_url = `/uploads/pratos/${req.file.filename}`;
        }

        await pool.query(
            `UPDATE pratos 
             SET nome_pt = ?, nome_es = ?, descricao_pt = ?, descricao_es = ?, 
                 preco_brl = ?, preco_bob = ?, categoria_id = ?, destaque = ?, ativo = ?, imagem_url = ?, ordem = ?,
                 atualizado_em = CURRENT_TIMESTAMP
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

router.delete('/:id', requireAuth, canDelete, async (req, res) => {
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

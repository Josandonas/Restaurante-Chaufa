const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Obter taxa de câmbio atual
router.get('/cambio', authenticateToken, async (req, res) => {
    try {
        // Tentar buscar taxa existente
        let [rows] = await pool.query(
            'SELECT valor, atualizado_em FROM configuracoes WHERE chave = ?',
            ['taxa_cambio_bob_brl']
        );

        // Se não existir, criar com valor padrão
        if (rows.length === 0) {
            console.log('Taxa de câmbio não encontrada, criando registro padrão...');
            await pool.query(
                'INSERT INTO configuracoes (chave, valor, descricao) VALUES (?, ?, ?)',
                ['taxa_cambio_bob_brl', '0.75', 'Taxa de câmbio de Bolivianos (BOB) para Reais (BRL)']
            );
            
            // Buscar novamente
            [rows] = await pool.query(
                'SELECT valor, atualizado_em FROM configuracoes WHERE chave = ?',
                ['taxa_cambio_bob_brl']
            );
        }

        res.json({
            taxa_cambio: parseFloat(rows[0].valor),
            ultima_atualizacao: rows[0].atualizado_em
        });
    } catch (error) {
        console.error('Erro ao buscar taxa de câmbio:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar taxa de câmbio',
            error_es: 'Error al buscar tasa de cambio',
            detalhes: error.message
        });
    }
});

// Atualizar taxa de câmbio e recalcular preços
router.post('/cambio', authenticateToken, async (req, res) => {
    try {
        const { taxa_cambio, recalcular_precos } = req.body;

        // Validar taxa
        const taxa = parseFloat(taxa_cambio);
        if (isNaN(taxa) || taxa <= 0) {
            return res.status(400).json({ 
                error: 'Taxa de câmbio inválida. Deve ser um número maior que zero.',
                error_es: 'Tasa de cambio inválida. Debe ser un número mayor que cero.'
            });
        }

        // Validar formato decimal (máximo 6 casas decimais)
        if (!/^\d+(\.\d{1,6})?$/.test(taxa_cambio.toString())) {
            return res.status(400).json({ 
                error: 'Taxa de câmbio deve ter no máximo 6 casas decimais.',
                error_es: 'Tasa de cambio debe tener máximo 6 decimales.'
            });
        }

        const recalcular = recalcular_precos === true || recalcular_precos === 'true';

        // Chamar procedure para atualizar taxa
        const [result] = await pool.query(
            'CALL atualizar_taxa_cambio(?, ?)',
            [taxa, recalcular]
        );

        res.json({
            success: true,
            mensagem: 'Taxa de câmbio atualizada com sucesso!',
            mensagem_es: '¡Tasa de cambio actualizada con éxito!',
            taxa_nova: taxa,
            precos_recalculados: recalcular,
            detalhes: result[0] && result[0][0] ? result[0][0] : null
        });
    } catch (error) {
        console.error('Erro ao atualizar taxa de câmbio:', error);
        res.status(500).json({ 
            error: 'Erro ao atualizar taxa de câmbio',
            error_es: 'Error al actualizar tasa de cambio',
            detalhes: error.message
        });
    }
});

// Recalcular todos os preços BRL com a taxa atual
router.post('/cambio/recalcular', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.query('CALL atualizar_precos_brl()');

        res.json({
            success: true,
            mensagem: 'Preços recalculados com sucesso!',
            mensagem_es: '¡Precios recalculados con éxito!',
            detalhes: result[0] && result[0][0] ? result[0][0] : null
        });
    } catch (error) {
        console.error('Erro ao recalcular preços:', error);
        res.status(500).json({ 
            error: 'Erro ao recalcular preços',
            error_es: 'Error al recalcular precios',
            detalhes: error.message
        });
    }
});

module.exports = router;

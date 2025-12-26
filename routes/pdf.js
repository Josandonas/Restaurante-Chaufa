const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const { pool } = require('../config/database');
const path = require('path');

router.get('/generate', async (req, res) => {
    let browser;
    try {
        const { lang = 'pt' } = req.query;
        
        const [pratos] = await pool.query(
            'SELECT * FROM pratos ORDER BY tipo DESC, ordem ASC, nome_pt ASC'
        );

        const destaques = pratos.filter(p => p.tipo === 'destaque');
        const lista = pratos.filter(p => p.tipo === 'lista');

        const translations = {
            pt: {
                title: process.env.RESTAURANT_NAME || 'La Casa del Chaufa',
                subtitle: 'Comida Peruana!',
                highlights: 'Pratos em Destaque',
                menu: 'Cardápio Completo',
                unavailable: 'Não disponível no momento',
                generatedAt: 'Gerado em',
                page: 'Página'
            },
            es: {
                title: process.env.RESTAURANT_NAME || 'La Casa del Chaufa',
                subtitle: '¡Comida Peruana!',
                highlights: 'Platos Destacados',
                menu: 'Menú Completo',
                unavailable: 'No disponible en este momento',
                generatedAt: 'Generado en',
                page: 'Página'
            }
        };

        const t = translations[lang] || translations.pt;
        const now = new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : 'es-ES');

        const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            padding: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #d4af37;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 36px;
            color: #d4af37;
            margin-bottom: 5px;
        }
        .header h2 {
            font-size: 24px;
            color: #666;
        }
        .generated {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 24px;
            color: #d4af37;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .dish {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
            page-break-inside: avoid;
        }
        .dish.unavailable {
            opacity: 0.6;
            background: #f0f0f0;
        }
        .dish-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .dish-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        .dish.unavailable .dish-name {
            text-decoration: line-through;
        }
        .dish-price {
            font-size: 16px;
            color: #d4af37;
            font-weight: bold;
        }
        .dish-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        .unavailable-badge {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 8px;
        }
        .highlight-dish {
            background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
            border: 2px solid #d4af37;
        }
        .footer {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
        @media print {
            body { padding: 20px; }
            .footer { position: fixed; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${t.title}</h1>
        <h2>${t.subtitle}</h2>
    </div>
    
    <div class="generated">
        ${t.generatedAt}: ${now}
    </div>

    ${destaques.length > 0 ? `
    <div class="section">
        <h3 class="section-title">${t.highlights}</h3>
        ${destaques.map(prato => `
            <div class="dish highlight-dish ${!prato.ativo ? 'unavailable' : ''}">
                <div class="dish-header">
                    <div class="dish-name">${lang === 'pt' ? prato.nome_pt : prato.nome_es}</div>
                    <div class="dish-price">R$ ${prato.preco_brl.toFixed(2)} | Bs. ${prato.preco_bob.toFixed(2)}</div>
                </div>
                ${(lang === 'pt' ? prato.descricao_pt : prato.descricao_es) ? 
                    `<div class="dish-description">${lang === 'pt' ? prato.descricao_pt : prato.descricao_es}</div>` : ''}
                ${!prato.ativo ? `<div class="unavailable-badge">${t.unavailable}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <h3 class="section-title">${t.menu}</h3>
        ${lista.map(prato => `
            <div class="dish ${!prato.ativo ? 'unavailable' : ''}">
                <div class="dish-header">
                    <div class="dish-name">${lang === 'pt' ? prato.nome_pt : prato.nome_es}</div>
                    <div class="dish-price">R$ ${prato.preco_brl.toFixed(2)} | Bs. ${prato.preco_bob.toFixed(2)}</div>
                </div>
                ${(lang === 'pt' ? prato.descricao_pt : prato.descricao_es) ? 
                    `<div class="dish-description">${lang === 'pt' ? prato.descricao_pt : prato.descricao_es}</div>` : ''}
                ${!prato.ativo ? `<div class="unavailable-badge">${t.unavailable}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>
        `;

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="font-size: 10px; text-align: center; width: 100%; color: #999;">
                    ${t.page} <span class="pageNumber"></span> / <span class="totalPages"></span>
                </div>
            `
        });

        await browser.close();

        const filename = `cardapio-${lang}-${Date.now()}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdf);

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        if (browser) {
            await browser.close();
        }
        res.status(500).json({ 
            error: 'Erro ao gerar PDF',
            error_es: 'Error al generar PDF'
        });
    }
});

module.exports = router;

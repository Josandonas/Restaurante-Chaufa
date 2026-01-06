const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

/**
 * Gera PDF do cardápio fazendo screenshot da página real
 * Garante 100% de fidelidade ao que está em tela (CSS, imagens, layout)
 */
router.get('/generate', async (req, res) => {
    let browser;
    try {
        const { lang = 'pt' } = req.query;
        
        // URL do cardápio (localhost durante geração)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const menuUrl = `${baseUrl}/?lang=${lang}`;
        
        // console.log(`📄 Gerando PDF do cardápio em ${lang.toUpperCase()}...`);
        // console.log(`🌐 URL: ${menuUrl}`);

        // Iniciar Puppeteer
        // console.log('🚀 Iniciando Puppeteer...');
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                executablePath: '/usr/bin/chromium-browser',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security'
                ]
            });
            // console.log('✅ Puppeteer iniciado');
        } catch (launchError) {
            console.error('❌ Erro ao iniciar Puppeteer:', launchError);
            throw new Error(`Falha ao iniciar navegador: ${launchError.message}`);
        }

        const page = await browser.newPage();
        // console.log('📄 Nova página criada');
        
        // Configurar viewport para desktop (melhor visualização)
        await page.setViewport({
            width: 1200,
            height: 1600,
            deviceScaleFactor: 2 // Maior qualidade de imagem
        });
        
        // Navegar para a página real do cardápio
        // console.log('⏳ Carregando página...');
        try {
            await page.goto(menuUrl, {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            // console.log('✅ Página carregada');
        } catch (gotoError) {
            console.error('❌ Erro ao carregar página:', gotoError);
            throw new Error(`Não foi possível acessar ${menuUrl}: ${gotoError.message}`);
        }
        
        // Aguardar carregamento completo do conteúdo
        // console.log('⏳ Aguardando renderização completa...');
        await page.waitForSelector('.content', { timeout: 10000 });
        
        // Aguardar imagens carregarem
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
            );
        });
        
        // Selecionar idioma correto
        // console.log(`🌍 Selecionando idioma ${lang}...`);
        await page.evaluate((language) => {
            const langBtn = document.querySelector(`[data-lang="${language}"]`);
            if (langBtn) {
                langBtn.click();
            }
        }, lang);
        
        // Aguardar renderização após mudança de idioma
        await page.waitForTimeout(2000);
        
        // Aguardar que os pratos sejam renderizados
        await page.waitForSelector('.highlight-card, .category-section', { timeout: 10000 });
        
        // Remover elementos que não devem aparecer no PDF
        // console.log('🧹 Removendo elementos desnecessários...');
        await page.evaluate(() => {
            // Remover botões de idioma e PDF
            const headerControls = document.querySelector('.header-controls');
            if (headerControls) headerControls.remove();
            
            // Remover botão flutuante do WhatsApp
            const whatsappFab = document.querySelector('.whatsapp-fab');
            if (whatsappFab) whatsappFab.remove();
            
            // Remover link admin do footer
            const adminLink = document.querySelector('.admin-link-footer');
            if (adminLink) adminLink.remove();
            
            // Ajustar footer para PDF
            const footer = document.querySelector('.footer');
            if (footer) {
                footer.style.position = 'relative';
                footer.style.marginTop = '40px';
            }
            
            // Remover padrão decorativo de fundo (opcional)
            const pattern = document.querySelector('.decorative-pattern');
            if (pattern) pattern.style.opacity = '0.3';
        });
        
        // Debug: Verificar o que foi carregado (descomente se necessário)
        // const pageInfo = await page.evaluate(() => {
        //     return {
        //         title: document.title,
        //         highlightCards: document.querySelectorAll('.highlight-card').length,
        //         categories: document.querySelectorAll('.category-section').length,
        //         images: document.querySelectorAll('img').length,
        //         hasContent: !!document.querySelector('.content'),
        //         bodyHeight: document.body.scrollHeight
        //     };
        // });
        // console.log('📊 Conteúdo da página:', pageInfo);
        
        // Salvar screenshot para debug (opcional - descomente se necessário)
        // await page.screenshot({ path: `debug-${lang}.png`, fullPage: true });
        
        // console.log('📸 Gerando PDF...');
        
        // Gerar PDF com a página completa
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true, // Incluir backgrounds e cores
            margin: {
                top: '8mm',
                right: '8mm',
                bottom: '8mm',
                left: '8mm'
            },
            displayHeaderFooter: false,
            preferCSSPageSize: false,
            scale: 0.75, // Escala menor para caber mais conteúdo
            omitBackground: false // Garantir que backgrounds sejam incluídos
        });

        await browser.close();
        
        // console.log('✅ PDF gerado com sucesso!');

        const filename = `cardapio-la-casa-del-chaufa-${lang}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdf);

    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        console.error('Stack trace:', error.stack);
        
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Erro ao fechar browser:', closeError);
            }
        }
        
        res.status(500).json({ 
            error: 'Erro ao gerar PDF do cardápio',
            error_es: 'Error al generar PDF del menú',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * Endpoint para verificar se o servidor está pronto para gerar PDFs
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Serviço de geração de PDF operacional',
        puppeteer: 'ready'
    });
});

/**
 * Endpoint de teste para verificar se Puppeteer funciona
 */
router.get('/test', async (req, res) => {
    let browser;
    try {
        console.log('🧪 Testando Puppeteer...');
        
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://example.com', { waitUntil: 'networkidle0' });
        const title = await page.title();
        
        await browser.close();
        
        res.json({
            success: true,
            message: 'Puppeteer funcionando!',
            testPage: 'example.com',
            pageTitle: title
        });
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        if (browser) await browser.close();
        
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;

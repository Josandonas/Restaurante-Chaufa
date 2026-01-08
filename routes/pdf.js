const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Detecta o caminho do Chrome/Chromium baseado no ambiente
 */
function getChromePath() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Caminhos possíveis em ordem de prioridade
    const possiblePaths = isDevelopment 
        ? [
            '/usr/bin/google-chrome-stable',  // Desenvolvimento (Arch/Manjaro)
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
        ]
        : [
            '/usr/bin/chromium-browser',      // Produção (Ubuntu/Debian)
            '/usr/bin/chromium',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome'
        ];
    
    // Encontrar primeiro caminho que existe
    for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
            console.log(`✅ Chrome encontrado: ${path}`);
            return path;
        }
    }
    
    // Se nenhum encontrado, retornar null (Puppeteer usará bundled Chromium)
    console.log('⚠️ Chrome não encontrado, usando Chromium bundled do Puppeteer');
    return null;
}

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
            const chromePath = getChromePath();
            const launchOptions = {
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security'
                ]
            };
            
            // Adicionar executablePath apenas se encontrado
            if (chromePath) {
                launchOptions.executablePath = chromePath;
            }
            
            browser = await puppeteer.launch(launchOptions);
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
        
        // Preparar data e hora de geração
        const now = new Date();
        const dateTimeStr = lang === 'pt' 
            ? now.toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'America/La_Paz'
              })
            : now.toLocaleString('es-BO', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'America/La_Paz'
              });
        
        const generatedText = lang === 'pt' ? 'Gerado em' : 'Generado el';
        const pageText = lang === 'pt' ? 'Página' : 'Página';
        const ofText = lang === 'pt' ? 'de' : 'de';
        
        // Gerar PDF com a página completa
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '10mm',
                bottom: '20mm',
                left: '10mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>', // Header vazio
            footerTemplate: `
                <div style="width: 100%; font-size: 9px; padding: 5px 10px; color: #666; border-top: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                    <span style="flex: 1; text-align: left;">
                        ${generatedText}: ${dateTimeStr}
                    </span>
                    <span style="flex: 1; text-align: center; font-weight: 600;">
                        La Casa del Chaufa
                    </span>
                    <span style="flex: 1; text-align: right;">
                        ${pageText} <span class="pageNumber"></span> ${ofText} <span class="totalPages"></span>
                    </span>
                </div>
            `,
            preferCSSPageSize: false,
            scale: 0.75,
            omitBackground: false
        });

        await browser.close();
        
        // console.log('✅ PDF gerado com sucesso!');

        const filename = `cardapio-la-casa-del-chaufa-${lang}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Headers otimizados para compatibilidade universal (Chrome, Firefox, Safari iOS)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdf.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Enviar buffer diretamente
        res.end(pdf, 'binary');

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

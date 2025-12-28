// Estado da aplicação
let currentLang = 'es';
let allDishes = [];
let categories = [];

// Traduções
const translations = {
    es: { 
        loading: 'Cargando menú...', 
        error: 'Error al cargar el menú', 
        highlights: 'Platos Destacados', 
        pdfButton: 'Descargar PDF', 
        footerPhone: 'Pedidos: +591 72622036', 
        footerHours: 'Lunes a jueves, sábado y domingo: 12:00 a 20:00',
        footerLocation: 'Frente a La Rotonda Itacamba Arroyo Concepción- Puerto Quijarro, Bolivia'
    },
    pt: { 
        loading: 'Carregando cardápio...', 
        error: 'Erro ao carregar cardápio', 
        highlights: 'Pratos em Destaque', 
        pdfButton: 'Baixar PDF', 
        footerPhone: 'Pedidos: +591 72622036', 
        footerHours: 'De segunda a quinta-feira, sábado e domingo: 12:00 às 20:00',
        footerLocation: 'Em Frente a Rotatória Itacamba Arroyo Concepción- Puerto Quijarro, Bolivia'
    }
};

// Carregar dados da API
async function loadData() {
    try {
        const dishesResponse = await fetch('/api/pratos/public');
        if (!dishesResponse.ok) throw new Error('Failed to load dishes');
        allDishes = await dishesResponse.json();
        
        const categoriesResponse = await fetch('/api/categorias/public');
        if (!categoriesResponse.ok) throw new Error('Failed to load categories');
        categories = await categoriesResponse.json();
        
        renderMenu();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('content').innerHTML = `
            <div class="error">
                ${translations[currentLang].error}<br>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Renderizar menu completo
function renderMenu() {
    const t = translations[currentLang];
    let html = '';
    
    // Pratos em destaque com agrupamento de variantes
    let highlights = allDishes.filter(d => d.destaque && d.ativo);
    
    // Criar função para normalizar nome (remover variações e parênteses)
    const normalizarNome = (nome) => {
        if (!nome) return '';
        // Remove tudo entre parênteses, hífens extras, e normaliza espaços
        return nome
            .replace(/\([^)]*\)/g, '') // Remove (...)
            .replace(/\s*-\s*[^-]*$/g, '') // Remove "- Grande", "- Especial", etc
            .replace(/\s+/g, ' ') // Normaliza espaços
            .toLowerCase()
            .trim();
    };
    
    // Agrupar pratos com nome base similar (destaque + lista)
    highlights = highlights.map(destaque => {
        const nomeDestaqueNormalizado = normalizarNome(
            currentLang === 'pt' ? destaque.nome_pt : destaque.nome_es
        );
        
        // Buscar pratos na lista com nome base similar
        const pratosLista = allDishes.filter(d => {
            if (d.destaque || !d.ativo) return false;
            const nomeListaNormalizado = normalizarNome(
                currentLang === 'pt' ? d.nome_pt : d.nome_es
            );
            return nomeListaNormalizado === nomeDestaqueNormalizado;
        });
        
        // Se encontrou pratos duplicados, agrupar preços
        if (pratosLista.length > 0) {
            return {
                ...destaque,
                precos_variantes: [
                    { preco_bob: destaque.preco_bob, preco_brl: destaque.preco_brl },
                    ...pratosLista.map(p => ({ preco_bob: p.preco_bob, preco_brl: p.preco_brl }))
                ]
            };
        }
        
        return destaque;
    });
    
    if (highlights.length > 0) {
        html += `
            <div class="highlights-section">
                <div class="highlights-grid">
                    ${highlights.map(dish => renderHighlightCard(dish)).join('')}
                </div>
            </div>
        `;
    }
    
    // Pratos por categoria (removendo duplicados que já aparecem em destaques)
    const nomesDestaquesNormalizados = highlights.map(d => {
        const nome = currentLang === 'pt' ? d.nome_pt : d.nome_es;
        return normalizarNome(nome);
    });
    
    categories.forEach(category => {
        const categoryDishes = allDishes.filter(d => {
            if (d.categoria_id !== category.id || d.destaque || !d.ativo) return false;
            
            // Remover se já aparece nos destaques (usando nome normalizado)
            const nome = currentLang === 'pt' ? d.nome_pt : d.nome_es;
            const nomeNormalizado = normalizarNome(nome);
            return !nomesDestaquesNormalizados.includes(nomeNormalizado);
        });
        
        if (categoryDishes.length > 0) {
            html += renderCategorySection(category, categoryDishes);
        }
    });
    
    document.getElementById('content').innerHTML = html;
}

// Renderizar card de prato em destaque (layout circular)
function renderHighlightCard(dish) {
    const name = currentLang === 'pt' ? dish.nome_pt : dish.nome_es;
    const description = currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es;
    const currency = currentLang === 'pt' ? 'R$' : 'Bs.';
    
    // Se tem variantes de preço, renderizar múltiplas bolhas
    let priceBadgesHtml = '';
    if (dish.precos_variantes && dish.precos_variantes.length > 0) {
        priceBadgesHtml = dish.precos_variantes.map((variante, index) => {
            const priceValue = currentLang === 'pt' ? Number(variante.preco_brl) : Number(variante.preco_bob);
            return `
                <div class="highlight-price-badge" style="${index > 0 ? 'top: ' + (10 + index * 55) + 'px;' : ''}">
                    <span class="currency">${currency}</span>
                    <span class="amount">${priceValue.toFixed(0)}</span>
                </div>
            `;
        }).join('');
    } else {
        // Preço único
        const priceValue = currentLang === 'pt' ? Number(dish.preco_brl) : Number(dish.preco_bob);
        priceBadgesHtml = `
            <div class="highlight-price-badge">
                <span class="currency">${currency}</span>
                <span class="amount">${priceValue.toFixed(0)}</span>
            </div>
        `;
    }
    
    return `
        <div class="highlight-card">
            <div class="highlight-image-wrapper">
                ${dish.imagem_url 
                    ? `<img src="${dish.imagem_url}" alt="${name}" class="highlight-image">` 
                    : `<div class="highlight-image">🍽️</div>`
                }
                ${priceBadgesHtml}
            </div>
            <div class="highlight-name">${name}</div>
            ${description ? `<div class="highlight-description">${description}</div>` : ''}
        </div>
    `;
}

// Renderizar seção de categoria
function renderCategorySection(category, dishes) {
    const categoryName = currentLang === 'pt' ? category.nome_pt : category.nome_es;
    
    // Agrupar pratos com mesmo nome
    const groupedDishes = groupDishesByName(dishes);
    
    return `
        <div class="category-section">
            <div class="category-header">
                <h2 class="category-title">${categoryName}</h2>
            </div>
            <div class="dishes-list">
                ${groupedDishes.map(dishGroup => renderDishItem(dishGroup)).join('')}
            </div>
        </div>
    `;
}

// Agrupar pratos com mesmo nome
function groupDishesByName(dishes) {
    const grouped = {};
    
    dishes.forEach(dish => {
        const fullName = currentLang === 'pt' ? dish.nome_pt : dish.nome_es;
        
        // Normalizar nome removendo sufixos de tamanho/porção
        const baseName = fullName
            .replace(/\s*-\s*(Grande|Pequeno|Médio|Medio|grande|pequeno|médio|medio)$/i, '')
            .replace(/\s*-\s*(Chico|Mediano|chico|mediano)$/i, '')
            .trim();
        
        if (!grouped[baseName]) {
            grouped[baseName] = {
                ...dish,
                nome_pt: baseName,
                nome_es: baseName,
                prices: []
            };
        }
        
        const priceValue = currentLang === 'pt' ? Number(dish.preco_brl) : Number(dish.preco_bob);
        if (priceValue > 0) {
            grouped[baseName].prices.push(priceValue);
        }
    });
    
    // Converter objeto em array e ordenar preços
    return Object.values(grouped).map(dish => {
        dish.prices.sort((a, b) => a - b);
        return dish;
    });
}

// Renderizar item de prato
function renderDishItem(dish) {
    const name = currentLang === 'pt' ? dish.nome_pt : dish.nome_es;
    const description = currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es;
    const currency = currentLang === 'pt' ? 'R$' : 'Bs.';
    
    // Se tem múltiplos preços (array prices), mostrar separados por vírgula
    let priceDisplay;
    if (dish.prices && dish.prices.length > 0) {
        // Múltiplos preços
        priceDisplay = dish.prices.map(price => `${currency} ${price.toFixed(2)}`).join(', ');
    } else {
        // Preço único
        const priceValue = currentLang === 'pt' ? Number(dish.preco_brl) : Number(dish.preco_bob);
        if (priceValue === 0 || priceValue === 0.00) {
            priceDisplay = description || (currentLang === 'pt' ? 'Temos Diversos Tipos' : 'Tenemos Diversos Tipos');
        } else {
            priceDisplay = `${currency} ${priceValue.toFixed(2)}`;
        }
    }
    
    const hasPrice = dish.prices ? dish.prices.length > 0 : (currentLang === 'pt' ? Number(dish.preco_brl) : Number(dish.preco_bob)) > 0;
    
    return `
        <div class="dish-item">
            ${dish.imagem_url ? `
                <div class="dish-mini-image">
                    <img src="${dish.imagem_url}" alt="${name}">
                </div>
            ` : ''}
            <div class="dish-info">
                <div class="dish-name">
                    ${name}
                    ${hasPrice && description ? `<span class="dish-description">${description}</span>` : ''}
                </div>
            </div>
            <div class="dish-prices">
                <span class="price-value">${priceDisplay}</span>
            </div>
        </div>
    `;
}

// Atualizar textos do idioma
function updateLanguage() {
    const t = translations[currentLang];
    
    const pdfTextEl = document.getElementById('pdfText');
    if (pdfTextEl) pdfTextEl.textContent = t.pdfButton;
    
    const footerPhoneEl = document.getElementById('footerPhone');
    if (footerPhoneEl) footerPhoneEl.textContent = t.footerPhone;
    
    const footerHoursEl = document.getElementById('footerHours');
    if (footerHoursEl) footerHoursEl.textContent = t.footerHours;
    
    const footerLocationEl = document.getElementById('footerLocation');
    if (footerLocationEl) footerLocationEl.textContent = t.footerLocation;
    
    renderMenu();
}

// Função para ajustar logo circular perfeitamente
function adjustCircularLogo() {
    const logoContainer = document.querySelector('.logo-container');
    const logoImg = document.querySelector('.logo-container img');
    
    if (!logoContainer || !logoImg) return;
    
    // Aguardar carregamento da imagem
    if (!logoImg.complete) {
        logoImg.addEventListener('load', () => adjustCircularLogo());
        return;
    }
    
    const containerSize = logoContainer.offsetWidth;
    const imgWidth = logoImg.naturalWidth;
    const imgHeight = logoImg.naturalHeight;
    const aspectRatio = imgWidth / imgHeight;
    
    // Se a imagem for mais larga que alta (horizontal)
    if (aspectRatio > 1) {
        logoImg.style.width = 'auto';
        logoImg.style.height = '100%';
        logoImg.style.maxWidth = 'none';
    } 
    // Se a imagem for mais alta que larga (vertical)
    else if (aspectRatio < 1) {
        logoImg.style.width = '100%';
        logoImg.style.height = 'auto';
        logoImg.style.maxHeight = 'none';
    }
    // Se for quadrada
    else {
        logoImg.style.width = '100%';
        logoImg.style.height = '100%';
    }
    
    // Centralizar perfeitamente
    logoImg.style.objectFit = 'contain';
    logoImg.style.objectPosition = 'center';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados
    loadData();
    
    // Ajustar logo circular
    adjustCircularLogo();
    
    // Reajustar em redimensionamento
    window.addEventListener('resize', adjustCircularLogo);
    
    // Configurar botões de idioma
    document.querySelectorAll('.btn-lang').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            
            document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            updateLanguage();
        });
    });
    
    // Configurar botão de PDF
    const pdfBtn = document.getElementById('downloadPdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generatePDF);
    }
});

// Gerar PDF do cardápio
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const t = translations[currentLang];
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Título
    doc.setFontSize(22);
    doc.setTextColor(200, 70, 60);
    doc.text('La Casa del Chaufa', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(currentLang === 'pt' ? 'Cardápio' : 'Menú', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Linha separadora
    doc.setDrawColor(200, 70, 60);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // Pratos em destaque
    const highlights = allDishes.filter(d => d.destaque && d.ativo);
    if (highlights.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(220, 180, 140);
        doc.text(t.highlights.toUpperCase(), margin, yPos);
        yPos += 8;
        
        highlights.forEach(dish => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            const name = currentLang === 'pt' ? dish.nome_pt : dish.nome_es;
            const price = currentLang === 'pt' 
                ? `R$ ${Number(dish.preco_brl).toFixed(2)}` 
                : `Bs. ${Number(dish.preco_bob).toFixed(2)}`;
            
            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            doc.setFont(undefined, 'bold');
            doc.text(name, margin + 5, yPos);
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(200, 70, 60);
            doc.text(price, pageWidth - margin - 5, yPos, { align: 'right' });
            
            yPos += 7;
        });
        
        yPos += 5;
    }
    
    // Pratos por categoria
    categories.forEach(category => {
        const categoryDishes = allDishes.filter(d => 
            d.categoria_id === category.id && !d.destaque && d.ativo
        );
        
        if (categoryDishes.length > 0) {
            if (yPos > 260) {
                doc.addPage();
                yPos = 20;
            }
            
            // Título da categoria
            doc.setFontSize(14);
            doc.setTextColor(220, 180, 140);
            const categoryName = currentLang === 'pt' ? category.nome_pt : category.nome_es;
            doc.text(categoryName.toUpperCase(), margin, yPos);
            yPos += 8;
            
            // Pratos da categoria
            categoryDishes.forEach(dish => {
                if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                }
                
                const name = currentLang === 'pt' ? dish.nome_pt : dish.nome_es;
                const description = currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es;
                const price = currentLang === 'pt' 
                    ? `R$ ${Number(dish.preco_brl).toFixed(2)}` 
                    : `Bs. ${Number(dish.preco_bob).toFixed(2)}`;
                
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                doc.setFont(undefined, 'bold');
                doc.text(name, margin + 5, yPos);
                
                doc.setFont(undefined, 'normal');
                doc.setTextColor(200, 70, 60);
                doc.text(price, pageWidth - margin - 5, yPos, { align: 'right' });
                
                yPos += 5;
                
                if (description) {
                    doc.setFontSize(8);
                    doc.setTextColor(120, 120, 120);
                    const lines = doc.splitTextToSize(description, contentWidth - 10);
                    doc.text(lines, margin + 5, yPos);
                    yPos += lines.length * 4;
                }
                
                yPos += 3;
            });
            
            yPos += 5;
        }
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('La Casa del Chaufa - +591 72622036', pageWidth / 2, 285, { align: 'center' });
    }
    
    // Salvar PDF
    const fileName = currentLang === 'pt' ? 'cardapio-la-casa-del-chaufa.pdf' : 'menu-la-casa-del-chaufa.pdf';
    doc.save(fileName);
}

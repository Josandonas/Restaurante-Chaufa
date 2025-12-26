let currentLang = 'es';
let allDishes = [];
let categories = [];

const translations = {
    es: {
        loading: 'Cargando menú...',
        error: 'Error al cargar el menú',
        highlights: 'Platos Destacados',
        pdfButton: 'Descargar PDF',
        footerPhone: 'Pedidos: (11) 1234-5678',
        footerHours: 'Lun-Dom: 11:00 - 23:00'
    },
    pt: {
        loading: 'Carregando cardápio...',
        error: 'Erro ao carregar cardápio',
        highlights: 'Pratos em Destaque',
        pdfButton: 'Baixar PDF',
        footerPhone: 'Pedidos: (11) 1234-5678',
        footerHours: 'Seg-Dom: 11:00 - 23:00'
    }
};

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
            <div class="error">${translations[currentLang].error}<br><small>${error.message}</small></div>
        `;
    }
}

function renderMenu() {
    const t = translations[currentLang];
    let html = '';

    const highlights = allDishes.filter(d => d.destaque && d.ativo);
    if (highlights.length > 0) {
        html += `
            <div class="highlights-section">
                <h2 class="highlights-title">${t.highlights}</h2>
                <div class="highlights-grid">
                    ${highlights.map(dish => `
                        <div class="highlight-card">
                            ${dish.imagem_url ? 
                                `<img src="${dish.imagem_url}" alt="${currentLang === 'pt' ? dish.nome_pt : dish.nome_es}" class="highlight-image">` :
                                `<div class="highlight-image">🍽️</div>`
                            }
                            <div class="highlight-content">
                                <div class="highlight-name">${currentLang === 'pt' ? dish.nome_pt : dish.nome_es}</div>
                                ${(currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es) ? 
                                    `<div class="highlight-description">${currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es}</div>` : ''}
                                <div class="highlight-prices">
                                    <div class="highlight-price-value">${currentLang === 'pt' ? `R$ ${Number(dish.preco_brl).toFixed(2)}` : `Bs. ${Number(dish.preco_bob).toFixed(2)}`}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    categories.forEach(category => {
        const categoryDishes = allDishes.filter(d => 
            d.categoria_id === category.id && !d.destaque && d.ativo
        );

        if (categoryDishes.length > 0) {
            const categoryName = currentLang === 'pt' ? category.nome_pt : category.nome_es;

            html += `
                <div class="category-section">
                    <div class="category-header">
                        <h2 class="category-title">${categoryName}</h2>
                    </div>
                    <div class="dishes-list">
                        ${categoryDishes.map(dish => `
                            <div class="dish-item">
                                <div style="flex: 1;">
                                    <div class="dish-name">
                                        ${currentLang === 'pt' ? dish.nome_pt : dish.nome_es}
                                        ${(currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es) ? 
                                            `<span class="dish-description">${currentLang === 'pt' ? dish.descricao_pt : dish.descricao_es}</span>` : ''}
                                    </div>
                                </div>
                                <div class="dish-prices">
                                    <span class="price-value">
                                        ${currentLang === 'pt' ? `R$ ${Number(dish.preco_brl).toFixed(2)}` : `Bs. ${Number(dish.preco_bob).toFixed(2)}`}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    document.getElementById('content').innerHTML = html;
}

function updateLanguage() {
    const t = translations[currentLang];
    
    const pdfTextEl = document.getElementById('pdfText');
    if (pdfTextEl) pdfTextEl.textContent = t.pdfButton;
    
    const footerPhoneEl = document.getElementById('footerPhone');
    if (footerPhoneEl) footerPhoneEl.textContent = t.footerPhone;
    
    const footerHoursEl = document.getElementById('footerHours');
    if (footerHoursEl) footerHoursEl.textContent = t.footerHours;
    
    renderMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    document.querySelectorAll('.btn-lang').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            
            document.querySelectorAll('.btn-lang').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            updateLanguage();
        });
    });

    document.getElementById('downloadPdf')?.addEventListener('click', () => {
        window.print();
    });
});

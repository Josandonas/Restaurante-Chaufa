// Controller de Pratos
import dishService from '../services/DishService.js';
import categoryService from '../services/CategoryService.js';
import toast from '../utils/toast.js';
import loading from '../utils/loading.js';
import i18n from '../utils/i18n.js';
import paginationHelper from '../utils/PaginationHelper.js';

class DishController {
    constructor() {
        this.currentTab = 'lista';
        this.editingDish = null;
        this.dishes = [];
        this.searchTerm = '';
        this.selectedCategory = '';
        this.contextualButtonSetup = false;
    }

    async loadDishes() {
        try {
            const dishes = await dishService.getAll();
            this.dishes = dishes;
            this.filterAndRenderLista();
            this.filterAndRenderDestaques();
            await this.loadCategoryFilters();
            this.setupSearchListeners();
            this.setupContextualButton();
        } catch (error) {
            console.error('Error loading dishes:', error);
        }
    }

    async loadCategoryFilters() {
        try {
            const categorias = await categoryService.getAll();
            const filterLista = document.getElementById('filterCategoriaLista');
            const filterDestaques = document.getElementById('filterCategoriaDestaques');
            
            const lang = i18n.getCurrentLanguage();
            const allText = lang === 'pt' ? 'Todas as categorias' : 'Todas las categorías';
            
            [filterLista, filterDestaques].forEach(select => {
                if (select) {
                    select.innerHTML = `<option value="">${allText}</option>`;
                    categorias.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = lang === 'pt' ? cat.nome_pt : cat.nome_es;
                        select.appendChild(option);
                    });
                }
            });
        } catch (error) {
            console.error('Error loading category filters:', error);
        }
    }

    setupSearchListeners() {
        // Busca em Pratos em Lista
        const searchLista = document.getElementById('searchLista');
        const filterLista = document.getElementById('filterCategoriaLista');
        
        if (searchLista) {
            searchLista.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndRenderLista();
            });
        }
        
        if (filterLista) {
            filterLista.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.filterAndRenderLista();
            });
        }
        
        // Busca em Pratos em Destaque
        const searchDestaques = document.getElementById('searchDestaques');
        const filterDestaques = document.getElementById('filterCategoriaDestaques');
        
        if (searchDestaques) {
            searchDestaques.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndRenderDestaques();
            });
        }
        
        if (filterDestaques) {
            filterDestaques.addEventListener('change', (e) => {
                this.selectedCategory = e.target.value;
                this.filterAndRenderDestaques();
            });
        }
    }

    filterAndRenderLista() {
        let filtered = this.dishes.filter(d => !d.destaque);
        
        // Filtrar por busca
        if (this.searchTerm) {
            const lang = i18n.getCurrentLanguage();
            filtered = filtered.filter(d => {
                const name = lang === 'pt' ? d.nome_pt : d.nome_es;
                return name.toLowerCase().includes(this.searchTerm);
            });
        }
        
        // Filtrar por categoria
        if (this.selectedCategory) {
            filtered = filtered.filter(d => d.categoria_id == this.selectedCategory);
        }
        
        // Aplicar paginação
        const paginationData = paginationHelper.paginate(filtered, 'lista');
        this.renderListaDishes(paginationData.items);
        
        // Renderizar controles de paginação
        paginationHelper.renderPaginationControls(
            'paginationLista',
            paginationData,
            'lista',
            (page) => {
                paginationHelper.goToPage('lista', page);
                this.filterAndRenderLista();
            }
        );
    }

    filterAndRenderDestaques() {
        let filtered = this.dishes.filter(d => d.destaque);
        
        // Filtrar por busca
        if (this.searchTermDestaques && this.searchTermDestaques.length > 0) {
            const lang = i18n.getCurrentLanguage();
            const searchLower = this.searchTermDestaques.toLowerCase();
            filtered = filtered.filter(d => {
                const name = lang === 'pt' ? d.nome_pt : d.nome_es;
                const desc = lang === 'pt' ? d.descricao_pt : d.descricao_es;
                return name.toLowerCase().includes(searchLower) || 
                       (desc && desc.toLowerCase().includes(searchLower));
            });
        }
        
        // Filtrar por categoria
        if (this.selectedCategoryDestaques && this.selectedCategoryDestaques !== '') {
            filtered = filtered.filter(d => d.categoria_id == this.selectedCategoryDestaques);
        }
        
        // Aplicar paginação
        const paginationData = paginationHelper.paginate(filtered, 'destaques');
        this.renderDestaquesDishes(paginationData.items, filtered);
        
        // Renderizar controles de paginação
        paginationHelper.renderPaginationControls(
            'paginationDestaques',
            paginationData,
            'destaques',
            (page) => {
                paginationHelper.goToPage('destaques', page);
                this.filterAndRenderDestaques();
            }
        );
    }

    renderListaDishes(dishes) {
        const tbody = document.querySelector('#listaTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        dishes.forEach(dish => {
            const row = document.createElement('tr');
            const dishName = i18n.getCurrentLanguage() === 'pt' ? dish.nome_pt : dish.nome_es;
            const statusText = dish.ativo ? i18n.t('active') : i18n.t('inactive');
            const statusClass = dish.ativo ? 'status-active' : 'status-inactive';
            
            const markFeaturedText = i18n.t('markAsFeatured');
            const editText = i18n.t('editTooltip');
            const deleteText = i18n.t('deleteTooltip');
            
            row.innerHTML = `
                <td>${dishName}</td>
                <td>R$ ${parseFloat(dish.preco_brl).toFixed(2)}</td>
                <td>Bs. ${parseFloat(dish.preco_bob).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-star" onclick="window.dishController.toggleDestaque(${dish.id}, true)" title="${markFeaturedText}">
                            ⭐
                        </button>
                        <button class="action-btn action-btn-edit" onclick="window.dishController.editDish(${dish.id})" title="${editText}">
                            ✏️
                        </button>
                        <button class="action-btn action-btn-delete" onclick="window.app.openDeleteModal('dish', ${dish.id}, '${dishName.replace(/'/g, "\\'")}')" title="${deleteText}">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Renderizar cards mobile
        this.renderMobileCards('lista', dishes);

        // Ocultar botões de deletar se for editor
        if (window.currentUserRole === 'editor') {
            this.hideDeleteButtonsInList();
        }
    }

    renderMobileCards(type, dishes) {
        const container = document.getElementById(`${type}MobileCards`);
        if (!container) {
            const tableContainer = document.querySelector(`#${type}Table`)?.closest('.table-container');
            if (tableContainer) {
                const cardsContainer = document.createElement('div');
                cardsContainer.id = `${type}MobileCards`;
                cardsContainer.className = 'dishes-mobile-cards';
                tableContainer.parentNode.insertBefore(cardsContainer, tableContainer.nextSibling);
            } else {
                return;
            }
        }

        const cardsContainer = document.getElementById(`${type}MobileCards`);
        cardsContainer.innerHTML = '';

        dishes.forEach((dish, index) => {
            const dishName = i18n.getCurrentLanguage() === 'pt' ? dish.nome_pt : dish.nome_es;
            const categoryName = dish.categoria_nome_pt || dish.categoria_nome_es || '-';
            const statusText = dish.ativo ? i18n.t('active') : i18n.t('inactive');
            const statusClass = dish.ativo ? 'active' : 'inactive';
            const destacadoText = dish.destaque ? (i18n.getCurrentLanguage() === 'pt' ? 'Sim' : 'Sí') : 'Não';
            
            const card = document.createElement('div');
            card.className = 'dish-card-mobile';
            
            const imageHtml = dish.imagem_url 
                ? `<img src="${dish.imagem_url}" alt="${dishName}" class="dish-card-image" onerror="this.parentElement.innerHTML='<div class=\\'dish-card-image-placeholder\\'>🍽️</div>'">`
                : `<div class="dish-card-image-placeholder">🍽️</div>`;
            
            // Controles de ordem para Destaques
            let orderControls = '';
            if (type === 'destaques') {
                const isFirst = index === 0;
                const isLast = index === dishes.length - 1;
                orderControls = `
                    <div class="category-order-mobile">
                        <button class="order-btn-mobile" onclick="window.dishController.moveDestaqueUp(${dish.id})" ${isFirst ? 'disabled' : ''}>▲</button>
                        <span class="order-number-mobile">${dish.ordem}</span>
                        <button class="order-btn-mobile" onclick="window.dishController.moveDestaqueDown(${dish.id})" ${isLast ? 'disabled' : ''}>▼</button>
                    </div>
                `;
            }
            
            const highlightBtn = type === 'lista' 
                ? `<button class="dish-card-btn dish-card-btn-highlight" onclick="window.dishController.toggleDestaque(${dish.id}, true)">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ${i18n.t('markAsFeatured')}
                   </button>`
                : `<button class="dish-card-btn dish-card-btn-highlight" onclick="window.dishController.toggleDestaque(${dish.id}, false)">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                    ${i18n.t('removeFeatured')}
                   </button>`;
            
            const deleteBtn = window.currentUserRole !== 'editor' 
                ? `<button class="dish-card-btn dish-card-btn-delete" onclick="window.app.openDeleteModal('dish', ${dish.id}, '${dishName.replace(/'/g, "\\'")}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    ${i18n.t('deleteTooltip')}
                   </button>`
                : '';
            
            card.innerHTML = `
                <div class="dish-card-header">
                    <div class="dish-card-info">
                        <div class="dish-card-name">${dishName}</div>
                        <span class="dish-card-category">${categoryName}</span>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        ${imageHtml}
                        ${orderControls}
                    </div>
                </div>
                <div class="dish-card-details">
                    <div class="dish-card-detail">
                        <span class="dish-card-detail-label">${i18n.getCurrentLanguage() === 'pt' ? 'Preço (R$)' : 'Precio (R$)'}</span>
                        <span class="dish-card-detail-value dish-card-price">R$ ${parseFloat(dish.preco_brl).toFixed(2)}</span>
                    </div>
                    <div class="dish-card-detail">
                        <span class="dish-card-detail-label">${i18n.getCurrentLanguage() === 'pt' ? 'Preço (Bs.)' : 'Precio (Bs.)'}</span>
                        <span class="dish-card-detail-value dish-card-price">Bs. ${parseFloat(dish.preco_bob).toFixed(2)}</span>
                    </div>
                    <div class="dish-card-detail">
                        <span class="dish-card-detail-label">${i18n.getCurrentLanguage() === 'pt' ? 'Estado' : 'Estado'}</span>
                        <span class="dish-card-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="dish-card-detail">
                        <span class="dish-card-detail-label">${i18n.getCurrentLanguage() === 'pt' ? 'Ordem' : 'Orden'}</span>
                        <span class="dish-card-detail-value">${type === 'destaques' ? dish.ordem : destacadoText}</span>
                    </div>
                </div>
                <div class="dish-card-actions">
                    ${highlightBtn}
                    <button class="dish-card-btn dish-card-btn-edit" onclick="window.dishController.editDish(${dish.id})">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        ${i18n.t('editTooltip')}
                    </button>
                    ${deleteBtn}
                </div>
            `;
            
            cardsContainer.appendChild(card);
        });
    }

    hideDeleteButtonsInList() {
        const deleteButtons = document.querySelectorAll('.action-btn-delete');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    getImagePlaceholder() {
        return `<div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; font-size: 28px;">🍽️</div>`;
    }

    renderDestaquesDishes(dishes, allDestaques = null) {
        const tbody = document.querySelector('#destaquesTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Se não foi passada a lista completa, usar a lista paginada
        const fullList = allDestaques || dishes;
        const sortedFullList = [...fullList].sort((a, b) => a.ordem - b.ordem);
        
        dishes.sort((a, b) => a.ordem - b.ordem);
        
        dishes.forEach((dish) => {
            const row = document.createElement('tr');
            const dishName = i18n.getCurrentLanguage() === 'pt' ? dish.nome_pt : dish.nome_es;
            const statusText = dish.ativo ? i18n.t('active') : i18n.t('inactive');
            const statusClass = dish.ativo ? 'status-active' : 'status-inactive';
            
            const removeFeaturedText = i18n.t('removeFeatured');
            const editText = i18n.t('editTooltip');
            const deleteText = i18n.t('deleteTooltip');
            const moveUpText = 'Mover para cima';
            const moveDownText = 'Mover para baixo';
            
            // Calcular isFirst e isLast baseado na lista completa, não na página
            const globalIndex = sortedFullList.findIndex(d => d.id === dish.id);
            const isFirst = globalIndex === 0;
            const isLast = globalIndex === sortedFullList.length - 1;
            
            row.innerHTML = `
                <td><div class="dish-image-cell" data-image="${dish.imagem_url || ''}" data-name="${dishName}"></div></td>
                <td>${dishName}</td>
                <td>R$ ${parseFloat(dish.preco_brl).toFixed(2)}</td>
                <td>Bs. ${parseFloat(dish.preco_bob).toFixed(2)}</td>
                <td>
                    <div class="order-controls">
                        <button class="order-btn" onclick="window.dishController.moveDestaqueUp(${dish.id})" ${isFirst ? 'disabled' : ''} title="${moveUpText}">
                            ▲
                        </button>
                        <span class="order-number">${dish.ordem}</span>
                        <button class="order-btn" onclick="window.dishController.moveDestaqueDown(${dish.id})" ${isLast ? 'disabled' : ''} title="${moveDownText}">
                            ▼
                        </button>
                    </div>
                </td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-star-remove" onclick="window.dishController.toggleDestaque(${dish.id}, false)" title="${removeFeaturedText}">
                            ⭐
                        </button>
                        <button class="action-btn action-btn-edit" onclick="window.dishController.editDish(${dish.id})" title="${editText}">
                            ✏️
                        </button>
                        <button class="action-btn action-btn-delete" onclick="window.app.openDeleteModal('dish', ${dish.id}, '${dishName.replace(/'/g, "\\'")}')" title="${deleteText}">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
            
            // Carregar imagem de forma segura após inserir no DOM
            const imageCell = row.querySelector('.dish-image-cell');
            if (imageCell) {
                this.loadDishImage(imageCell, dish.imagem_url, dishName);
            }
        });

        // Renderizar cards mobile
        this.renderMobileCards('destaques', dishes);

        // Ocultar botões de deletar se for editor
        if (window.currentUserRole === 'editor') {
            this.hideDeleteButtonsInDestaques();
        }
    }

    hideDeleteButtonsInDestaques() {
        const deleteButtons = document.querySelectorAll('.action-btn-delete');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    async loadDishImage(container, imageUrl, dishName) {
        if (!imageUrl || imageUrl.trim() === '') {
            container.innerHTML = this.getImagePlaceholder();
            return;
        }

        // Normalizar URL - se não tiver protocolo nem caminho, assumir que está em /uploads/pratos/
        let normalizedUrl = imageUrl;
        if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('/')) {
            normalizedUrl = `/uploads/pratos/${imageUrl}`;
        }

        // Verificar se o arquivo existe ANTES de tentar carregar
        try {
            const response = await fetch(normalizedUrl, { method: 'HEAD' });
            if (!response.ok) {
                container.innerHTML = this.getImagePlaceholder();
                return;
            }
        } catch (error) {
            container.innerHTML = this.getImagePlaceholder();
            return;
        }

        // Arquivo existe, carregar imagem
        const img = new Image();
        img.onload = () => {
            container.innerHTML = `<img src="${normalizedUrl}" alt="${dishName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`;
        };
        img.onerror = () => {
            container.innerHTML = this.getImagePlaceholder();
        };
        img.src = normalizedUrl;
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        // Remove active de todos os botões e conteúdos
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Adiciona active ao botão e conteúdo corretos
        const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
        const tabContent = document.getElementById(`tab-${tab}`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
        
        // Atualiza apenas o texto do botão contextual
        this.updateContextualButton(tab);
        
        // Recarrega dados se necessário
        if (tab === 'categorias') {
            window.categoryController.loadCategories();
        }
    }

    setupContextualButton() {
        if (this.contextualButtonSetup) return;
        
        const btn = document.getElementById('contextualAddBtn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            if (this.currentTab === 'categorias') {
                window.categoryController.openAddModal();
            } else {
                this.openAddDishModal();
            }
        });
        
        this.contextualButtonSetup = true;
    }

    updateContextualButton(tab) {
        const textSpan = document.getElementById('contextualAddText');
        if (!textSpan) return;
        
        const lang = i18n.getCurrentLanguage();
        
        if (tab === 'categorias') {
            const text = lang === 'pt' ? 'Adicionar Categoria' : 'Agregar Categoría';
            textSpan.textContent = '➕ ' + text;
        } else {
            const text = lang === 'pt' ? 'Adicionar Prato' : 'Agregar Plato';
            textSpan.textContent = '➕ ' + text;
        }
    }

    async openAddDishModal() {
        this.editingDish = null;
        this.shouldRemoveImage = false;
        const modal = document.getElementById('dishModal');
        const form = document.getElementById('dishForm');
        const title = document.getElementById('dishModalTitle');
        
        const lang = i18n.getCurrentLanguage();
        if (title) title.textContent = lang === 'pt' ? 'Adicionar Prato' : 'Agregar Plato';
        if (form) form.reset();
        
        const dishId = document.getElementById('dishId');
        const ordem = document.getElementById('ordem');
        if (dishId) dishId.value = '';
        if (ordem) ordem.value = '0';
        
        await this.loadCategoriesSelect();
        
        if (modal) modal.classList.add('active');
    }

    async loadCategoriesSelect() {
        try {
            const categorias = await categoryService.getActive();
            const select = document.getElementById('categoriaId');
            if (!select) return;

            const lang = i18n.getCurrentLanguage();
            select.innerHTML = '<option value="">Sem categoria</option>';
            
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = lang === 'pt' ? cat.nome_pt : cat.nome_es;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    closeDishModal() {
        const modal = document.getElementById('dishModal');
        if (modal) modal.classList.remove('active');
        this.editingDish = null;
    }

    async editDish(id) {
        try {
            const dish = await dishService.getById(id);
            if (!dish) {
                toast.error('Prato não encontrado');
                return;
            }
            
            this.editingDish = dish;
            this.shouldRemoveImage = false;
            
            await this.loadCategoriesSelect();
            
            const elements = {
                title: document.getElementById('dishModalTitle'),
                dishId: document.getElementById('dishId'),
                dishTipo: document.getElementById('dishTipo'),
                nomePt: document.getElementById('nomePt'),
                nomeEs: document.getElementById('nomeEs'),
                descricaoPt: document.getElementById('descricaoPt'),
                descricaoEs: document.getElementById('descricaoEs'),
                precoBrl: document.getElementById('precoBrl'),
                precoBob: document.getElementById('precoBob'),
                categoriaId: document.getElementById('categoriaId'),
                ativo: document.getElementById('ativo'),
                ordem: document.getElementById('ordem'),
                imagePreview: document.getElementById('imagePreview'),
                imageContainer: document.querySelector('.image-preview-container')
            };
            
            if (elements.title) {
                elements.title.textContent = dish.destaque 
                    ? `${i18n.t('edit')} - ${i18n.t('tabFeatured')}` 
                    : `${i18n.t('edit')} - ${i18n.t('tabList')}`;
            }
            
            if (elements.dishId) elements.dishId.value = dish.id;
            if (elements.nomePt) elements.nomePt.value = dish.nome_pt;
            if (elements.nomeEs) elements.nomeEs.value = dish.nome_es;
            if (elements.descricaoPt) elements.descricaoPt.value = dish.descricao_pt || '';
            if (elements.descricaoEs) elements.descricaoEs.value = dish.descricao_es || '';
            if (elements.precoBrl) elements.precoBrl.value = dish.preco_brl;
            if (elements.precoBob) elements.precoBob.value = dish.preco_bob;
            if (elements.categoriaId) elements.categoriaId.value = dish.categoria_id || '';
            if (elements.ativo) elements.ativo.checked = dish.ativo;
            if (elements.ordem) elements.ordem.value = dish.ordem || 0;
            
            // Configurar preview de imagem
            const uploadBox = document.getElementById('uploadBox');
            const imagePreviewContainer = document.getElementById('imagePreviewContainer');
            
            if (dish.imagem_url) {
                // Carregar imagem existente com fallback
                const img = new Image();
                img.onload = () => {
                    if (elements.imagePreview) elements.imagePreview.src = dish.imagem_url;
                    if (imagePreviewContainer) imagePreviewContainer.classList.add('active');
                    if (uploadBox) uploadBox.style.display = 'none';
                };
                img.onerror = () => {
                    // Se imagem falhar, mostrar placeholder
                    if (elements.imagePreview) {
                        elements.imagePreview.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESem imagem%3C/text%3E%3C/svg%3E';
                    }
                    if (imagePreviewContainer) imagePreviewContainer.classList.add('active');
                    if (uploadBox) uploadBox.style.display = 'none';
                };
                img.src = dish.imagem_url;
            } else {
                if (imagePreviewContainer) imagePreviewContainer.classList.remove('active');
                if (uploadBox) uploadBox.style.display = 'flex';
            }
            
            const modal = document.getElementById('dishModal');
            if (modal) modal.classList.add('active');
        } catch (error) {
            console.error('Error loading dish:', error);
            toast.error('Erro ao carregar prato');
        }
    }

    async deleteDish(id) {
        loading.show();
        try {
            // Verificar se o prato deletado era destaque
            const dish = this.dishes.find(d => d.id == id);
            const wasDestaque = dish && dish.destaque;
            
            const success = await dishService.delete(id);
            if (success) {
                toast.success('Prato excluído com sucesso!');
                await this.loadDishes();
                
                // Se era destaque, reorganizar ordens
                if (wasDestaque) {
                    await this.normalizeDestaqueOrders();
                }
                
                // Forçar renderização das abas
                this.filterAndRenderLista();
                this.filterAndRenderDestaques();
            } else {
                toast.error('Erro ao excluir prato');
            }
        } catch (error) {
            console.error('Error deleting dish:', error);
            toast.error('Erro ao excluir prato');
        } finally {
            loading.hide();
        }
    }

    async handleDishSubmit(formData, dishId) {
        loading.show();
        try {
            const result = dishId 
                ? await dishService.update(dishId, formData)
                : await dishService.create(formData);
            
            if (result.success) {
                toast.success(dishId ? 'Prato atualizado com sucesso!' : 'Prato criado com sucesso!');
                this.shouldRemoveImage = false;
                this.closeDishModal();
                await this.loadDishes();
                
                // Forçar renderização da aba ativa
                if (this.currentTab === 'lista') {
                    this.filterAndRenderLista();
                } else if (this.currentTab === 'destaques') {
                    this.filterAndRenderDestaques();
                }
            } else {
                toast.error(result.error || 'Erro ao salvar prato');
            }
        } catch (error) {
            console.error('Error saving dish:', error);
            toast.error('Erro ao salvar prato');
        } finally {
            loading.hide();
        }
    }

    handleImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            const container = document.getElementById('imagePreviewContainer');
            const uploadBox = document.getElementById('uploadBox');
            
            if (preview) preview.src = e.target.result;
            if (container) container.classList.add('active');
            if (uploadBox) uploadBox.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const input = document.getElementById('imagem');
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');
        const uploadBox = document.getElementById('uploadBox');
        
        if (input) input.value = '';
        if (preview) preview.src = '';
        if (container) container.classList.remove('active');
        if (uploadBox) uploadBox.style.display = 'flex';
        
        // Marcar que a imagem deve ser removida ao salvar
        this.shouldRemoveImage = true;
    }

    async normalizeDestaqueOrders() {
        try {
            const destaques = this.dishes.filter(d => d.destaque).sort((a, b) => a.ordem - b.ordem);
            
            for (let i = 0; i < destaques.length; i++) {
                const destaque = destaques[i];
                const novaOrdem = i + 1;
                
                // Só atualizar se a ordem estiver diferente
                if (destaque.ordem !== novaOrdem) {
                    const fd = new FormData();
                    fd.append('nome_pt', destaque.nome_pt);
                    fd.append('nome_es', destaque.nome_es);
                    fd.append('descricao_pt', destaque.descricao_pt || '');
                    fd.append('descricao_es', destaque.descricao_es || '');
                    fd.append('preco_brl', destaque.preco_brl);
                    fd.append('preco_bob', destaque.preco_bob);
                    fd.append('categoria_id', destaque.categoria_id || '');
                    fd.append('destaque', '1');
                    fd.append('ordem', novaOrdem);
                    fd.append('ativo', destaque.ativo ? '1' : '0');
                    await dishService.update(destaque.id, fd);
                }
            }
            
            await this.loadDishes();
        } catch (error) {
            console.error('Erro ao normalizar ordens:', error);
        }
    }

    async moveDestaqueUp(dishId) {
        const destaques = this.dishes.filter(d => d.destaque).sort((a, b) => a.ordem - b.ordem);
        const currentIndex = destaques.findIndex(d => d.id == dishId);
        
        if (currentIndex <= 0) return;
        
        const currentDish = destaques[currentIndex];
        const previousDish = destaques[currentIndex - 1];
        
        await this.swapDestaqueOrder(currentDish.id, previousDish.id);
    }

    async moveDestaqueDown(dishId) {
        const destaques = this.dishes.filter(d => d.destaque).sort((a, b) => a.ordem - b.ordem);
        const currentIndex = destaques.findIndex(d => d.id == dishId);
        
        if (currentIndex < 0 || currentIndex >= destaques.length - 1) return;
        
        const currentDish = destaques[currentIndex];
        const nextDish = destaques[currentIndex + 1];
        
        await this.swapDestaqueOrder(currentDish.id, nextDish.id);
    }

    async swapDestaqueOrder(dishId1, dishId2) {
        loading.show();
        try {
            const dish1 = await dishService.getById(dishId1);
            const dish2 = await dishService.getById(dishId2);
            
            if (!dish1 || !dish2) {
                toast.error('Erro ao trocar ordem');
                return;
            }
            
            const tempOrdem = dish1.ordem;
            
            const formData1 = new FormData();
            formData1.append('nome_pt', dish1.nome_pt);
            formData1.append('nome_es', dish1.nome_es);
            formData1.append('descricao_pt', dish1.descricao_pt || '');
            formData1.append('descricao_es', dish1.descricao_es || '');
            formData1.append('preco_brl', dish1.preco_brl);
            formData1.append('preco_bob', dish1.preco_bob);
            formData1.append('categoria_id', dish1.categoria_id || '');
            formData1.append('destaque', '1');
            formData1.append('ordem', dish2.ordem);
            formData1.append('ativo', dish1.ativo ? '1' : '0');
            
            const formData2 = new FormData();
            formData2.append('nome_pt', dish2.nome_pt);
            formData2.append('nome_es', dish2.nome_es);
            formData2.append('descricao_pt', dish2.descricao_pt || '');
            formData2.append('descricao_es', dish2.descricao_es || '');
            formData2.append('preco_brl', dish2.preco_brl);
            formData2.append('preco_bob', dish2.preco_bob);
            formData2.append('categoria_id', dish2.categoria_id || '');
            formData2.append('destaque', '1');
            formData2.append('ordem', tempOrdem);
            formData2.append('ativo', dish2.ativo ? '1' : '0');
            
            await dishService.update(dishId1, formData1);
            await dishService.update(dishId2, formData2);
            
            await this.loadDishes();
            this.filterAndRenderDestaques();
        } catch (error) {
            console.error('Erro ao trocar ordem:', error);
            toast.error('Erro ao trocar ordem');
        } finally {
            loading.hide();
        }
    }

    async toggleDestaque(dishId, setDestaque) {
        loading.show();
        try {
            const dish = await dishService.getById(dishId);
            if (!dish) {
                toast.error('Prato não encontrado');
                return;
            }

            // Se está marcando como destaque, reorganizar todos os destaques
            if (setDestaque) {
                // Incrementar ordem de todos os destaques existentes (+1)
                const destaques = this.dishes.filter(d => d.destaque);
                for (const destaque of destaques) {
                    const fd = new FormData();
                    fd.append('nome_pt', destaque.nome_pt);
                    fd.append('nome_es', destaque.nome_es);
                    fd.append('descricao_pt', destaque.descricao_pt || '');
                    fd.append('descricao_es', destaque.descricao_es || '');
                    fd.append('preco_brl', destaque.preco_brl);
                    fd.append('preco_bob', destaque.preco_bob);
                    fd.append('categoria_id', destaque.categoria_id || '');
                    fd.append('destaque', '1');
                    fd.append('ordem', (destaque.ordem || 0) + 1);
                    fd.append('ativo', destaque.ativo ? '1' : '0');
                    await dishService.update(destaque.id, fd);
                }
            }

            // Novo destaque sempre vai para ordem 1 (topo)
            const ordem = setDestaque ? 1 : 0;

            const formData = new FormData();
            formData.append('nome_pt', dish.nome_pt);
            formData.append('nome_es', dish.nome_es);
            formData.append('descricao_pt', dish.descricao_pt || '');
            formData.append('descricao_es', dish.descricao_es || '');
            formData.append('preco_brl', dish.preco_brl);
            formData.append('preco_bob', dish.preco_bob);
            formData.append('categoria_id', dish.categoria_id || '');
            formData.append('destaque', setDestaque ? '1' : '0');
            formData.append('ordem', ordem);
            formData.append('ativo', dish.ativo ? '1' : '0');

            const result = await dishService.update(dishId, formData);
            
            if (result.success) {
                const lang = i18n.getCurrentLanguage();
                const message = setDestaque 
                    ? (lang === 'pt' ? 'Prato marcado como destaque!' : '¡Plato marcado como destacado!')
                    : (lang === 'pt' ? 'Destaque removido!' : '¡Destacado removido!');
                toast.success(message);
                await this.loadDishes();
                
                // Normalizar ordens sequenciais após mudança
                await this.normalizeDestaqueOrders();
                
                // Forçar renderização das abas
                this.filterAndRenderLista();
                this.filterAndRenderDestaques();
            } else {
                toast.error(result.error || 'Erro ao atualizar prato');
            }
        } catch (error) {
            console.error('Error toggling destaque:', error);
            toast.error('Erro ao atualizar prato');
        } finally {
            loading.hide();
        }
    }
}

export default new DishController();

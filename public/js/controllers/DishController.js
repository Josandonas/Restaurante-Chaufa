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
        const paginationData = paginationHelper.paginate(filtered, 'destaques');
        this.renderDestaquesDishes(paginationData.items);
        
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
    }

    getImagePlaceholder() {
        return `<div style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; font-size: 28px;">🍽️</div>`;
    }

    renderDestaquesDishes(dishes) {
        const tbody = document.querySelector('#destaquesTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        dishes.sort((a, b) => a.ordem - b.ordem);
        
        dishes.forEach(dish => {
            const row = document.createElement('tr');
            const dishName = i18n.getCurrentLanguage() === 'pt' ? dish.nome_pt : dish.nome_es;
            const statusText = dish.ativo ? i18n.t('active') : i18n.t('inactive');
            const statusClass = dish.ativo ? 'status-active' : 'status-inactive';
            
            const removeFeaturedText = i18n.t('removeFeatured');
            const editText = i18n.t('editTooltip');
            const deleteText = i18n.t('deleteTooltip');
            
            row.innerHTML = `
                <td><div class="dish-image-cell" data-image="${dish.imagem_url || ''}" data-name="${dishName}"></div></td>
                <td>${dishName}</td>
                <td>R$ ${parseFloat(dish.preco_brl).toFixed(2)}</td>
                <td>Bs. ${parseFloat(dish.preco_bob).toFixed(2)}</td>
                <td>${dish.ordem}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-star active" onclick="window.dishController.toggleDestaque(${dish.id}, false)" title="${removeFeaturedText}">
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
    }

    loadDishImage(container, imageUrl, dishName) {
        if (!imageUrl) {
            container.innerHTML = this.getImagePlaceholder();
            return;
        }

        const img = new Image();
        img.onload = () => {
            container.innerHTML = `<img src="${imageUrl}" alt="${dishName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">`;
        };
        img.onerror = () => {
            container.innerHTML = this.getImagePlaceholder();
        };
        img.src = imageUrl;
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
        const modal = document.getElementById('dishModal');
        const form = document.getElementById('dishForm');
        const title = document.getElementById('dishModalTitle');
        const destaqueFields = document.getElementById('destaqueFields');
        
        const lang = i18n.getCurrentLanguage();
        if (title) title.textContent = lang === 'pt' ? 'Adicionar Prato' : 'Agregar Plato';
        if (form) form.reset();
        if (destaqueFields) destaqueFields.style.display = 'block';
        
        const dishId = document.getElementById('dishId');
        if (dishId) dishId.value = '';
        
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
                destaqueFields: document.getElementById('destaqueFields'),
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
            
            if (dish.destaque) {
                if (elements.destaqueFields) elements.destaqueFields.style.display = 'block';
                if (elements.ordem) elements.ordem.value = dish.ordem || 0;
            } else {
                if (elements.destaqueFields) elements.destaqueFields.style.display = 'none';
            }
            
            if (dish.imagem_url) {
                if (elements.imagePreview) elements.imagePreview.src = dish.imagem_url;
                if (elements.imageContainer) elements.imageContainer.classList.add('active');
                const uploadBox = document.getElementById('uploadBox');
                if (uploadBox) uploadBox.style.display = 'none';
            } else {
                if (elements.imageContainer) elements.imageContainer.classList.remove('active');
                const uploadBox = document.getElementById('uploadBox');
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
        if (!confirm(i18n.t('deleteConfirm'))) return;
        
        loading.show();
        try {
            const success = await dishService.delete(id);
            if (success) {
                toast.success('Prato excluído com sucesso!');
                this.loadDishes();
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
                this.closeDishModal();
                this.loadDishes();
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
            const container = document.querySelector('.image-preview-container');
            if (preview) preview.src = e.target.result;
            if (container) container.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const input = document.getElementById('imageUpload');
        const preview = document.getElementById('imagePreview');
        const container = document.querySelector('.image-preview-container');
        
        if (input) input.value = '';
        if (preview) preview.src = '';
        if (container) container.classList.remove('active');
    }

    async toggleDestaque(dishId, setDestaque) {
        loading.show();
        try {
            const dish = await dishService.getById(dishId);
            if (!dish) {
                toast.error('Prato não encontrado');
                return;
            }

            const formData = new FormData();
            formData.append('nome_pt', dish.nome_pt);
            formData.append('nome_es', dish.nome_es);
            formData.append('descricao_pt', dish.descricao_pt || '');
            formData.append('descricao_es', dish.descricao_es || '');
            formData.append('preco_brl', dish.preco_brl);
            formData.append('preco_bob', dish.preco_bob);
            formData.append('categoria_id', dish.categoria_id || '');
            formData.append('destaque', setDestaque ? '1' : '0');
            formData.append('ordem', dish.ordem || 0);
            formData.append('ativo', dish.ativo ? '1' : '0');

            const result = await dishService.update(dishId, formData);
            
            if (result.success) {
                const lang = i18n.getCurrentLanguage();
                const message = setDestaque 
                    ? (lang === 'pt' ? 'Prato marcado como destaque!' : '¡Plato marcado como destacado!')
                    : (lang === 'pt' ? 'Destaque removido!' : '¡Destacado removido!');
                toast.success(message);
                this.loadDishes();
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

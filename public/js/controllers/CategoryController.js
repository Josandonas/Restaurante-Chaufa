// Controller de Categorias
import categoryService from '../services/CategoryService.js';
import toast from '../utils/toast.js';
import loading from '../utils/loading.js';
import i18n from '../utils/i18n.js';
import paginationHelper from '../utils/PaginationHelper.js';

class CategoryController {
    constructor() {
        this.categorias = [];
        this.editingCategoryId = null;
    }

    async loadCategories() {
        loading.show();
        try {
            const categorias = await categoryService.getAll();
            this.categorias = categorias;
            this.filterCategories(''); // Usar filterCategories para aplicar paginação
            this.setupSearchListener();
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
            toast.error('Erro ao carregar categorias');
        } finally {
            loading.hide();
        }
    }

    setupSearchListener() {
        const searchInput = document.getElementById('searchCategories');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCategories(e.target.value.toLowerCase());
            });
        }
    }

    filterCategories(searchTerm) {
        let filtered = this.categorias;
        
        if (searchTerm) {
            filtered = this.categorias.filter(cat => {
                return cat.nome_pt.toLowerCase().includes(searchTerm) ||
                       cat.nome_es.toLowerCase().includes(searchTerm);
            });
        }

        // Aplicar paginação
        const paginationData = paginationHelper.paginate(filtered, 'categorias');
        this.renderCategoriesTable(paginationData.items);
        
        // Renderizar controles de paginação
        paginationHelper.renderPaginationControls(
            'paginationCategorias',
            paginationData,
            'categorias',
            (page) => {
                paginationHelper.goToPage('categorias', page);
                const searchInput = document.getElementById('searchCategories');
                this.filterCategories(searchInput ? searchInput.value.toLowerCase() : '');
            }
        );
    }

    renderCategoriesTable(categorias = this.categorias) {
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) return;

        const lang = i18n.getCurrentLanguage();
        const noDataMsg = lang === 'pt' ? '📂 Nenhuma categoria cadastrada' : '📂 Ninguna categoría registrada';
        const activeText = lang === 'pt' ? '✓ Ativo' : '✓ Activo';
        const inactiveText = lang === 'pt' ? '✗ Inativo' : '✗ Inactivo';
        const editTitle = i18n.t('editTooltip');
        const deleteTitle = i18n.t('deleteTooltip');
        const moveUpText = 'Mover para cima';
        const moveDownText = 'Mover para baixo';

        if (this.categorias.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                        ${noDataMsg}
                    </td>
                </tr>
            `;
            return;
        }

        const sortedCategorias = [...categorias].sort((a, b) => a.ordem - b.ordem);

        tbody.innerHTML = sortedCategorias.map((cat, index) => {
            const isFirst = index === 0;
            const isLast = index === sortedCategorias.length - 1;
            
            return `
            <tr>
                <td>
                    <div class="order-controls">
                        <button class="order-btn" onclick="window.categoryController.moveCategoryUp(${cat.id})" ${isFirst ? 'disabled' : ''} title="${moveUpText}">
                            ▲
                        </button>
                        <span class="order-number">${cat.ordem}</span>
                        <button class="order-btn" onclick="window.categoryController.moveCategoryDown(${cat.id})" ${isLast ? 'disabled' : ''} title="${moveDownText}">
                            ▼
                        </button>
                    </div>
                </td>
                <td>${cat.nome_pt}</td>
                <td>${cat.nome_es}</td>
                <td>
                    <span class="badge ${cat.ativo ? 'badge-success' : 'badge-danger'}">
                        ${cat.ativo ? activeText : inactiveText}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit" onclick="window.categoryController.openEditModal(${cat.id})" title="${editTitle}">
                            ✏️
                        </button>
                        <button class="action-btn action-btn-delete" onclick="window.app.openDeleteModal('category', ${cat.id}, '${cat.nome_pt.replace(/'/g, "\\'")}')" title="${deleteTitle}">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');

        // Ocultar botões de deletar se for editor
        if (window.currentUserRole === 'editor') {
            this.hideDeleteButtonsInCategories();
        }
    }

    hideDeleteButtonsInCategories() {
        const deleteButtons = document.querySelectorAll('.action-btn-delete');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    openAddModal() {
        this.editingCategoryId = null;
        document.getElementById('categoryModalTitle').textContent = 'Adicionar Categoria';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryNomePt').value = '';
        document.getElementById('categoryNomeEs').value = '';
        document.getElementById('categoryOrdem').value = this.categorias.length + 1;
        document.getElementById('categoryAtivo').checked = true;
        
        const modal = document.getElementById('categoryModal');
        if (modal) modal.style.display = 'flex';
    }

    async openEditModal(id) {
        try {
            const categoria = await categoryService.getById(id);
            if (!categoria) {
                toast.error('Categoria não encontrada');
                return;
            }

            this.editingCategoryId = id;
            const lang = i18n.getCurrentLanguage();
            const title = lang === 'pt' ? 'Editar Categoria' : 'Editar Categoría';
            document.getElementById('categoryModalTitle').textContent = title;
            document.getElementById('categoryId').value = categoria.id;
            document.getElementById('categoryNomePt').value = categoria.nome_pt;
            document.getElementById('categoryNomeEs').value = categoria.nome_es;
            document.getElementById('categoryOrdem').value = categoria.ordem;
            document.getElementById('categoryAtivo').checked = categoria.ativo;
            
            const modal = document.getElementById('categoryModal');
            if (modal) modal.style.display = 'flex';
        } catch (error) {
            console.error('Erro ao carregar categoria:', error);
            toast.error('Erro ao carregar categoria');
        }
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) modal.style.display = 'none';
        this.editingCategoryId = null;
    }

    async handleCategorySubmit(event) {
        event.preventDefault();
        
        const data = {
            nome_pt: document.getElementById('categoryNomePt').value.trim(),
            nome_es: document.getElementById('categoryNomeEs').value.trim(),
            ordem: parseInt(document.getElementById('categoryOrdem').value) || 0,
            ativo: document.getElementById('categoryAtivo').checked
        };

        if (!data.nome_pt || !data.nome_es) {
            toast.error('Preencha os nomes em português e espanhol');
            return;
        }

        loading.show();

        try {
            let result;
            if (this.editingCategoryId) {
                result = await categoryService.update(this.editingCategoryId, data);
            } else {
                result = await categoryService.create(data);
            }

            if (result.success) {
                toast.success(this.editingCategoryId ? 'Categoria atualizada!' : 'Categoria criada!');
                this.closeCategoryModal();
                await this.loadCategories();
            } else {
                toast.error(result.error || 'Erro ao salvar categoria');
            }
        } catch (error) {
            console.error('Erro ao salvar categoria:', error);
            toast.error('Erro ao salvar categoria');
        } finally {
            loading.hide();
        }
    }

    async moveCategoryUp(categoryId) {
        const sorted = [...this.categorias].sort((a, b) => a.ordem - b.ordem);
        const currentIndex = sorted.findIndex(c => c.id === categoryId);
        
        if (currentIndex <= 0) return;
        
        const currentCat = sorted[currentIndex];
        const previousCat = sorted[currentIndex - 1];
        
        await this.swapCategoryOrder(currentCat.id, previousCat.id);
    }

    async moveCategoryDown(categoryId) {
        const sorted = [...this.categorias].sort((a, b) => a.ordem - b.ordem);
        const currentIndex = sorted.findIndex(c => c.id === categoryId);
        
        if (currentIndex < 0 || currentIndex >= sorted.length - 1) return;
        
        const currentCat = sorted[currentIndex];
        const nextCat = sorted[currentIndex + 1];
        
        await this.swapCategoryOrder(currentCat.id, nextCat.id);
    }

    async swapCategoryOrder(catId1, catId2) {
        loading.show();
        try {
            const cat1 = this.categorias.find(c => c.id === catId1);
            const cat2 = this.categorias.find(c => c.id === catId2);
            
            if (!cat1 || !cat2) {
                toast.error('Erro ao trocar ordem');
                return;
            }
            
            const tempOrdem = cat1.ordem;
            
            const data1 = {
                nome_pt: cat1.nome_pt,
                nome_es: cat1.nome_es,
                ordem: cat2.ordem,
                ativo: cat1.ativo
            };
            
            const data2 = {
                nome_pt: cat2.nome_pt,
                nome_es: cat2.nome_es,
                ordem: tempOrdem,
                ativo: cat2.ativo
            };
            
            await categoryService.update(catId1, data1);
            await categoryService.update(catId2, data2);
            
            await this.loadCategories();
        } catch (error) {
            console.error('Erro ao trocar ordem:', error);
            toast.error('Erro ao trocar ordem');
        } finally {
            loading.hide();
        }
    }

    async deleteCategory(id) {
        const categoria = this.categorias.find(c => c.id === id);
        if (!categoria) return;

        loading.show();

        try {
            const success = await categoryService.delete(id);
            if (success) {
                toast.success('Categoria excluída!');
                await this.loadCategories();
            } else {
                toast.error('Erro ao excluir categoria');
            }
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            toast.error('Não é possível excluir categoria com pratos associados');
        } finally {
            loading.hide();
        }
    }
}

export default new CategoryController();

// Sistema de Internacionalização
class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('admin_language') || 'pt';
        this.translations = {
            pt: {
                adminTitle: '🍽️ Painel Administrativo - La Casa del Chaufa',
                changePassword: '🔑 Alterar Senha',
                logout: 'Sair',
                tabList: '📋 Pratos em Lista',
                tabFeatured: '⭐ Pratos em Destaque',
                tabCategories: '📂 Categorias',
                addListDish: '➕ Adicionar Prato em Lista',
                addFeaturedDish: '➕ Adicionar Prato em Destaque',
                addCategory: '➕ Adicionar Categoria',
                image: 'Imagem',
                name: 'Nome',
                namePt: 'Nome (PT)',
                nameEs: 'Nome (ES)',
                priceBrl: 'Preço (R$)',
                priceBob: 'Precio (Bs.)',
                order: 'Ordem',
                status: 'Status',
                actions: 'Ações',
                active: 'Ativo',
                inactive: 'Inativo',
                edit: 'Editar',
                delete: 'Excluir',
                confirmLogout: 'Confirmar Saída',
                logoutMessage: 'Tem certeza que deseja sair?',
                logoutSubmessage: 'Você precisará fazer login novamente para acessar o painel',
                cancelButton: '❌ Cancelar',
                logoutButton: '🚪 Sair',
                deleteConfirm: 'Tem certeza que deseja excluir este prato?',
                noImage: 'Sem imagem',
                categoryLabel: 'Categoria',
                noCategory: 'Sem categoria',
                addDish: '➕ Adicionar Prato',
                confirmDelete: 'Confirmar Exclusão',
                deleteWarning: 'Esta ação não pode ser desfeita',
                confirmButton: '🗑️ Excluir',
                markAsFeatured: 'Marcar como destaque',
                removeFeatured: 'Remover destaque',
                editTooltip: 'Editar',
                deleteTooltip: 'Excluir',
                changePhoto: 'Mudar Foto de Perfil',
                selectPhoto: 'Selecionar Foto',
                savePhoto: 'Salvar Foto',
                photoHint: 'Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF, WEBP',
                paginationShowing: 'Mostrando',
                paginationOf: 'de',
                paginationItems: 'itens'
            },
            es: {
                adminTitle: '🍽️ Panel Administrativo - La Casa del Chaufa',
                changePassword: '🔑 Cambiar Contraseña',
                logout: 'Salir',
                tabList: '📋 Platos en Lista',
                tabFeatured: '⭐ Platos Destacados',
                addListDish: '➕ Agregar Plato en Lista',
                addFeaturedDish: '➕ Agregar Plato Destacado',
                tabCategories: '📂 Categorías',
                addCategory: '➕ Agregar Categoría',
                image: 'Imagen',
                name: 'Nombre',
                namePt: 'Nombre (PT)',
                nameEs: 'Nombre (ES)',
                priceBrl: 'Precio (R$)',
                priceBob: 'Precio (Bs.)',
                order: 'Orden',
                status: 'Estado',
                actions: 'Acciones',
                active: 'Activo',
                inactive: 'Inactivo',
                edit: 'Editar',
                delete: 'Eliminar',
                confirmLogout: 'Confirmar Salida',
                logoutMessage: '¿Está seguro que desea salir?',
                logoutSubmessage: 'Necesitará iniciar sesión nuevamente para acceder al panel',
                cancelButton: '❌ Cancelar',
                logoutButton: '🚪 Salir',
                deleteConfirm: '¿Está seguro que desea eliminar este plato?',
                noImage: 'Sin imagen',
                categoryLabel: 'Categoría',
                noCategory: 'Sin categoría',
                addDish: '➕ Agregar Plato',
                confirmDelete: 'Confirmar Eliminación',
                deleteWarning: 'Esta acción no se puede deshacer',
                confirmButton: '🗑️ Eliminar',
                markAsFeatured: 'Marcar como destacado',
                removeFeatured: 'Quitar destacado',
                editTooltip: 'Editar',
                deleteTooltip: 'Eliminar',
                changePhoto: 'Cambiar Foto de Perfil',
                selectPhoto: 'Seleccionar Foto',
                savePhoto: 'Guardar Foto',
                photoHint: 'Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WEBP',
                paginationShowing: 'Mostrando',
                paginationOf: 'de',
                paginationItems: 'ítems'
            }
        };
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('admin_language', lang);
        this.updateAllTexts();
    }

    updateAllTexts() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Ignorar botão contextual - ele é gerenciado por updateContextualButton
            if (element.id === 'contextualAddText') {
                return;
            }
            
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

export default new I18n();

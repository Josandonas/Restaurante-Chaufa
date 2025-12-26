// Orquestrador Principal da Aplicação
import authController from './controllers/AuthController.js';
import userController from './controllers/UserController.js';
import dishController from './controllers/DishController.js';
import categoryController from './controllers/CategoryController.js';
import authService from './services/AuthService.js';
import i18n from './utils/i18n.js';
import toast from './utils/toast.js';

class App {
    constructor() {
        this.isAuthenticated = false;
    }

    async init() {
        // Inicializar utilitários
        toast.init();
        
        // Configurar callbacks de autenticação
        authController.setCallbacks(
            () => this.onAuthSuccess(),
            () => this.onAuthFailure()
        );

        // Expor controllers globalmente para onclick do HTML
        window.authController = authController;
        window.userController = userController;
        window.dishController = dishController;
        window.categoryController = categoryController;
        window.i18n = i18n;
        window.app = this;

        // Iniciar autenticação
        await authController.init();
    }

    async onAuthSuccess() {
        this.isAuthenticated = true;
        await this.showAdmin();
    }

    onAuthFailure() {
        this.isAuthenticated = false;
        this.showLogin();
    }

    async showAdmin() {
        const loginContainer = document.getElementById('loginContainer');
        const adminContainer = document.getElementById('adminContainer');
        
        if (loginContainer) loginContainer.style.display = 'none';
        if (adminContainer) adminContainer.style.display = 'block';

        // Carregar dados do usuário
        await userController.loadProfile();
        
        // Carregar pratos (não bloquear se falhar)
        try {
            await dishController.loadDishes();
        } catch (error) {
            console.warn('⚠️ Erro ao carregar pratos:', error);
        }
        
        // Iniciar renovação automática de token
        authService.startTokenRefresh();
        
        // Atualizar textos com idioma salvo
        i18n.updateAllTexts();
        
        // Atualizar botões de idioma
        this.updateLanguageButtons();
    }

    showLogin() {
        const loginContainer = document.getElementById('loginContainer');
        const adminContainer = document.getElementById('adminContainer');
        
        if (loginContainer) loginContainer.style.display = 'flex';
        if (adminContainer) adminContainer.style.display = 'none';
    }

    updateLanguageButtons() {
        const currentLang = i18n.getCurrentLanguage();
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(`lang${currentLang.charAt(0).toUpperCase() + currentLang.slice(1)}`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Métodos globais chamados pelo HTML
    changeLanguage(lang) {
        i18n.changeLanguage(lang);
        this.updateLanguageButtons();
        
        // Recarregar categorias se a aba estiver ativa
        const categoriesTab = document.getElementById('tab-categorias');
        if (categoriesTab && categoriesTab.classList.contains('active')) {
            categoryController.loadCategories();
        }
    }

    openLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) modal.classList.add('active');
    }

    closeLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) modal.classList.remove('active');
    }

    confirmLogout() {
        authController.handleLogout();
        this.closeLogoutModal();
    }

    // Modal de confirmação de exclusão
    openDeleteModal(type, id, name) {
        this.deleteTarget = { type, id, name };
        const modal = document.getElementById('deleteConfirmModal');
        const message = document.getElementById('deleteConfirmMessage');
        const lang = i18n.getCurrentLanguage();
        
        if (type === 'dish') {
            message.textContent = lang === 'pt' 
                ? `Tem certeza que deseja excluir o prato "${name}"?`
                : `¿Está seguro que desea eliminar el plato "${name}"?`;
        } else if (type === 'category') {
            message.textContent = lang === 'pt'
                ? `Tem certeza que deseja excluir a categoria "${name}"?`
                : `¿Está seguro que desea eliminar la categoría "${name}"?`;
        }
        
        if (modal) modal.classList.add('active');
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteConfirmModal');
        if (modal) modal.classList.remove('active');
        this.deleteTarget = null;
    }

    async confirmDelete() {
        if (!this.deleteTarget) return;
        
        const { type, id } = this.deleteTarget;
        
        if (type === 'dish') {
            await dishController.deleteDish(id);
        } else if (type === 'category') {
            await categoryController.deleteCategory(id);
        }
        
        this.closeDeleteModal();
    }
}

// Inicializar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.appInstance = new App();
        window.appInstance.init();
    });
} else {
    window.appInstance = new App();
    window.appInstance.init();
}

export default App;

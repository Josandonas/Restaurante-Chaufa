// Orquestrador Principal da Aplicação
import authController from './controllers/AuthController.js';
import userController from './controllers/UserController.js';
import dishController from './controllers/DishController.js';
import categoryController from './controllers/CategoryController.js';
import authService from './services/AuthService.js';
import i18n from './utils/i18n.js';
import loginI18n from './utils/loginI18n.js';
import toast from './utils/toast.js';

class App {
    constructor() {
        this.isAuthenticated = false;
    }

    async init() {
        // Expor controllers globalmente PRIMEIRO (para onclick do HTML)
        window.authController = authController;
        window.userController = userController;
        window.dishController = dishController;
        window.categoryController = categoryController;
        window.i18n = i18n;
        window.loginI18n = loginI18n;
        window.app = this;
        
        // Inicializar utilitários
        toast.init();
        
        // Inicializar sistema de i18n do login (independente do admin)
        loginI18n.init();
        
        // Configurar callbacks de autenticação
        authController.setCallbacks(
            () => this.onAuthSuccess(),
            () => this.onAuthFailure()
        );

        // Configurar listener para fechar menu ao clicar fora
        this.setupClickOutsideListener();

        // Iniciar autenticação
        await authController.init();
    }

    setupClickOutsideListener() {
        document.addEventListener('click', (event) => {
            const userMenu = document.getElementById('userDropdownMenu');
            const userBtn = document.getElementById('userProfileBtn');
            
            // Se o menu está aberto e o clique foi fora do menu e do botão
            if (userMenu && userMenu.classList.contains('active')) {
                if (!userMenu.contains(event.target) && !userBtn.contains(event.target)) {
                    userController.closeUserMenu();
                }
            }
        });
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
        
        // Verificar role e mostrar/ocultar botão de gerenciar usuários
        this.checkUserRole();
        
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

    async checkUserRole() {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const user = await response.json();
            
            const manageUsersBtn = document.getElementById('manageUsersBtn');
            // Mostrar botão para admin e gerente
            if (manageUsersBtn && (user.role === 'admin' || user.role === 'gerente')) {
                manageUsersBtn.style.display = 'flex';
            }
            
            if (user.role === 'editor') {
                this.hideDeleteButtons();
            }
            
            window.currentUserRole = user.role;
        } catch (error) {
            console.error('Erro ao verificar role:', error);
        }
    }

    hideDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.action-btn-delete');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    openDeleteModal(type, id, name) {
        this.deleteType = type;
        this.deleteId = id;
        
        const modal = document.getElementById('deleteModal');
        const itemName = document.getElementById('deleteItemName');
        
        if (itemName) itemName.textContent = name;
        if (modal) modal.classList.add('active');
    }

    closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) modal.classList.remove('active');
        this.deleteType = null;
        this.deleteId = null;
    }

    async confirmDelete() {
        if (!this.deleteType || !this.deleteId) return;
        
        if (this.deleteType === 'dish') {
            await dishController.deleteDish(this.deleteId);
        } else if (this.deleteType === 'category') {
            await categoryController.deleteCategory(this.deleteId);
        } else if (this.deleteType === 'user') {
            await usersManagementController.deleteUser(this.deleteId);
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

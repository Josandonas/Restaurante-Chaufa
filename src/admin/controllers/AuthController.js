// Controller de Autenticação
import authService from '../services/AuthService.js';
import storage from '../services/StorageService.js';
import toast from '../utils/toast.js';
import loading from '../utils/loading.js';

class AuthController {
    constructor() {
        this.onAuthSuccess = null;
        this.onAuthFailure = null;
    }

    async init() {
        // CONFIAR APENAS NA SESSÃO DO SERVIDOR
        // Se chegou aqui, o servidor já validou (ou não) a sessão
        // Este código roda apenas no admin.html (servidor já protegeu a rota)
        
        try {
            const response = await fetch('/api/auth/session', {
                credentials: 'include' // IMPORTANTE: enviar cookie de sessão
            });
            const data = await response.json();
            
            if (data.authenticated) {
                // Sessão válida no servidor - inicializar admin
                this.onAuthSuccess && this.onAuthSuccess();
                return;
            }
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
        }
        
        // Sem sessão válida - callback de falha
        this.onAuthFailure && this.onAuthFailure();
    }

    openLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) modal.style.display = 'flex';
    }

    closeLogoutModal() {
        const modal = document.getElementById('logoutModal');
        if (modal) modal.style.display = 'none';
    }

    confirmLogout() {
        this.closeLogoutModal();
        this.handleLogout();
    }

    async handleLogout() {
        // console.log('🚪 Fazendo logout...');
        await authService.logout();
        // console.log('✓ Logout completo');
        // Não precisa chamar onAuthFailure, logout já redireciona
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.innerHTML = `<div class="alert alert-error">${message}</div>`;
            setTimeout(() => errorDiv.innerHTML = '', 5000);
        }
    }

    setCallbacks(onSuccess, onFailure) {
        this.onAuthSuccess = onSuccess;
        this.onAuthFailure = onFailure;
    }
}

export default new AuthController();

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
        // console.log('🔐 Iniciando autenticação...');
        // console.log('📍 Verificando armazenamento local...');
        
        const savedToken = storage.getToken();
        const rememberToken = storage.getRememberToken();
        const savedEmail = storage.getUserEmail();
        
        // console.log('Token JWT salvo:', savedToken ? '✅ SIM' : '❌ NÃO');
        // console.log('Remember token:', rememberToken ? '✅ SIM' : '❌ NÃO');
        // console.log('Email salvo:', savedEmail ? `✅ ${savedEmail}` : '❌ NÃO');
        
        // Prioridade 1: Verificar token JWT salvo
        if (savedToken) {
            // console.log('✓ Token encontrado, verificando validade...');
            const isValid = await authService.verifyToken();
            if (isValid) {
                // console.log('✓ Token válido! Entrando no painel...');
                this.onAuthSuccess && this.onAuthSuccess();
                return;
            }
            // console.log('✗ Token inválido ou expirado');
        }
        
        // Prioridade 2: Tentar remember token
        if (rememberToken) {
            // console.log('✓ Remember token encontrado, tentando renovar...');
            const data = await authService.verifyRememberToken();
            if (data) {
                // console.log('✓ Autenticado via remember token!');
                this.onAuthSuccess && this.onAuthSuccess();
                return;
            }
            // console.log('✗ Remember token inválido ou expirado');
        }
        
        // Prioridade 3: Preencher email se existir
        if (savedEmail) {
            // console.log('✓ Email salvo encontrado, preenchendo formulário...');
            this.prefillEmail(savedEmail);
        }
        
        // console.log('→ Nenhuma sessão válida encontrada');
        // console.log('→ Mostrando tela de login');
        this.onAuthFailure && this.onAuthFailure();
    }

    prefillEmail(email) {
        setTimeout(() => {
            const emailInput = document.getElementById('loginEmail');
            const rememberCheckbox = document.getElementById('rememberMe');
            if (emailInput) emailInput.value = email;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }, 100);
    }

    async handleLogin(email, senha, rememberMe) {
        // console.log('🔑 Tentando login...', { email, rememberMe });
        
        loading.show();
        
        try {
            const result = await authService.login(email, senha, rememberMe);
            
            if (result.success) {
                // console.log('✓ Login bem-sucedido!');
                // console.log('Token recebido:', result.data.token ? 'SIM' : 'NÃO');
                // console.log('Remember token recebido:', result.data.rememberToken ? 'SIM' : 'NÃO');
                
                this.onAuthSuccess && this.onAuthSuccess();
            } else {
                // console.log('✗ Login falhou:', result.error);
                this.showLoginError(result.error || 'Credenciais inválidas');
            }
        } catch (error) {
            // console.error('✗ Erro no login:', error);
            this.showLoginError('Erro ao conectar com o servidor');
        } finally {
            loading.hide();
        }
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

    handleLogout() {
        // console.log('🚪 Fazendo logout...');
        authService.logout();
        // console.log('✓ Logout completo');
        this.onAuthFailure && this.onAuthFailure();
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

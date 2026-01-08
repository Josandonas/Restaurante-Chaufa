// Login Page JavaScript
import authService from '../admin/services/AuthService.js';
import storage from '../admin/services/StorageService.js';
import loginI18n from '../admin/utils/loginI18n.js';
import loading from '../admin/utils/loading.js';

class LoginPage {
    constructor() {
        this.init();
    }

    init() {
        // Inicializar i18n do login
        loginI18n.init();
        
        // Expor globalmente para onclick do HTML
        window.loginI18n = loginI18n;
        
        // Preencher email se existir
        const savedEmail = storage.getUserEmail();
        if (savedEmail) {
            this.prefillEmail(savedEmail);
        }
        
        // Setup form handler
        this.setupFormHandler();
    }

    prefillEmail(email) {
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');
        if (emailInput) emailInput.value = email;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    setupFormHandler() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value;
        const senha = document.getElementById('loginPassword')?.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        if (!email || !senha) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        loading.show();

        try {
            const result = await authService.login(email, senha, rememberMe);

            if (result.success) {
                // Login bem-sucedido - redirecionar para admin
                window.location.href = '/admin';
            } else {
                this.showError(result.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            this.showError('Erro ao conectar com o servidor');
        } finally {
            loading.hide();
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.innerHTML = `<div style="background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center;">${message}</div>`;
            setTimeout(() => errorDiv.innerHTML = '', 5000);
        }
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LoginPage();
    });
} else {
    new LoginPage();
}

// Serviço de Autenticação
import storage from './StorageService.js';

class AuthService {
    constructor() {
        this.tokenRefreshInterval = null;
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const token = storage.getToken();
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        return fetch(this.baseURL + endpoint, config);
    }

    async login(email, senha, rememberMe) {
        console.log('📡 Enviando requisição de login...', { email, rememberMe });
        
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha, rememberMe })
        });
        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login bem-sucedido no backend');
            console.log('📦 Dados recebidos:', {
                token: data.token ? 'SIM' : 'NÃO',
                rememberToken: data.rememberToken ? 'SIM' : 'NÃO',
                rememberMe
            });
            
            // Sempre salvar token
            storage.setToken(data.token, rememberMe);
            
            // Se "manter conectado" está marcado, salvar remember token e email
            if (rememberMe) {
                if (data.rememberToken) {
                    storage.setRememberToken(data.rememberToken);
                    storage.setUserEmail(email);
                    console.log('✅ Sessão persistente configurada');
                } else {
                    console.warn('⚠️ Remember token não foi retornado pelo backend!');
                }
            } else {
                console.log('ℹ️ Sessão temporária (apenas durante navegação)');
            }
            
            return { success: true, data };
        }
        
        return { success: false, error: data.error };
    }

    async verifyToken() {
        const token = storage.getToken();
        if (!token) return false;

        const response = await this.request('/auth/verify', { method: 'POST' });
        return response.ok;
    }

    async verifyRememberToken() {
        const rememberToken = storage.getRememberToken();
        if (!rememberToken) return null;

        const response = await this.request('/auth/verify-remember', {
            method: 'POST',
            body: JSON.stringify({ rememberToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.valid && data.token) {
                storage.setToken(data.token, true);
                return data;
            }
        }
        
        storage.clearAll();
        return null;
    }

    logout() {
        this.stopTokenRefresh();
        storage.clearAll();
    }

    startTokenRefresh() {
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
        }

        const rememberToken = storage.getRememberToken();
        if (!rememberToken) return;

        this.tokenRefreshInterval = setInterval(async () => {
            const data = await this.verifyRememberToken();
            if (data) {
                console.log('✅ Token renovado automaticamente');
            } else {
                console.warn('⚠️ Falha ao renovar token');
                this.logout();
            }
        }, 15 * 60 * 1000);

        console.log('🔄 Sistema de renovação automática ativado (15min)');
    }

    stopTokenRefresh() {
        if (this.tokenRefreshInterval) {
            clearInterval(this.tokenRefreshInterval);
            this.tokenRefreshInterval = null;
        }
    }

    async changePassword(senhaAtual, novaSenha) {
        const response = await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ senhaAtual, novaSenha })
        });
        const data = await response.json();
        
        return {
            success: response.ok,
            message: data.message,
            error: data.error
        };
    }

    async getUserProfile() {
        const response = await this.request('/auth/me', { method: 'GET' });
        if (response.ok) {
            return await response.json();
        }
        return null;
    }

    async uploadPhoto(file) {
        const formData = new FormData();
        formData.append('foto', file);
        
        const token = storage.getToken();
        const response = await fetch(this.baseURL + '/auth/upload-foto', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        const data = await response.json();
        
        return {
            success: response.ok,
            foto_perfil: data.foto_perfil,
            error: data.error
        };
    }
}

export default new AuthService();

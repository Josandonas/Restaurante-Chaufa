// Serviço de Armazenamento
class StorageService {
    // Token Management
    getToken() {
        return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    }

    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('admin_token', token);
            // console.log('💾 Token salvo em localStorage (persistente)');
        } else {
            sessionStorage.setItem('admin_token', token);
            // console.log('💾 Token salvo em sessionStorage (sessão)');
        }
    }

    removeToken() {
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
    }

    // Remember Token Management
    getRememberToken() {
        return localStorage.getItem('remember_token');
    }

    setRememberToken(token) {
        localStorage.setItem('remember_token', token);
        // console.log('💾 Remember token salvo em localStorage');
    }

    removeRememberToken() {
        localStorage.removeItem('remember_token');
    }

    // User Email Management
    getUserEmail() {
        return localStorage.getItem('user_email');
    }

    setUserEmail(email) {
        localStorage.setItem('user_email', email);
        // console.log('💾 Email salvo:', email);
    }

    removeUserEmail() {
        localStorage.removeItem('user_email');
    }

    // Clear All
    clearAll() {
        this.removeToken();
        this.removeRememberToken();
        this.removeUserEmail();
    }
}

export default new StorageService();

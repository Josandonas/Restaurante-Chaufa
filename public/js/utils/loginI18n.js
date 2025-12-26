// Sistema de Internacionalização INDEPENDENTE para Login
class LoginI18n {
    constructor() {
        // Não usa localStorage do admin - sistema completamente separado
        this.currentLanguage = this.detectLanguage();
        this.translations = {
            pt: {
                welcome: 'Bem-vindo!',
                adminPanel: 'La Casa del Chaufa - Painel Administrativo',
                email: 'Email',
                password: 'Senha',
                rememberMe: 'Manter-me conectado por 30 dias',
                loginButton: 'Entrar no Painel',
                backToMenu: 'Voltar ao Cardápio',
                peruvianFood: 'Comida Peruana Autêntica 🇵🇪'
            },
            es: {
                welcome: '¡Bienvenido!',
                adminPanel: 'La Casa del Chaufa - Panel Administrativo',
                email: 'Correo electrónico',
                password: 'Contraseña',
                rememberMe: 'Mantenerme conectado por 30 días',
                loginButton: 'Ingresar al Panel',
                backToMenu: 'Volver al Menú',
                peruvianFood: 'Comida Peruana Auténtica 🇵🇪'
            }
        };
    }

    // Idioma padrão sempre ESPANHOL (restaurante peruano/boliviano)
    detectLanguage() {
        // SEMPRE retorna espanhol como padrão
        // Usuário pode mudar manualmente se preferir português
        return 'es';
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.updateAllTexts();
        this.updateLanguageButtons();
    }

    updateAllTexts() {
        // Atualiza apenas elementos dentro da tela de login
        const loginContainer = document.getElementById('loginContainer');
        if (!loginContainer) return;

        loginContainer.querySelectorAll('[data-i18n-login]').forEach(element => {
            const key = element.getAttribute('data-i18n-login');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
    }

    updateLanguageButtons() {
        const ptBtn = document.getElementById('loginLangPt');
        const esBtn = document.getElementById('loginLangEs');
        
        if (ptBtn && esBtn) {
            ptBtn.classList.toggle('active', this.currentLanguage === 'pt');
            esBtn.classList.toggle('active', this.currentLanguage === 'es');
        }
    }

    init() {
        this.updateAllTexts();
        this.updateLanguageButtons();
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

export default new LoginI18n();

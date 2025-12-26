// Sistema de Notificações Toast
import i18n from './i18n.js';

class ToastManager {
    constructor() {
        this.container = null;
    }

    init() {
        this.container = document.getElementById('toastContainer');
    }

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const titles = {
            success: i18n.getCurrentLanguage() === 'pt' ? 'Sucesso!' : '¡Éxito!',
            error: i18n.getCurrentLanguage() === 'pt' ? 'Erro!' : '¡Error!',
            warning: i18n.getCurrentLanguage() === 'pt' ? 'Atenção!' : '¡Atención!',
            info: i18n.getCurrentLanguage() === 'pt' ? 'Informação' : 'Información'
        };

        const toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
            <div class="toast-progress"></div>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message) {
        this.show(message, 'error');
    }

    warning(message) {
        this.show(message, 'warning');
    }

    info(message) {
        this.show(message, 'info');
    }
}

export default new ToastManager();

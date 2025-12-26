// Gerenciador de Loading
class LoadingManager {
    constructor() {
        this.overlay = null;
    }

    init() {
        this.overlay = document.getElementById('loadingOverlay');
    }

    show() {
        if (!this.overlay) this.init();
        this.overlay.classList.add('active');
    }

    hide() {
        if (!this.overlay) this.init();
        this.overlay.classList.remove('active');
    }
}

export default new LoadingManager();

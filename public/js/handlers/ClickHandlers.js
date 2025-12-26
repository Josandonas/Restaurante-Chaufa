// Handlers de Cliques
import dishController from '../controllers/DishController.js';
import userController from '../controllers/UserController.js';

class ClickHandlers {
    init() {
        this.setupUserButtons();
        // setupDishButtons removido - botão contextual é gerenciado por updateContextualButton
        // setupTabButtons removido - TabHandlers já gerencia isso
    }

    setupUserButtons() {
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                userController.openPasswordModal();
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.app.openLogoutModal();
            });
        }
    }
}

export default new ClickHandlers();

// Handler de Tabs
import dishController from '../controllers/DishController.js';
import categoryController from '../controllers/CategoryController.js';

class TabHandlers {
    init() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    switchTab(tab) {
        dishController.switchTab(tab);
        // DishController.switchTab já carrega categorias quando necessário
    }
}

export default new TabHandlers();

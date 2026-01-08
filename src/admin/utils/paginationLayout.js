/**
 * Ajuste Dinâmico de Layout para Paginação Mobile
 * Solução profissional sem gambiarras de padding fixo
 */

class PaginationLayout {
    constructor() {
        this.init();
    }

    init() {
        // Executar quando DOM carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.adjustLayout());
        } else {
            this.adjustLayout();
        }

        // Reajustar no resize (debounced)
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => this.adjustLayout(), 150);
        });

        // Observar mudanças na paginação (quando muda de página)
        this.observePaginationChanges();
    }

    adjustLayout() {
        // Apenas em mobile
        if (window.innerWidth > 768) {
            this.resetLayout();
            return;
        }

        const paginationContainer = document.querySelector('.pagination-container');
        const adminContent = document.querySelector('.admin-content');

        if (!paginationContainer || !adminContent) return;

        // Calcular altura real da paginação
        const paginationHeight = paginationContainer.offsetHeight;
        
        // Adicionar margem de segurança (20px)
        const safeBottomSpace = paginationHeight + 20;

        // Aplicar padding-bottom dinâmico
        adminContent.style.paddingBottom = `${safeBottomSpace}px`;

        console.log(`📱 Layout ajustado: paginação ${paginationHeight}px + 20px = ${safeBottomSpace}px`);
    }

    resetLayout() {
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.style.paddingBottom = '';
        }
    }

    observePaginationChanges() {
        const paginationContainer = document.querySelector('.pagination-container');
        if (!paginationContainer) return;

        // Observer para detectar mudanças no conteúdo da paginação
        const observer = new MutationObserver(() => {
            this.adjustLayout();
        });

        observer.observe(paginationContainer, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
}

// Inicializar automaticamente
new PaginationLayout();

export default PaginationLayout;

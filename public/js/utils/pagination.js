// Utilitário de Paginação
class Pagination {
    constructor(itemsPerPage = 7) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalItems = 0;
        this.filteredItems = [];
    }

    setItems(items) {
        this.filteredItems = items;
        this.totalItems = items.length;
        this.currentPage = 1;
    }

    getTotalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    getCurrentPageItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredItems.slice(start, end);
    }

    goToPage(page) {
        const totalPages = this.getTotalPages();
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            return true;
        }
        return false;
    }

    nextPage() {
        return this.goToPage(this.currentPage + 1);
    }

    prevPage() {
        return this.goToPage(this.currentPage - 1);
    }

    renderControls(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = this.getTotalPages();
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

        let html = `
            <div class="pagination-container">
                <div class="pagination-info">
                    Mostrando ${start}-${end} de ${this.totalItems} itens
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn prev" ${this.currentPage === 1 ? 'disabled' : ''} 
                            onclick="window.paginationManager.handlePrev('${containerId}')">
                        ◀
                    </button>
        `;

        // Páginas
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" onclick="window.paginationManager.handlePage('${containerId}', 1)">1</button>`;
            if (startPage > 2) {
                html += `<span style="padding: 0 8px; color: var(--gray-500);">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.paginationManager.handlePage('${containerId}', ${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span style="padding: 0 8px; color: var(--gray-500);">...</span>`;
            }
            html += `<button class="pagination-btn" onclick="window.paginationManager.handlePage('${containerId}', ${totalPages})">${totalPages}</button>`;
        }

        html += `
                    <button class="pagination-btn next" ${this.currentPage === totalPages ? 'disabled' : ''} 
                            onclick="window.paginationManager.handleNext('${containerId}')">
                        ▶
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }
}

// Gerenciador Global de Paginação
class PaginationManager {
    constructor() {
        this.paginators = {};
    }

    create(id, itemsPerPage = 7) {
        this.paginators[id] = new Pagination(itemsPerPage);
        return this.paginators[id];
    }

    get(id) {
        return this.paginators[id];
    }

    handlePage(containerId, page) {
        const paginator = this.paginators[containerId];
        if (paginator && paginator.goToPage(page)) {
            this.triggerUpdate(containerId);
        }
    }

    handleNext(containerId) {
        const paginator = this.paginators[containerId];
        if (paginator && paginator.nextPage()) {
            this.triggerUpdate(containerId);
        }
    }

    handlePrev(containerId) {
        const paginator = this.paginators[containerId];
        if (paginator && paginator.prevPage()) {
            this.triggerUpdate(containerId);
        }
    }

    triggerUpdate(containerId) {
        // Dispara evento customizado para atualizar a tabela
        const event = new CustomEvent('paginationUpdate', { detail: { containerId } });
        window.dispatchEvent(event);
    }
}

// Instância global
const paginationManager = new PaginationManager();
window.paginationManager = paginationManager;

export default paginationManager;

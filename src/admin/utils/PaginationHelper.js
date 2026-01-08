// Helper de Paginação Client-Side
class PaginationHelper {
    constructor(itemsPerPage = 7) {
        this.itemsPerPage = itemsPerPage;
        this.currentPages = {
            lista: 1,
            destaques: 1,
            categorias: 1
        };
    }

    paginate(items, tab) {
        const currentPage = this.currentPages[tab] || 1;
        const totalPages = Math.ceil(items.length / this.itemsPerPage);
        
        // Garantir que a página atual é válida
        if (currentPage > totalPages && totalPages > 0) {
            this.currentPages[tab] = totalPages;
        }
        
        const start = (this.currentPages[tab] - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedItems = items.slice(start, end);
        
        return {
            items: paginatedItems,
            currentPage: this.currentPages[tab],
            totalPages: totalPages,
            totalItems: items.length,
            hasNext: this.currentPages[tab] < totalPages,
            hasPrev: this.currentPages[tab] > 1
        };
    }

    goToPage(tab, page) {
        this.currentPages[tab] = page;
    }

    nextPage(tab, totalPages) {
        if (this.currentPages[tab] < totalPages) {
            this.currentPages[tab]++;
            return true;
        }
        return false;
    }

    prevPage(tab) {
        if (this.currentPages[tab] > 1) {
            this.currentPages[tab]--;
            return true;
        }
        return false;
    }

    getCurrentPage(tab) {
        return this.currentPages[tab] || 1;
    }

    resetPage(tab) {
        this.currentPages[tab] = 1;
    }

    renderPaginationControls(containerId, paginationData, tab, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { currentPage, totalPages, totalItems } = paginationData;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const start = (currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(currentPage * this.itemsPerPage, totalItems);

        const i18n = window.i18n || { t: (key) => key };
        
        let html = `
            <div class="pagination-container">
                <div class="pagination-info">
                    ${i18n.t('paginationShowing')} ${start}-${end} ${i18n.t('paginationOf')} ${totalItems} ${i18n.t('paginationItems')}
                </div>
                <div class="pagination-controls">
                    <button class="pagination-btn prev" ${!paginationData.hasPrev ? 'disabled' : ''} 
                            data-action="prev">
                        ◀
                    </button>
        `;

        // Renderizar páginas
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span style="padding: 0 8px; color: var(--gray-500);">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span style="padding: 0 8px; color: var(--gray-500);">...</span>`;
            }
            html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        html += `
                    <button class="pagination-btn next" ${!paginationData.hasNext ? 'disabled' : ''} 
                            data-action="next">
                        ▶
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Adicionar event listeners
        container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.getAttribute('data-page'));
                onPageChange(page);
            });
        });

        container.querySelector('.pagination-btn[data-action="prev"]')?.addEventListener('click', () => {
            if (paginationData.hasPrev) {
                onPageChange(currentPage - 1);
            }
        });

        container.querySelector('.pagination-btn[data-action="next"]')?.addEventListener('click', () => {
            if (paginationData.hasNext) {
                onPageChange(currentPage + 1);
            }
        });
    }
}

export default new PaginationHelper();

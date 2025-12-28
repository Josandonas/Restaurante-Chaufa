/**
 * Sistema de atualização automática do cardápio
 * Verifica periodicamente se houve mudanças nos pratos e recarrega a página
 * Usa polling adaptativo: 15s quando ativo, 2min quando inativo
 */
class AutoRefresh {
    constructor() {
        this.activeInterval = 15000;    // 15 segundos quando aba está ativa
        this.inactiveInterval = 120000; // 2 minutos quando aba está inativa
        this.currentInterval = this.activeInterval;
        this.lastUpdate = null;
        this.intervalId = null;
        this.isRefreshing = false;
        this.isPageVisible = true;
    }

    async init() {
        try {
            // Buscar timestamp inicial
            const response = await fetch('/api/pratos/public/last-update');
            const data = await response.json();
            this.lastUpdate = data.lastUpdate;
            
            // Configurar listener de visibilidade da página
            this.setupVisibilityListener();
            
            // Iniciar verificação periódica
            this.start();
            
            console.log('🔄 Sistema de atualização automática iniciado (Polling Adaptativo)');
            console.log(`   ⚡ Ativo: ${this.activeInterval/1000}s | 💤 Inativo: ${this.inactiveInterval/1000}s`);
        } catch (error) {
            console.error('Erro ao inicializar auto-refresh:', error);
        }
    }

    setupVisibilityListener() {
        // Detectar quando usuário muda de aba
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            
            if (this.isPageVisible) {
                console.log('👁️ Página ativa - Polling rápido (15s)');
                this.adjustInterval(this.activeInterval);
                // Verificar imediatamente ao voltar para a aba
                this.checkForUpdates();
            } else {
                console.log('💤 Página inativa - Polling lento (2min)');
                this.adjustInterval(this.inactiveInterval);
            }
        });
    }

    adjustInterval(newInterval) {
        if (this.currentInterval === newInterval) return;
        
        this.currentInterval = newInterval;
        
        // Reiniciar intervalo com novo tempo
        this.stop();
        this.start();
    }

    start() {
        if (this.intervalId) return;
        
        this.intervalId = setInterval(() => {
            this.checkForUpdates();
        }, this.currentInterval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async checkForUpdates() {
        if (this.isRefreshing) return;

        try {
            const response = await fetch('/api/pratos/public/last-update');
            const data = await response.json();
            
            if (this.lastUpdate && data.lastUpdate !== this.lastUpdate) {
                console.log('🔄 Atualização detectada! Recarregando cardápio...');
                this.refresh();
            }
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
        }
    }

    refresh() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        
        // Mostrar indicador de carregamento suave
        this.showRefreshIndicator();
        
        // Aguardar um pouco para o usuário ver o indicador
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }

    showRefreshIndicator() {
        // Criar overlay de atualização
        const overlay = document.createElement('div');
        overlay.id = 'refresh-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 30px 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: scaleIn 0.3s ease;
        `;

        content.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
            <div style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">
                Cardápio Atualizado!
            </div>
            <div style="font-size: 14px; color: #6c757d;">
                Carregando novidades...
            </div>
            <div style="margin-top: 20px;">
                <div class="spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #E74C3C;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto;
                "></div>
            </div>
        `;

        // Adicionar animações CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }
}

// Exportar instância singleton
export default new AutoRefresh();

import ApiService from '../services/ApiService.js';
import toast from '../utils/toast.js';
import i18n from '../utils/i18n.js';

class ConfigController {
    constructor() {
        this.taxaCambio = null;
        this.ultimaAtualizacao = null;
    }

    async init() {
        await this.carregarTaxaCambio();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const btnSalvarCambio = document.getElementById('btn-salvar-cambio');
        const btnRecalcularPrecos = document.getElementById('btn-recalcular-precos');

        if (btnSalvarCambio) {
            btnSalvarCambio.addEventListener('click', () => this.salvarTaxaCambio());
        }

        if (btnRecalcularPrecos) {
            btnRecalcularPrecos.addEventListener('click', () => {
                console.log('🔵 Botão Recalcular clicado!');
                this.openRecalcularModal();
            });
            console.log('✅ Event listener adicionado ao botão Recalcular');
        }

        // Validação do input
        const inputCambio = document.getElementById('taxa-cambio');
        if (inputCambio) {
            inputCambio.addEventListener('input', (e) => {
                // Permitir apenas números e ponto decimal
                e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                
                // Permitir apenas um ponto decimal
                const parts = e.target.value.split('.');
                if (parts.length > 2) {
                    e.target.value = parts[0] + '.' + parts.slice(1).join('');
                }
                
                // Limitar a 6 casas decimais
                if (parts[1] && parts[1].length > 6) {
                    e.target.value = parts[0] + '.' + parts[1].substring(0, 6);
                }
            });
        }
    }

    async carregarTaxaCambio() {
        console.log('🔧 Carregando taxa de câmbio...');
        try {
            const response = await ApiService.get('/configuracoes/cambio');
            console.log('📡 Resposta da API:', response);
            
            if (response.taxa_cambio !== undefined) {
                this.taxaCambio = response.taxa_cambio;
                this.ultimaAtualizacao = response.ultima_atualizacao;
                
                console.log('✅ Taxa carregada:', this.taxaCambio);
                console.log('✅ Última atualização:', this.ultimaAtualizacao);
                
                // Atualizar UI - NÃO preencher o campo de input, apenas exibir o último valor
                const spanUltimoValor = document.getElementById('ultimo-valor-cambio');
                const spanUltimaAtualizacao = document.getElementById('ultima-atualizacao-cambio');
                
                console.log('Span ultimo-valor-cambio encontrado:', !!spanUltimoValor);
                console.log('Span ultima-atualizacao-cambio encontrado:', !!spanUltimaAtualizacao);
                
                if (spanUltimoValor) {
                    spanUltimoValor.textContent = `1 BOB = ${this.taxaCambio.toFixed(6)} BRL`;
                    console.log('✅ Último valor exibido:', spanUltimoValor.textContent);
                }
                
                if (spanUltimaAtualizacao && this.ultimaAtualizacao) {
                    const data = new Date(this.ultimaAtualizacao);
                    spanUltimaAtualizacao.textContent = data.toLocaleString('pt-BR');
                    console.log('✅ Última atualização exibida:', spanUltimaAtualizacao.textContent);
                }
            } else {
                console.warn('⚠️ Resposta não contém taxa_cambio');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar taxa de câmbio:', error);
            toast.error(i18n.t('error_loading_exchange_rate'));
        }
    }

    async salvarTaxaCambio() {
        const inputCambio = document.getElementById('taxa-cambio');
        const checkboxRecalcular = document.getElementById('recalcular-ao-salvar');
        
        if (!inputCambio) return;

        const novaTaxa = parseFloat(inputCambio.value);
        
        // Validações
        if (isNaN(novaTaxa) || novaTaxa <= 0) {
            toast.error(i18n.t('invalid_exchange_rate'));
            return;
        }

        if (novaTaxa > 100) {
            toast.error(i18n.t('exchange_rate_too_high'));
            return;
        }

        const recalcular = checkboxRecalcular ? checkboxRecalcular.checked : false;

        try {
            const btnSalvar = document.getElementById('btn-salvar-cambio');
            if (btnSalvar) {
                btnSalvar.disabled = true;
                btnSalvar.textContent = i18n.t('saving');
            }

            const response = await ApiService.post('/configuracoes/cambio', {
                taxa_cambio: novaTaxa,
                recalcular_precos: recalcular
            });

            if (response.success) {
                this.taxaCambio = novaTaxa;
                toast.success(response.mensagem || i18n.t('exchange_rate_updated'));
                
                // Atualizar última atualização
                await this.carregarTaxaCambio();
                
                // Se recalculou preços, recarregar lista de pratos
                if (recalcular && window.appInstance && window.appInstance.dishController) {
                    await window.appInstance.dishController.loadDishes();
                }
            }
        } catch (error) {
            console.error('Erro ao salvar taxa de câmbio:', error);
            toast.error(error.message || i18n.t('error_saving_exchange_rate'));
        } finally {
            const btnSalvar = document.getElementById('btn-salvar-cambio');
            if (btnSalvar) {
                btnSalvar.disabled = false;
                btnSalvar.textContent = i18n.t('save');
            }
        }
    }

    openRecalcularModal() {
        const modal = document.getElementById('recalcularConfirmModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeRecalcularModal() {
        const modal = document.getElementById('recalcularConfirmModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    confirmarRecalcular() {
        this.closeRecalcularModal();
        this.recalcularPrecos();
    }

    async recalcularPrecos() {
        const inputCambio = document.getElementById('taxa-cambio');
        const btnRecalcular = document.getElementById('btn-recalcular-precos');
        
        if (!inputCambio) {
            console.error('Campo taxa-cambio não encontrado');
            toast.error('Campo de taxa não encontrado');
            return;
        }

        const novaTaxa = parseFloat(inputCambio.value);
        
        // Validações
        if (!novaTaxa || isNaN(novaTaxa)) {
            toast.error(i18n.t('invalid_exchange_rate'));
            inputCambio.focus();
            return;
        }

        if (novaTaxa <= 0) {
            toast.error(i18n.t('invalid_exchange_rate'));
            inputCambio.focus();
            return;
        }

        if (novaTaxa > 100) {
            toast.error(i18n.t('exchange_rate_too_high'));
            inputCambio.focus();
            return;
        }

        try {
            // Mostrar loading no botão
            if (btnRecalcular) {
                btnRecalcular.disabled = true;
                btnRecalcular.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="animation: spin 1s linear infinite;">
                        <circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="31.4 31.4" />
                    </svg>
                    Processando...
                </span>`;
                btnRecalcular.style.opacity = '0.7';
            }

            console.log('Salvando taxa e recalculando preços...', novaTaxa);

            // Salvar taxa E recalcular em uma única chamada
            const response = await ApiService.post('/configuracoes/cambio', {
                taxa_cambio: novaTaxa,
                recalcular_precos: true
            });

            console.log('Resposta da API:', response);

            if (response.success) {
                this.taxaCambio = novaTaxa;
                
                toast.success(`Taxa atualizada para ${novaTaxa.toFixed(6)} e preços recalculados!`);
                
                // Atualizar última atualização
                await this.carregarTaxaCambio();
                
                // Limpar campo de input
                inputCambio.value = '';
                
                // Recarregar lista de pratos
                if (window.appInstance && window.appInstance.dishController) {
                    console.log('Recarregando lista de pratos...');
                    await window.appInstance.dishController.loadDishes();
                }
            } else {
                toast.error('Erro: ' + (response.error || 'Resposta inválida do servidor'));
            }
        } catch (error) {
            console.error('Erro ao processar:', error);
            toast.error(error.message || 'Erro ao processar operação');
        } finally {
            // Restaurar botão
            if (btnRecalcular) {
                btnRecalcular.disabled = false;
                btnRecalcular.innerHTML = `🔄 <span data-i18n="recalculatePrices">${i18n.t('recalculatePrices')}</span>`;
                btnRecalcular.style.opacity = '1';
            }
        }
    }
}

export default new ConfigController();

// Sistema de Internacionalização
class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('admin_language') || 'pt';
        this.translations = {
            pt: {
                adminTitle: '🍽️ Painel Administrativo - La Casa del Chaufa',
                changePassword: '🔑 Alterar Senha',
                logout: 'Sair',
                tabList: '📋 Pratos em Lista',
                tabFeatured: '⭐ Pratos em Destaque',
                tabCategories: '📂 Categorias',
                addListDish: '➕ Adicionar Prato em Lista',
                addFeaturedDish: '➕ Adicionar Prato em Destaque',
                addCategory: '➕ Adicionar Categoria',
                exchangeRate: '💱 Câmbio Real',
                currentRate: 'Taxa Atual',
                newRate: 'Nova Taxa',
                lastUpdate: 'Última Atualização',
                lastRegisteredValue: 'Último Valor Registrado:',
                exchangeDescription: 'Configure a taxa de câmbio de <strong>Bolivianos (BOB)</strong> para <strong>Reais (BRL)</strong>. Esta taxa será usada para calcular automaticamente os preços em reais baseados nos preços em bolivianos.',
                exchangeExample: '<strong>Exemplo:</strong> Se a taxa é 1.75, um prato de Bs. 125.00 custará R$ 71.43 (125 ÷ 1.75)',
                exchangeInputHint: 'Máximo 6 casas decimais. Use ponto (.) como separador decimal.',
                exchangeWarning: '<strong>⚠️ Atenção:</strong> Ao recalcular, a nova taxa será salva e todos os valores em BRL serão substituídos pelo cálculo: <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">Preço BOB ÷ Taxa de Câmbio</code>',
                save: 'Salvar',
                saving: 'Salvando...',
                recalculatePrices: 'Recalcular Preços',
                recalculating: 'Recalculando...',
                recalculateOnSave: 'Recalcular preços ao salvar',
                invalid_exchange_rate: 'Taxa de câmbio inválida. Deve ser um número maior que zero.',
                exchange_rate_too_high: 'Taxa de câmbio muito alta. Verifique o valor.',
                exchange_rate_updated: 'Taxa de câmbio atualizada com sucesso!',
                error_loading_exchange_rate: 'Erro ao carregar taxa de câmbio',
                error_saving_exchange_rate: 'Erro ao salvar taxa de câmbio',
                confirm_recalculate_prices: 'Tem certeza que deseja recalcular todos os preços em BRL baseado na taxa atual? Esta ação atualizará todos os pratos.',
                prices_recalculated: 'Preços recalculados com sucesso!',
                error_recalculating_prices: 'Erro ao recalcular preços',
                image: 'Imagem',
                name: 'Nome',
                namePt: 'Nome (PT)',
                nameEs: 'Nome (ES)',
                priceBrl: 'Preço (R$)',
                priceBob: 'Precio (Bs.)',
                order: 'Ordem',
                status: 'Status',
                actions: 'Ações',
                active: 'Ativo',
                inactive: 'Inativo',
                edit: 'Editar',
                delete: 'Excluir',
                confirmLogout: 'Confirmar Saída',
                logoutMessage: 'Tem certeza que deseja sair?',
                logoutSubmessage: 'Você precisará fazer login novamente para acessar o painel',
                cancelButton: '❌ Cancelar',
                logoutButton: '🚪 Sair',
                deleteConfirm: 'Tem certeza que deseja excluir este prato?',
                noImage: 'Sem imagem',
                categoryLabel: 'Categoria',
                noCategory: 'Sem categoria',
                addDish: '➕ Adicionar Prato',
                confirmDelete: 'Confirmar Exclusão',
                deleteWarning: 'Esta ação não pode ser desfeita',
                confirmButton: '🗑️ Excluir',
                markAsFeatured: 'Marcar como destaque',
                removeFeatured: 'Remover destaque',
                editTooltip: 'Editar',
                deleteTooltip: 'Excluir',
                changePhoto: 'Mudar Foto de Perfil',
                selectPhoto: 'Selecionar Foto',
                savePhoto: 'Salvar Foto',
                photoHint: 'Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF, WEBP',
                paginationShowing: 'Mostrando',
                paginationOf: 'de',
                paginationItems: 'itens'
            },
            es: {
                adminTitle: '🍽️ Panel Administrativo - La Casa del Chaufa',
                changePassword: '🔑 Cambiar Contraseña',
                logout: 'Salir',
                tabList: '📋 Platos en Lista',
                tabFeatured: '⭐ Platos Destacados',
                addListDish: '➕ Agregar Plato en Lista',
                addFeaturedDish: '➕ Agregar Plato Destacado',
                tabCategories: '📂 Categorías',
                addCategory: '➕ Agregar Categoría',
                exchangeRate: '💱 Câmbio Reais',
                currentRate: 'Tasa Actual',
                newRate: 'Nueva Tasa',
                lastUpdate: 'Última Actualización',
                lastRegisteredValue: 'Último Valor Registrado:',
                exchangeDescription: 'Configure la tasa de cambio de <strong>Bolivianos (BOB)</strong> para <strong>Reales (BRL)</strong>. Esta tasa se utilizará para calcular automáticamente los precios en reales basados en los precios en bolivianos.',
                exchangeExample: '<strong>Ejemplo:</strong> Si la tasa es 1.75, un plato de Bs. 125.00 costará R$ 71.43 (125 ÷ 1.75)',
                exchangeInputHint: 'Máximo 6 decimales. Use punto (.) como separador decimal.',
                exchangeWarning: '<strong>⚠️ Atención:</strong> Al recalcular, la nueva tasa se guardará y todos los valores en BRL serán reemplazados por el cálculo: <code style="background: #fff; padding: 2px 6px; border-radius: 4px;">Precio BOB ÷ Tasa de Cambio</code>',
                save: 'Guardar',
                saving: 'Guardando...',
                recalculatePrices: 'Recalcular Precios',
                recalculating: 'Recalculando...',
                recalculateOnSave: 'Recalcular precios al guardar',
                invalid_exchange_rate: 'Tasa de cambio inválida. Debe ser un número mayor que cero.',
                exchange_rate_too_high: 'Tasa de cambio muy alta. Verifique el valor.',
                exchange_rate_updated: '¡Tasa de cambio actualizada con éxito!',
                error_loading_exchange_rate: 'Error al cargar tasa de cambio',
                error_saving_exchange_rate: 'Error al guardar tasa de cambio',
                confirm_recalculate_prices: '¿Está seguro que desea recalcular todos los precios en BRL basado en la tasa actual? Esta acción actualizará todos los platos.',
                prices_recalculated: '¡Precios recalculados con éxito!',
                error_recalculating_prices: 'Error al recalcular precios',
                image: 'Imagen',
                name: 'Nombre',
                namePt: 'Nombre (PT)',
                nameEs: 'Nombre (ES)',
                priceBrl: 'Precio (R$)',
                priceBob: 'Precio (Bs.)',
                order: 'Orden',
                status: 'Estado',
                actions: 'Acciones',
                active: 'Activo',
                inactive: 'Inactivo',
                edit: 'Editar',
                delete: 'Eliminar',
                confirmLogout: 'Confirmar Salida',
                logoutMessage: '¿Está seguro que desea salir?',
                logoutSubmessage: 'Necesitará iniciar sesión nuevamente para acceder al panel',
                cancelButton: '❌ Cancelar',
                logoutButton: '🚪 Salir',
                deleteConfirm: '¿Está seguro que desea eliminar este plato?',
                noImage: 'Sin imagen',
                categoryLabel: 'Categoría',
                noCategory: 'Sin categoría',
                addDish: '➕ Agregar Plato',
                confirmDelete: 'Confirmar Eliminación',
                deleteWarning: 'Esta acción no se puede deshacer',
                confirmButton: '🗑️ Eliminar',
                markAsFeatured: 'Marcar como destacado',
                removeFeatured: 'Quitar destacado',
                editTooltip: 'Editar',
                deleteTooltip: 'Eliminar',
                changePhoto: 'Cambiar Foto de Perfil',
                selectPhoto: 'Seleccionar Foto',
                savePhoto: 'Guardar Foto',
                photoHint: 'Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF, WEBP',
                paginationShowing: 'Mostrando',
                paginationOf: 'de',
                paginationItems: 'ítems'
            }
        };
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('admin_language', lang);
        this.updateAllTexts();
    }

    updateAllTexts() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Ignorar botão contextual - ele é gerenciado por updateContextualButton
            if (element.id === 'contextualAddText') {
                return;
            }
            
            if (element.tagName === 'INPUT' && element.type === 'button') {
                element.value = translation;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translation;
            } else {
                // Usar innerHTML para permitir tags HTML nas traduções
                element.innerHTML = translation;
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

export default new I18n();

// Entry point para a homepage pública
import './menu.js';
import { initFooter, updateFooterLanguage, footerTranslations } from './footer.js';

// Exportar para uso no menu.js
window.footerModule = { initFooter, updateFooterLanguage, footerTranslations };

if (typeof window !== 'undefined') {
    console.log('✓ Homepage bundle carregado');
}

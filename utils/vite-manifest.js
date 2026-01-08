/**
 * Utilitário para ler o manifest do Vite e obter os caminhos dos bundles
 */
const fs = require('fs');
const path = require('path');

let manifest = null;

function loadManifest() {
    if (manifest) return manifest;
    
    try {
        const manifestPath = path.join(__dirname, '../dist/.vite/manifest.json');
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        manifest = JSON.parse(manifestContent);
        return manifest;
    } catch (error) {
        console.error('❌ Erro ao carregar manifest do Vite:', error.message);
        console.error('⚠️  Execute "npm run build" antes de iniciar o servidor');
        return null;
    }
}

function getAssetPath(entryName) {
    const manifest = loadManifest();
    if (!manifest) return null;
    
    const entry = manifest[entryName];
    if (!entry) {
        console.error(`❌ Entry "${entryName}" não encontrada no manifest`);
        return null;
    }
    
    return '/' + entry.file;
}

module.exports = {
    loadManifest,
    getAssetPath,
    getAdminBundle: () => getAssetPath('src/admin/main.js'),
    getLoginBundle: () => getAssetPath('src/login/main.js'),
    getHomepageBundle: () => getAssetPath('src/homepage/main.js')
};

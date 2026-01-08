/**
 * Middleware para injetar bundles do Vite dinamicamente nos HTMLs
 * Lê o manifest.json e substitui placeholders nos HTMLs
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
        return null;
    }
}

function getBundlePath(entryName) {
    const manifest = loadManifest();
    if (!manifest || !manifest[entryName]) return null;
    return '/' + manifest[entryName].file;
}

function injectViteBundles(req, res, next) {
    const originalSend = res.send;
    
    res.send = function(data) {
        // Apenas processar HTML
        if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
            const manifest = loadManifest();
            
            if (manifest) {
                // Substituir placeholders pelos bundles corretos
                data = data.replace(
                    /<!--\s*VITE_BUNDLE:(\w+)\s*-->/g,
                    (match, bundleName) => {
                        const entry = `src/${bundleName}/main.js`;
                        const bundle = manifest[entry];
                        
                        if (bundle) {
                            let scripts = `<script type="module" src="/${bundle.file}"></script>`;
                            
                            // Adicionar imports (vendor, etc) - mas não duplicar
                            // Vite já gerencia as dependências automaticamente
                            
                            return scripts;
                        }
                        
                        console.warn(`⚠️ Bundle ${bundleName} não encontrado no manifest`);
                        return `<!-- Bundle ${bundleName} não encontrado -->`;
                    }
                );
            }
        }
        
        originalSend.call(this, data);
    };
    
    next();
}

module.exports = { injectViteBundles, getBundlePath };

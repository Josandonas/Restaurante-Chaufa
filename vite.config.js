import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: '/',
  publicDir: false, // Não copiar public/ para evitar conflito
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true, // Gerar manifest.json para mapear bundles
    
    rollupOptions: {
      input: {
        // Admin panel
        admin: resolve(__dirname, 'src/admin/main.js'),
        // Login page
        login: resolve(__dirname, 'src/login/main.js'),
        // Public homepage
        homepage: resolve(__dirname, 'src/homepage/main.js'),
      },
      
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        
        // Minificação e ofuscação
        compact: true,
        
        // Separar vendors em chunk separado
        manualChunks: {
          'vendor': ['./src/admin/services/AuthService.js']
        }
      }
    },
    
    // Minificação agressiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        toplevel: true,
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    // Source maps apenas em dev
    sourcemap: false,
    
    // Otimizações
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  
  preview: {
    port: 4173
  }
});

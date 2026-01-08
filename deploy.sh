#!/bin/bash

# ============================================================
# Script de Deploy Automatizado - La Casa del Chaufa
# ============================================================
# IMPORTANTE: Copie este arquivo para fora do repositório
# antes de usar em produção e ajuste as configurações.
# ============================================================
# 
# Nova estrutura com Vite:
# - Executa 'npm run build' para gerar bundles em /dist
# - Nginx serve assets estáticos de /dist/assets/
# - Node.js serve HTMLs e API
# ============================================================

# Configurações (AJUSTE CONFORME SEU SERVIDOR)
PROJECT_PATH="/home/admin/Restaurante-Chaufa"
PM2_NAME="restaurante-chaufa"
BRANCH="main"
LOG_FILE="$PROJECT_PATH/deploy.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de log com timestamp
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

# Função de aviso
warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] AVISO:${NC} $1" | tee -a $LOG_FILE
}

# Função de erro
error_exit() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERRO:${NC} $1" | tee -a $LOG_FILE
    exit 1
}

log "=========================================="
log "=== Iniciando Deploy Automatizado ==="
log "=========================================="

# Verificar se diretório existe
if [ ! -d "$PROJECT_PATH" ]; then
    error_exit "Diretório do projeto não encontrado: $PROJECT_PATH"
fi

cd $PROJECT_PATH || error_exit "Não foi possível acessar o diretório do projeto"

# 1. Verificar mudanças no Git
log "Verificando atualizações no Git..."
git fetch origin $BRANCH || error_exit "Falha ao buscar atualizações do Git"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Nenhuma atualização disponível. Deploy cancelado."
    exit 0
fi

log "Novas atualizações encontradas!"

# 2. Atualizar código do Git
log "Atualizando código do Git..."
git pull origin $BRANCH || error_exit "Falha no Git pull"
log "Código atualizado com sucesso!"

# 3. Instalar/Atualizar dependências
log "Instalando dependências (isso pode demorar)..."
npm install --production || error_exit "Falha no npm install"
log "Dependências instaladas com sucesso!"

# 4. Build do Vite (gerar bundles para produção)
log "Executando build do Vite..."
log "Gerando bundles otimizados em /dist..."
npm run build || error_exit "Falha no build do Vite"
log "Build concluído com sucesso!"
log "Bundles gerados em: $PROJECT_PATH/dist/assets/"

# 5. Ajustar permissões
log "Ajustando permissões de arquivos..."

# Criar e ajustar permissões de uploads (imagens de pratos e perfil)
sudo mkdir -p public/uploads/pratos 2>/dev/null
sudo mkdir -p public/uploads/perfil 2>/dev/null
sudo chown -R admin:www-data public/uploads 2>/dev/null
sudo chmod -R 775 public/uploads 2>/dev/null

# Ajustar permissões da pasta dist (bundles do Vite)
# Nginx precisa ler estes arquivos
sudo chown -R admin:www-data dist 2>/dev/null
sudo chmod -R 755 dist 2>/dev/null

# Ajustar permissões de logos e imagens fixas
sudo chown -R admin:www-data public/logos_imagens_app 2>/dev/null
sudo chmod -R 755 public/logos_imagens_app 2>/dev/null

log "Permissões ajustadas!"
log "  - public/uploads: 775 (admin:www-data)"
log "  - dist: 755 (admin:www-data)"
log "  - public/logos_imagens_app: 755 (admin:www-data)"

# 6. Reiniciar aplicação com PM2
log "Reiniciando aplicação no PM2..."

if pm2 describe $PM2_NAME > /dev/null 2>&1; then
    pm2 restart $PM2_NAME || error_exit "Falha ao reiniciar PM2"
    log "Aplicação reiniciada!"
else
    pm2 start server.js --name $PM2_NAME || error_exit "Falha ao iniciar PM2"
    log "Aplicação iniciada!"
fi

# 7. Verificar status da aplicação
log "Verificando status da aplicação..."
sleep 3

if pm2 describe $PM2_NAME | grep -q "online"; then
    log "✓ Aplicação está ONLINE!"
else
    error_exit "Aplicação NÃO está online após deploy"
fi

# 8. Mostrar informações finais
log "=========================================="
log "=== Deploy Finalizado com Sucesso! ==="
log "=========================================="
log "Commit atual: $(git rev-parse --short HEAD)"
log "Branch: $BRANCH"
log "Horário: $(date '+%d/%m/%Y %H:%M:%S')"
log "=========================================="

# Mostrar logs recentes da aplicação
log "Últimas linhas do log da aplicação:"
pm2 logs $PM2_NAME --lines 5 --nostream

# 🚀 Guia de Deploy - Cardápio Online

Este guia detalha o processo completo de deploy da aplicação em um servidor VPS Linux (Webdock).

## 📋 Pré-requisitos

- VPS Linux (Ubuntu 20.04 ou superior)
- Acesso SSH ao servidor
- Domínio configurado (opcional, mas recomendado)

## 🔧 Instalação no Servidor

### 1. Conectar ao servidor via SSH

```bash
ssh root@seu-servidor.com
```

### 2. Atualizar o sistema

```bash
apt update && apt upgrade -y
```

### 3. Instalar Node.js (versão 18 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs
node --version
npm --version
```

### 4. Instalar MySQL

```bash
apt install -y mysql-server
mysql_secure_installation
```

Durante a instalação segura:
- Defina uma senha forte para root
- Remova usuários anônimos: Y
- Desabilite login root remoto: Y
- Remova banco de teste: Y
- Recarregue privilégios: Y

### 5. Configurar MySQL

```bash
mysql -u root -p
```

No console do MySQL:

```sql
CREATE DATABASE cardapio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cardapio_user'@'localhost' IDENTIFIED BY 'SUA_SENHA_SEGURA_AQUI';
GRANT ALL PRIVILEGES ON cardapio_db.* TO 'cardapio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6. Instalar Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 7. Instalar PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

### 8. Instalar dependências do Puppeteer

```bash
apt install -y chromium-browser
apt install -y libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0
```

## 📦 Deploy da Aplicação

### 1. Criar diretório da aplicação

```bash
mkdir -p /var/www/cardapio
cd /var/www/cardapio
```

### 2. Transferir arquivos

**Opção A: Via Git (recomendado)**

```bash
git clone seu-repositorio.git .
```

**Opção B: Via SCP (do seu computador local)**

```bash
scp -r cardapio-online/* root@seu-servidor.com:/var/www/cardapio/
```

### 3. Instalar dependências

```bash
cd /var/www/cardapio
npm install --production
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_USER=cardapio_user
DB_PASSWORD=SUA_SENHA_MYSQL
DB_NAME=cardapio_db
DB_PORT=3306

JWT_SECRET=GERE_UMA_CHAVE_SEGURA_AQUI
RESTAURANT_NAME=Restaurante Chaufa
ADMIN_EMAIL=admin@restaurante.com
ADMIN_PASSWORD=SuaSenhaAdmin@123

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
```

**Gerar JWT_SECRET seguro:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Configurar banco de dados

```bash
npm run setup-db
```

Para incluir dados de exemplo:

```bash
npm run setup-db -- --seed
```

### 6. Criar diretório de uploads

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 7. Iniciar aplicação com PM2

```bash
pm2 start server.js --name cardapio
pm2 save
pm2 startup
```

Execute o comando que o PM2 mostrar para configurar inicialização automática.

### 8. Verificar status

```bash
pm2 status
pm2 logs cardapio
```

## 🌐 Configurar Nginx

### 1. Criar configuração do site

```bash
nano /etc/nginx/sites-available/cardapio
```

Cole a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/cardapio/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Ativar o site

```bash
ln -s /etc/nginx/sites-available/cardapio /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## 🔒 Configurar HTTPS com Let's Encrypt

### 1. Instalar Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 2. Obter certificado SSL

```bash
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções:
- Forneça um email válido
- Aceite os termos
- Escolha redirecionar HTTP para HTTPS (opção 2)

### 3. Renovação automática

O Certbot configura renovação automática. Teste com:

```bash
certbot renew --dry-run
```

## 🔥 Configurar Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

## 📊 Comandos Úteis

### Gerenciar aplicação

```bash
pm2 restart cardapio    # Reiniciar
pm2 stop cardapio       # Parar
pm2 start cardapio      # Iniciar
pm2 logs cardapio       # Ver logs
pm2 monit               # Monitorar
```

### Atualizar aplicação

```bash
cd /var/www/cardapio
git pull                # Se usando Git
npm install             # Atualizar dependências
pm2 restart cardapio    # Reiniciar aplicação
```

### Backup do banco de dados

```bash
mysqldump -u cardapio_user -p cardapio_db > backup-$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
mysql -u cardapio_user -p cardapio_db < backup-20231225.sql
```

### Ver logs do Nginx

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🎯 Acessar a Aplicação

Após o deploy:

- **Cardápio Público:** `https://seu-dominio.com`
- **Painel Admin:** `https://seu-dominio.com/admin`
- **API:** `https://seu-dominio.com/api`

### Credenciais padrão

- **Email:** admin@restaurante.com
- **Senha:** Admin@123 (ou a que você definiu no .env)

⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 🔍 Troubleshooting

### Aplicação não inicia

```bash
pm2 logs cardapio --lines 100
```

### Erro de conexão com MySQL

```bash
mysql -u cardapio_user -p
# Teste a conexão manualmente
```

### Nginx retorna 502

```bash
# Verificar se a aplicação está rodando
pm2 status
# Verificar logs do Nginx
tail -f /var/log/nginx/error.log
```

### Problemas com upload de imagens

```bash
# Verificar permissões
ls -la /var/www/cardapio/public/uploads
chmod 755 /var/www/cardapio/public/uploads
```

### PDF não gera

```bash
# Verificar se Chromium está instalado
which chromium-browser
# Instalar dependências faltantes
apt install -y chromium-browser
```

## 🔐 Segurança

### Recomendações

1. **Alterar senha padrão** do admin imediatamente
2. **Usar senhas fortes** para MySQL e JWT_SECRET
3. **Manter sistema atualizado:** `apt update && apt upgrade`
4. **Configurar backup automático** do banco de dados
5. **Monitorar logs** regularmente
6. **Limitar acesso SSH** apenas para IPs confiáveis
7. **Configurar fail2ban** para proteção contra ataques

### Configurar Fail2Ban

```bash
apt install -y fail2ban
systemctl start fail2ban
systemctl enable fail2ban
```

## 📈 Monitoramento

### Configurar monitoramento com PM2

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🎉 Pronto!

Sua aplicação está no ar e pronta para uso!

Para suporte ou dúvidas, consulte a documentação do projeto.

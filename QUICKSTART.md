# ⚡ Guia Rápido de Instalação

## 🏃 Instalação Local (5 minutos)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar MySQL

```sql
CREATE DATABASE cardapio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cardapio_user'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON cardapio_db.* TO 'cardapio_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar .env

```bash
cp .env.example .env
nano .env
```

Edite as configurações principais:
- `DB_PASSWORD` - senha do MySQL
- `JWT_SECRET` - gere com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `ADMIN_PASSWORD` - senha do admin

### 4. Configurar banco de dados

```bash
npm run setup-db -- --seed
```

### 5. Iniciar servidor

```bash
npm run dev
```

### 6. Acessar

- **Cardápio:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
  - Email: admin@restaurante.com
  - Senha: Admin@123 (ou a que você definiu)

---

## 🚀 Deploy em VPS (30 minutos)

### Preparação do Servidor

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Instalar MySQL
apt install -y mysql-server
mysql_secure_installation

# Instalar Nginx
apt install -y nginx

# Instalar PM2
npm install -g pm2

# Dependências do Puppeteer
apt install -y chromium-browser
```

### Deploy da Aplicação

```bash
# Criar diretório
mkdir -p /var/www/cardapio
cd /var/www/cardapio

# Transferir arquivos (via Git ou SCP)
git clone seu-repo.git .
# OU
# scp -r cardapio-online/* root@servidor:/var/www/cardapio/

# Instalar dependências
npm install --production

# Configurar .env
cp .env.example .env
nano .env

# Setup do banco
npm run setup-db

# Iniciar com PM2
pm2 start server.js --name cardapio
pm2 save
pm2 startup
```

### Configurar Nginx

```bash
# Copiar configuração
cp nginx.conf.example /etc/nginx/sites-available/cardapio

# Editar domínio
nano /etc/nginx/sites-available/cardapio

# Ativar site
ln -s /etc/nginx/sites-available/cardapio /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Configurar HTTPS

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obter certificado
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## ✅ Checklist de Verificação

### Desenvolvimento
- [ ] Node.js instalado
- [ ] MySQL rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado
- [ ] Setup executado (`npm run setup-db`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Acesso ao cardápio (http://localhost:3000)
- [ ] Login no admin funcionando

### Produção
- [ ] Servidor VPS acessível via SSH
- [ ] Node.js 18+ instalado
- [ ] MySQL instalado e configurado
- [ ] Nginx instalado
- [ ] PM2 instalado
- [ ] Aplicação transferida para `/var/www/cardapio`
- [ ] Dependências instaladas
- [ ] `.env` configurado com valores de produção
- [ ] Banco de dados configurado
- [ ] Aplicação rodando com PM2
- [ ] Nginx configurado
- [ ] HTTPS configurado (Let's Encrypt)
- [ ] Firewall configurado
- [ ] Backup configurado

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar em modo desenvolvimento
npm start            # Iniciar em modo produção
npm run setup-db     # Configurar banco de dados
```

### Produção
```bash
pm2 status           # Ver status
pm2 logs cardapio    # Ver logs
pm2 restart cardapio # Reiniciar
pm2 stop cardapio    # Parar
pm2 start cardapio   # Iniciar
```

### MySQL
```bash
# Backup
mysqldump -u cardapio_user -p cardapio_db > backup.sql

# Restaurar
mysql -u cardapio_user -p cardapio_db < backup.sql
```

---

## 🆘 Problemas Comuns

### "Cannot connect to MySQL"
- Verificar se MySQL está rodando: `systemctl status mysql`
- Verificar credenciais no `.env`
- Testar conexão: `mysql -u cardapio_user -p`

### "Port 3000 already in use"
- Matar processo: `lsof -ti:3000 | xargs kill -9`
- Ou mudar porta no `.env`

### "Permission denied" em uploads
```bash
chmod 755 public/uploads
chown -R www-data:www-data public/uploads  # Em produção
```

### PDF não gera
```bash
# Instalar Chromium
apt install -y chromium-browser
```

### Nginx 502 Bad Gateway
- Verificar se app está rodando: `pm2 status`
- Ver logs: `pm2 logs cardapio`
- Verificar porta no Nginx e `.env`

---

## 📚 Próximos Passos

1. **Alterar senha padrão** do admin
2. **Adicionar pratos** no painel administrativo
3. **Fazer upload de imagens** para pratos em destaque
4. **Testar geração de PDF**
5. **Configurar backup automático**
6. **Personalizar cores e nome** do restaurante

---

Para documentação completa, consulte [README.md](README.md) e [DEPLOY.md](DEPLOY.md).

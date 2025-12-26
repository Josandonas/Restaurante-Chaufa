# 🚀 Guia de Deployment - La Casa del Chaufa

## 📋 Comandos NPM Disponíveis

### `npm run serve` (Recomendado para Produção)
```bash
npm run serve
```
**O que faz:**
- Executa `auto-setup.js` automaticamente
- Verifica/cria banco de dados
- Verifica/cria usuário admin
- Verifica/cria pasta de uploads
- Inicia servidor com Node.js puro
- **Ideal para produção e ambientes estáveis**

### `npm run dev` (Desenvolvimento)
```bash
npm run dev
```
**O que faz:**
- Usa `nodemon` para reiniciar automaticamente ao detectar mudanças
- **Não executa auto-setup**
- Ideal para desenvolvimento ativo
- Requer setup manual do banco antes

### `npm start` (Produção Simples)
```bash
npm start
```
**O que faz:**
- Inicia servidor diretamente com Node.js
- **Não executa auto-setup**
- Mais leve que `serve`
- Requer setup manual do banco antes

### `npm run setup-db` (Setup Manual)
```bash
npm run setup-db
```
**O que faz:**
- Executa apenas o setup do banco de dados
- Útil para configuração inicial manual

---

## 🏗️ Esta é uma Aplicação SPA (Single Page Application)

### Características:
- **Não requer build/compilação**
- Arquivos estáticos servidos diretamente da pasta `/public`
- JavaScript vanilla (sem frameworks que precisam compilar)
- CSS inline no HTML
- Pronto para deploy imediato

### Estrutura de Arquivos:
```
public/
├── index.html          # Cardápio público
├── admin.html          # Painel administrativo
├── admin.js            # Lógica do admin
└── uploads/            # Imagens dos pratos
```

---

## 🌐 Deploy com Nginx

### 1. Configuração Básica do Nginx

```nginx
server {
    listen 80;
    server_name seudominio.com;

    # Proxy para o Node.js
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

    # Cache para arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Uploads com cache longo
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        expires 90d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Configuração com SSL (HTTPS)

```nginx
server {
    listen 443 ssl http2;
    server_name seudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Mesmas configurações de proxy acima
    location / {
        proxy_pass http://localhost:3000;
        # ... resto da config
    }
}

# Redirect HTTP para HTTPS
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🔧 Processo de Deploy em Produção

### Passo 1: Preparar o Servidor
```bash
# Instalar Node.js (v16 ou superior)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
sudo apt-get install mysql-server

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### Passo 2: Clonar e Configurar
```bash
# Clonar repositório
git clone <seu-repo>
cd Restaurante-Chaufa

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
nano .env  # Editar com suas credenciais
```

### Passo 3: Iniciar com PM2
```bash
# Iniciar aplicação
pm2 start npm --name "chaufa" -- run serve

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

### Comandos PM2 Úteis:
```bash
pm2 status              # Ver status
pm2 logs chaufa         # Ver logs
pm2 restart chaufa      # Reiniciar
pm2 stop chaufa         # Parar
pm2 delete chaufa       # Remover
pm2 monit               # Monitor em tempo real
```

---

## 📦 Não Precisa de Build!

### Por que não precisa compilar?

1. **JavaScript Vanilla**: Não usa frameworks como React, Vue, Angular
2. **CSS Inline**: Todo CSS está dentro dos arquivos HTML
3. **Sem TypeScript**: Código JavaScript puro
4. **Sem Bundlers**: Não usa Webpack, Vite, etc.
5. **Arquivos Estáticos**: Servidos diretamente pelo Express

### Vantagens:
- ✅ Deploy instantâneo
- ✅ Sem etapa de build
- ✅ Mais simples de debugar
- ✅ Menor complexidade
- ✅ Arquivos legíveis no servidor

---

## 🔐 Variáveis de Ambiente (.env)

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=cardapio_user
DB_PASSWORD=sua_senha_segura
DB_NAME=cardapio_db
DB_PORT=3306

# JWT
JWT_SECRET=sua_chave_secreta_muito_longa_e_aleatoria

# Servidor
PORT=3000
NODE_ENV=production

# Restaurante
RESTAURANT_NAME=La Casa del Chaufa
```

---

## 🔄 Diferenças: `npm run serve` vs `npm run dev`

| Aspecto | `npm run serve` | `npm run dev` |
|---------|----------------|---------------|
| **Auto-setup** | ✅ Sim | ❌ Não |
| **Reinício automático** | ❌ Não | ✅ Sim (nodemon) |
| **Uso** | Produção/Staging | Desenvolvimento |
| **Performance** | Melhor | Menor |
| **Setup manual** | Não necessário | Necessário |

### Quando usar cada um:

**`npm run serve`:**
- Primeira vez rodando o projeto
- Ambiente de produção
- Após resetar banco de dados
- Deploy em servidor

**`npm run dev`:**
- Desenvolvimento ativo
- Fazendo mudanças no código
- Testando features
- Banco já configurado

---

## 🚨 Troubleshooting

### Problema: "Expulso ao dar reload (Ctrl+F5)"
**Solução:** Corrigido! A aplicação agora:
- Verifica token JWT ao carregar
- Valida remember token se existir
- Mantém sessão após reload
- Limpa tokens inválidos automaticamente

### Problema: Banco não conecta
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais
mysql -u cardapio_user -p

# Recriar banco
npm run setup-db
```

### Problema: Uploads não funcionam
```bash
# Verificar permissões
chmod 755 public/uploads
chown -R www-data:www-data public/uploads
```

---

## 📊 Monitoramento

### Logs do PM2:
```bash
pm2 logs chaufa --lines 100
```

### Logs do Nginx:
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Check:
```bash
curl http://localhost:3000/api/health
```

---

## 🎯 Checklist de Deploy

- [ ] Node.js instalado (v16+)
- [ ] MySQL instalado e rodando
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco criado (`npm run serve` ou `npm run setup-db`)
- [ ] PM2 instalado e configurado
- [ ] Nginx configurado (se aplicável)
- [ ] SSL configurado (se aplicável)
- [ ] Firewall configurado (portas 80, 443, 3000)
- [ ] Backup configurado

---

## 📝 Notas Importantes

1. **Esta aplicação NÃO precisa de build/compilação**
2. Use `npm run serve` para produção (inclui auto-setup)
3. Use `npm run dev` apenas para desenvolvimento
4. Arquivos em `/public` são servidos diretamente
5. Nginx é opcional mas recomendado para produção
6. PM2 gerencia o processo Node.js em produção
7. Remember token funciona por 30 dias no banco de dados
8. Sessão JWT expira em 24 horas

---

**Desenvolvido para La Casa del Chaufa - Comida Peruana Autêntica 🇵🇪**

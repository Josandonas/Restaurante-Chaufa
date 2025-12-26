# 🍽️ Cardápio Online Bilíngue

Sistema completo de cardápio online com painel administrativo, suporte bilíngue (Português/Espanhol) e geração de PDF.

## 🎯 Características

- ✅ **Cardápio público** responsivo e moderno
- ✅ **Painel administrativo** completo para gerenciamento
- ✅ **Bilíngue** (Português e Espanhol)
- ✅ **Geração de PDF** do cardápio
- ✅ **Upload de imagens** para pratos em destaque
- ✅ **Controle de disponibilidade** de pratos
- ✅ **Autenticação JWT** segura
- ✅ **Mobile-first** design
- ✅ **Leve e rápido** - sem frameworks pesados

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + Express
- **MySQL** para banco de dados
- **JWT** para autenticação
- **Puppeteer** para geração de PDF
- **Multer** para upload de imagens

### Frontend
- **HTML5** + **CSS3** + **JavaScript** vanilla
- Design responsivo mobile-first
- Interface moderna e intuitiva

## 📦 Estrutura do Projeto

```
cardapio-online/
├── config/
│   └── database.js          # Configuração do MySQL
├── database/
│   ├── schema.sql           # Schema do banco
│   └── seed.sql             # Dados de exemplo
├── middleware/
│   ├── auth.js              # Autenticação JWT
│   ├── upload.js            # Upload de imagens
│   └── validators.js        # Validação de dados
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── pratos.js            # CRUD de pratos
│   └── pdf.js               # Geração de PDF
├── scripts/
│   └── setup-database.js    # Script de setup
├── public/
│   ├── index.html           # Cardápio público
│   ├── admin.html           # Painel admin
│   ├── admin.js             # Lógica do admin
│   └── uploads/             # Imagens dos pratos
├── server.js                # Servidor principal
├── package.json
├── .env.example
└── README.md
```

## 🚀 Instalação Local

### 1. Pré-requisitos

- Node.js 16+ 
- MySQL 8+
- npm ou yarn

### 2. Clonar o repositório

```bash
git clone seu-repositorio.git
cd cardapio-online
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=cardapio_user
DB_PASSWORD=sua_senha
DB_NAME=cardapio_db
DB_PORT=3306

JWT_SECRET=sua_chave_jwt_super_secreta
RESTAURANT_NAME=Restaurante Chaufa
ADMIN_EMAIL=admin@restaurante.com
ADMIN_PASSWORD=Admin@123
```

### 5. Configurar banco de dados

Criar o banco e usuário no MySQL:

```sql
CREATE DATABASE cardapio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cardapio_user'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON cardapio_db.* TO 'cardapio_user'@'localhost';
FLUSH PRIVILEGES;
```

Executar o script de setup:

```bash
npm run setup-db
```

Para incluir dados de exemplo:

```bash
npm run setup-db -- --seed
```

### 6. Iniciar o servidor

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

### 7. Acessar a aplicação

- **Cardápio:** http://localhost:3000
- **Admin:** http://localhost:3000/admin
- **API:** http://localhost:3000/api

**Credenciais padrão:**
- Email: admin@restaurante.com
- Senha: Admin@123

## 📱 Funcionalidades

### Área Pública

- Visualização do cardápio em português ou espanhol
- Pratos em destaque com imagens
- Lista completa de pratos
- Indicação visual de pratos indisponíveis
- Download do cardápio em PDF
- Design responsivo para mobile e desktop

### Painel Administrativo

#### Aba 1: Listagem de Pratos
- ➕ Adicionar novos pratos
- ✏️ Editar pratos existentes
- 🗑️ Excluir pratos (definitivamente)
- ✅ Ativar/Desativar pratos
- Campos: Nome (PT/ES), Descrição (PT/ES), Preços (BRL/BOB)

#### Aba 2: Pratos em Destaque
- ➕ Adicionar pratos em destaque
- 🖼️ Upload de imagens
- 📊 Definir ordem de exibição
- ✏️ Editar informações
- ✅ Ativar/Desativar
- 🗑️ Excluir

### Geração de PDF

- PDF profissional do cardápio completo
- Suporte bilíngue (PT/ES)
- Inclui pratos em destaque e lista completa
- Indicação de pratos indisponíveis
- Cabeçalho com nome do restaurante
- Rodapé com numeração de páginas
- Data e hora de geração

## 🔒 Segurança

- Autenticação JWT para rotas administrativas
- Senhas hasheadas com bcrypt
- Validação de dados com express-validator
- Upload de imagens com validação de tipo
- Proteção contra SQL injection (prepared statements)
- CORS configurável

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login administrativo
- `POST /api/auth/verify` - Verificar token

### Pratos
- `GET /api/pratos/public` - Listar pratos (público)
- `GET /api/pratos` - Listar pratos (admin)
- `GET /api/pratos/:id` - Buscar prato específico
- `POST /api/pratos` - Criar prato
- `PUT /api/pratos/:id` - Atualizar prato
- `DELETE /api/pratos/:id` - Excluir prato

### PDF
- `GET /api/pdf/generate?lang=pt` - Gerar PDF em português
- `GET /api/pdf/generate?lang=es` - Gerar PDF em espanhol

## 🎨 Personalização

### Alterar cores

Edite os arquivos HTML em `public/`:
- Gradientes de fundo
- Cores dos botões
- Cores de destaque

### Alterar nome do restaurante

No arquivo `.env`:
```env
RESTAURANT_NAME=Seu Restaurante
```

### Adicionar mais idiomas

1. Adicionar campos no banco de dados (`nome_xx`, `descricao_xx`)
2. Atualizar rotas e validações
3. Adicionar traduções no frontend

## 🐛 Troubleshooting

### Erro de conexão com MySQL
- Verificar credenciais no `.env`
- Confirmar que o MySQL está rodando
- Verificar permissões do usuário

### Upload de imagens não funciona
- Verificar permissões da pasta `public/uploads`
- Confirmar `MAX_FILE_SIZE` no `.env`

### PDF não gera
- Instalar dependências do Puppeteer
- Em produção: instalar Chromium

```bash
# Ubuntu/Debian
apt install -y chromium-browser
```

## 📝 Modelagem de Dados

### Tabela: pratos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único |
| nome_pt | VARCHAR(255) | Nome em português |
| nome_es | VARCHAR(255) | Nome em espanhol |
| descricao_pt | TEXT | Descrição em português |
| descricao_es | TEXT | Descrição em espanhol |
| preco_brl | DECIMAL(10,2) | Preço em reais |
| preco_bob | DECIMAL(10,2) | Preço em bolivianos |
| ativo | BOOLEAN | Disponibilidade |
| tipo | ENUM | 'lista' ou 'destaque' |
| imagem_url | VARCHAR(500) | Caminho da imagem |
| ordem | INT | Ordem de exibição |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Data de atualização |

### Tabela: usuarios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INT | ID único |
| email | VARCHAR(255) | Email (único) |
| senha | VARCHAR(255) | Senha hasheada |
| nome | VARCHAR(100) | Nome do usuário |
| criado_em | TIMESTAMP | Data de criação |

## 🚀 Deploy em Produção

Consulte o arquivo [DEPLOY.md](DEPLOY.md) para instruções completas de deploy em VPS Linux com Nginx e HTTPS.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença ISC.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Desenvolvido com ❤️ para restaurantes que querem modernizar seu cardápio.

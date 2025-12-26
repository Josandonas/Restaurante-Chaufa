#!/bin/bash

echo "═══════════════════════════════════════════════════"
echo "🍽️  Instalação do Sistema de Cardápio Online"
echo "═══════════════════════════════════════════════════"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 16+ primeiro."
    exit 1
fi

echo "✓ Node.js $(node --version) encontrado"

# Verificar se MySQL está instalado
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL não encontrado. Por favor, instale MySQL primeiro."
    exit 1
fi

echo "✓ MySQL encontrado"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✓ Dependências instaladas"

# Verificar se .env existe
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Criando arquivo .env..."
    cp .env.example .env
    echo "✓ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações:"
    echo "   - DB_PASSWORD (senha do MySQL)"
    echo "   - JWT_SECRET (chave secreta)"
    echo "   - ADMIN_PASSWORD (senha do admin)"
    echo ""
    echo "Gere um JWT_SECRET seguro com:"
    echo "node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    echo ""
    read -p "Pressione ENTER após configurar o .env..."
fi

# Perguntar se deseja configurar o banco de dados
echo ""
read -p "Deseja configurar o banco de dados agora? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "📊 Configurando banco de dados..."
    
    read -p "Incluir dados de exemplo? (s/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        npm run setup-db -- --seed
    else
        npm run setup-db
    fi
    
    if [ $? -eq 0 ]; then
        echo "✓ Banco de dados configurado com sucesso"
    else
        echo "❌ Erro ao configurar banco de dados"
        echo "Verifique as credenciais no arquivo .env"
        exit 1
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Instalação concluída!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "Para iniciar o servidor:"
echo "  Desenvolvimento: npm run dev"
echo "  Produção:        npm start"
echo ""
echo "Acesse:"
echo "  Cardápio: http://localhost:3000"
echo "  Admin:    http://localhost:3000/admin"
echo ""
echo "Credenciais padrão:"
echo "  Email: admin@restaurante.com"
echo "  Senha: Admin@123"
echo ""
echo "⚠️  Altere a senha após o primeiro login!"
echo "═══════════════════════════════════════════════════"

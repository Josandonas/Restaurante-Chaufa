
# Restaurante Chaufa

Aplicação web para gerenciamento de cardápio digital, com edição de pratos, geração de PDF, visualização responsiva e autenticação de usuários. Ideal para restaurantes que desejam um cardápio dinâmico e acessível via QR Code.

---

## **Tecnologias utilizadas**

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **ShadCN UI**
- **Zod**
- **Lucia Auth**
- **Prisma ORM**
- **PostgreSQL**
- **PDFMake** (geração de PDFs)
- **QR Code** (integração futura)

---

## **Pré-requisitos**

Antes de rodar o projeto, certifique-se de ter instalado:

- [Node.js (v18+)](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [pnpm](https://pnpm.io/) ou `npm`/`yarn` (adaptar se necessário)

---

## **Instalação e execução**

```bash
# Clone o repositório
git clone https://github.com/Josandonas/Restaurante-Chaufa.git

# Acesse a pasta
cd Restaurante-Chaufa

# Instale as dependências
pnpm install

# Copie o arquivo .env.example e configure as variáveis
cp .env.example .env
```

Edite o `.env` com suas credenciais, por exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/restaurante"
AUTH_SECRET="uma_chave_secreta_segura"
```

```bash
# Execute as migrações do banco de dados
pnpm prisma migrate dev

# Rode o projeto
pnpm dev
```

Acesse a aplicação em: [http://localhost:3000](http://localhost:3000)

---

## **Scripts disponíveis**

```bash
pnpm dev           # Inicia o servidor de desenvolvimento
pnpm build         # Gera a build para produção
pnpm start         # Inicia o servidor em modo produção
pnpm prisma studio # Abre painel visual para o banco de dados
```

---

## **Funcionalidades**

- Visualização pública de cardápio
- Geração de PDF com data, hora e versão
- Autenticação de usuários (admin)
- CRUD completo de pratos (nome, descrição, preço, categoria)
- Responsivo para mobile e desktop
- Atualização automática do conteúdo
- Interface moderna com Tailwind + ShadCN
- Estrutura pronta para suporte multilíngue (PT/EN)
- Agrupamento por categoria no PDF
- Suporte futuro para logotipo, imagens e paginação em PDF

---

## **Estrutura do projeto**

```
.
├── app/                # Rotas App Router do Next.js
│   ├── api/            # Rotas da API (auth, pratos, etc.)
│   ├── painel/         # Área administrativa
│   └── page.tsx        # Página inicial (menu público)
├── components/         # Componentes reutilizáveis
├── lib/                # Funções utilitárias e configurações (auth, prisma)
├── prisma/             # Schema do banco de dados
├── public/             # Arquivos estáticos
├── styles/             # Estilos globais
├── types/              # Tipagens auxiliares
├── .env.example        # Exemplo de variáveis de ambiente
└── README.md
```

---

## **Contribuição**

Pull requests são bem-vindos! Para contribuir:

1. Fork este repositório
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit suas alterações: `git commit -m 'feat: nova feature'`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

---

## **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## **Autor**

Desenvolvido por [Josandonas](https://github.com/Josandonas)
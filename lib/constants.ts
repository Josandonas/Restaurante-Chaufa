/**
 * constants.ts
 * 
 * Este arquivo centraliza todas as constantes do projeto para facilitar manutenção
 * e garantir consistência em toda a aplicação.
 */

// Firebase Collections
export const COLLECTIONS = {
  CARDAPIO: 'cardapio',
  CATEGORIAS: 'categorias',
  CONFIGURACOES: 'configuracoes',
  LIXEIRA: 'lixeira',
} as const;

// Campos comuns em documentos
export const DOCUMENT_FIELDS = {
  ATIVO: 'ativo',
  NOME: 'nome',
  DESCRICAO: 'descricao',
  PRECO: 'preco',
  CATEGORIA: 'categoria',
  CRIADO_EM: 'criado_em',
  VERSAO: 'versao',
  ULTIMA_ATUALIZACAO: 'ultimaAtualizacao',
} as const;

// Prefixos especiais
export const PREFIXES = {
  NOVA_CATEGORIA: 'nova:',
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
  // Erros de validação
  CATEGORIA_DUPLICADA: 'Já existe uma categoria com esse nome (verifique acentuação e caixa).',
  CAMPOS_OBRIGATORIOS: 'Todos os campos marcados com * são obrigatórios.',
  PRECO_INVALIDO: 'O preço deve ser maior que zero.',
  NOME_OBRIGATORIO: 'O nome do prato é obrigatório.',
  CATEGORIA_OBRIGATORIA: 'A categoria é obrigatória.',
  
  // Erros de carregamento
  ERRO_CARREGAR_PRATOS: 'Erro ao carregar os pratos. Recarregue a página.',
  ERRO_CARREGAR_CATEGORIAS: 'Erro ao carregar as categorias. Recarregue a página.',
  
  // Erros de operações com pratos
  ERRO_ADICIONAR_PRATO: 'Erro ao adicionar prato. Tente novamente.',
  ERRO_EDITAR_PRATO: 'Não foi possível editar o prato. Tente novamente.',
  ERRO_EXCLUIR_PRATO: 'Não foi possível excluir o prato. Tente novamente.',
  ERRO_SALVAR_PRATO: 'Ocorreu um erro ao salvar o prato. Tente novamente.',
  
  // Erros de operações com categorias
  ERRO_ADICIONAR_CATEGORIA: 'Não foi possível adicionar a categoria.',
  ERRO_RESTAURAR_CATEGORIA: 'Não foi possível restaurar a categoria.',
  ERRO_MOVER_CATEGORIA_LIXEIRA: 'Não foi possível mover a categoria para a lixeira.',
  
  // Outros erros
  ERRO_ATUALIZAR_VERSAO: 'Erro ao atualizar versão do cardápio.',
  ERRO_AUTENTICACAO: 'Falha na autenticação. Verifique suas credenciais.',
  ERRO_GERAR_PDF: 'Erro ao gerar o PDF do cardápio. Tente novamente.',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
  ITEM_CRIADO: 'Item criado com sucesso!',
  ITEM_ATUALIZADO: 'Item atualizado com sucesso!',
  ITEM_REMOVIDO: 'Item movido para a lixeira.',
  ITEM_RESTAURADO: 'Item restaurado com sucesso!',
  PRATO_ADICIONADO: 'Prato adicionado com sucesso!',
  CARDAPIO_ATUALIZADO: 'Cardápio atualizado com sucesso!',
} as const;

// Estados de loading
export const LOADING_STATES = {
  AUTENTICANDO: 'Autenticando...',
  CARREGANDO_PRATOS: 'Carregando pratos...',
  CARREGANDO_CATEGORIAS: 'Carregando categorias...',
  CARREGANDO_VERSAO: 'Carregando informações de versão...',
  GERANDO_PDF: 'Gerando PDF...',
  SALVANDO: 'Salvando...',
} as const;

// Textos de UI
export const UI_LABELS = {
  // Títulos e cabeçalhos
  CARDAPIO: 'Cardápio Digital',
  NOVO_PRATO: 'Novo Prato',
  EDITAR_PRATO: 'Editar Prato',
  NOVA_CATEGORIA: 'Nova Categoria',
  PRATOS_DISPONIVEIS: 'Pratos Disponíveis',
  ADMIN_STATUS: 'Logado como Administrador',
  SEM_PRATOS: 'Nenhum prato cadastrado.',
  
  // Botões e ações
  CANCELAR: 'Cancelar',
  CONFIRMAR: 'Confirmar',
  SALVAR: 'Salvar',
  SALVANDO: 'Salvando...',
  ADICIONAR: 'Adicionar ao Cardápio',
  RESTAURAR: 'Restaurar',
  EXCLUIR: 'Excluir',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  BAIXAR_PDF: 'Baixar Cardápio em PDF',
  
  // Informações adicionais
  VERSAO_INFO: 'Versão: {0}',
  PDF_INFO: 'Clique para baixar o cardápio completo em formato PDF.',
  VERSAO_INDISPONIVEL: 'Versão: não disponível',
  SEM_DESCRICAO: 'Sem descrição',
  MENSAGEM_ITEM_LIXEIRA: 'Você poderá recuperá-lo posteriormente na página da Lixeira.',
} as const;

// Placeholders para campos de formulário
export const PLACEHOLDERS = {
  NOME_PRATO: 'Nome do prato',
  PRECO_PRATO: 'Preço do prato',
  DESCRICAO_PRATO: 'Descrição do prato',
  NOVA_CATEGORIA: 'Digite o nome da nova categoria',
  SELECIONE_CATEGORIA: 'Selecione uma categoria',
} as const;

// Labels para formulários
export const FORM_LABELS = {
  NOME_PRATO: 'Nome *',
  PRECO: 'Preço *',
  CATEGORIA: 'Categoria *',
  DESCRICAO: 'Descrição',
  NOVA_CATEGORIA: 'Nova Categoria *',
  CADASTRAR_NOVA_CATEGORIA: 'Cadastrar nova categoria',
} as const;

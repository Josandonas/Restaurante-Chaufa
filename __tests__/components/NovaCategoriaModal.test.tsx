import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NovaCategoriaModal } from '@/app/components/NovaCategoriaModal';
import { useCategorias } from '@/hooks/useCategorias';
import { ERROR_MESSAGES } from '@/lib/constants';

// Mock do hook useCategorias
jest.mock('@/hooks/useCategorias', () => ({
  useCategorias: jest.fn()
}));

describe('NovaCategoriaModal', () => {
  // Configuração padrão para mocks
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockAdicionarCategoria = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão para o hook useCategorias
    (useCategorias as jest.Mock).mockReturnValue({
      categorias: [],
      loading: false,
      error: null,
      adicionarCategoria: mockAdicionarCategoria
    });
  });

  test('renderiza corretamente com os elementos esperados', () => {
    render(<NovaCategoriaModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Verificar elementos principais
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nova Categoria/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar/i })).toBeInTheDocument();
  });

  test('fecha o modal ao clicar em Cancelar', () => {
    render(<NovaCategoriaModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('exibe erro quando o campo de nome está vazio', async () => {
    render(<NovaCategoriaModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Tenta salvar sem preencher o nome
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    // Verifica se o erro foi exibido
    expect(screen.getByText(ERROR_MESSAGES.CAMPOS_OBRIGATORIOS)).toBeInTheDocument();
    expect(mockAdicionarCategoria).not.toHaveBeenCalled();
  });

  test('exibe erro quando a categoria já existe', async () => {
    // Mock com uma categoria existente
    (useCategorias as jest.Mock).mockReturnValue({
      categorias: [{ id: '1', nome: 'Categoria Existente', ativo: true }],
      loading: false,
      error: null,
      adicionarCategoria: mockAdicionarCategoria
    });
    
    render(<NovaCategoriaModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Preenche o nome com uma categoria que já existe (ignorando case/trim)
    fireEvent.change(screen.getByLabelText(/Nova Categoria/i), { 
      target: { value: ' categoria existente ' } 
    });
    
    // Tenta salvar
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    // Verifica se o erro de duplicidade foi exibido
    expect(screen.getByText(ERROR_MESSAGES.CATEGORIA_DUPLICADA)).toBeInTheDocument();
    expect(mockAdicionarCategoria).not.toHaveBeenCalled();
  });

  test('cria uma nova categoria com sucesso', async () => {
    mockAdicionarCategoria.mockResolvedValue(undefined);
    
    render(<NovaCategoriaModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Preenche o nome da categoria
    fireEvent.change(screen.getByLabelText(/Nova Categoria/i), { 
      target: { value: 'Nova Categoria Teste' } 
    });
    
    // Clica no botão de salvar
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    // Verificar se a função foi chamada com o valor correto
    await waitFor(() => {
      expect(mockAdicionarCategoria).toHaveBeenCalledWith('Nova Categoria Teste');
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('exibe erro quando falha ao adicionar categoria', async () => {
    // Mock para simular falha na adição
    mockAdicionarCategoria.mockRejectedValue(new Error('Erro ao adicionar'));
    
    render(<NovaCategoriaModal onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    // Preenche o nome da categoria
    fireEvent.change(screen.getByLabelText(/Nova Categoria/i), { 
      target: { value: 'Categoria com Erro' } 
    });
    
    // Clica no botão de salvar
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));
    
    // Verificar se o erro foi exibido e as funções de callback não foram chamadas
    await waitFor(() => {
      expect(screen.getByText(ERROR_MESSAGES.ERRO_ADICIONAR_CATEGORIA)).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCategorias } from '@/hooks/useCategorias';
import * as categoriaService from '@/services/categoriaService';
import { ERROR_MESSAGES } from '@/lib/constants';

// Mock do módulo categoriaService
jest.mock('@/services/categoriaService');

describe('useCategorias', () => {
  // Dados de teste
  const mockCategorias = [
    { id: '1', nome: 'Categoria 1', criado_em: new Date(), ativo: true },
    { id: '2', nome: 'Categoria 2', criado_em: new Date(), ativo: true }
  ];
  
  const mockCategoriasLixeira = [
    { id: '3', nome: 'Categoria 3', criado_em: new Date(), ativo: false },
    { id: '4', nome: 'Categoria 4', criado_em: new Date(), ativo: false }
  ];
  
  // Função auxiliar para simular que o listener do Firestore é chamado imediatamente
  const mockListenCallback = (categorias: any[], mockFn: jest.Mock) => {
    mockFn.mockImplementation((callback) => {
      callback(categorias);
      return jest.fn(); // Retorna uma função de unsubscribe
    });
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão para os mocks
    mockListenCallback(mockCategorias, categoriaService.listenCategorias as jest.Mock);
    mockListenCallback(mockCategoriasLixeira, categoriaService.listenCategoriasLixeira as jest.Mock);
    (categoriaService.addCategoria as jest.Mock).mockResolvedValue(undefined);
    (categoriaService.restaurarCategoria as jest.Mock).mockResolvedValue(undefined);
    (categoriaService.moverParaLixeiraCategoria as jest.Mock).mockResolvedValue(undefined);
  });

  test('deve carregar categorias ativas corretamente', async () => {
    const { result } = renderHook(() => useCategorias(true));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(categoriaService.listenCategorias).toHaveBeenCalled();
    expect(result.current.categorias).toEqual(mockCategorias);
    expect(result.current.error).toBeNull();
  });
  
  test('deve carregar categorias da lixeira corretamente', async () => {
    const { result } = renderHook(() => useCategorias(false));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(categoriaService.listenCategoriasLixeira).toHaveBeenCalled();
    expect(result.current.categorias).toEqual(mockCategoriasLixeira);
    expect(result.current.error).toBeNull();
  });
  
  test('deve adicionar categoria corretamente', async () => {
    const { result } = renderHook(() => useCategorias());
    
    await act(async () => {
      await result.current.adicionarCategoria('Nova Categoria');
    });
    
    expect(categoriaService.addCategoria).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Nova Categoria',
        ativo: true
      })
    );
    expect(result.current.error).toBeNull();
  });
  
  test('deve restaurar categoria corretamente', async () => {
    const { result } = renderHook(() => useCategorias(false));
    
    await act(async () => {
      await result.current.restaurarCategoria('3');
    });
    
    expect(categoriaService.restaurarCategoria).toHaveBeenCalledWith('3');
    expect(result.current.error).toBeNull();
  });
  
  test('deve mover categoria para lixeira corretamente', async () => {
    const { result } = renderHook(() => useCategorias());
    
    await act(async () => {
      await result.current.moverParaLixeira('1');
    });
    
    expect(categoriaService.moverParaLixeiraCategoria).toHaveBeenCalledWith('1');
    expect(result.current.error).toBeNull();
  });
  
  test('deve tratar erros ao adicionar categoria', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_ADICIONAR_CATEGORIA;
    (categoriaService.addCategoria as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useCategorias());
    
    await expect(async () => {
      await act(async () => {
        await result.current.adicionarCategoria('Nova Categoria');
      });
    }).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });
  
  test('deve tratar erros ao restaurar categoria', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_RESTAURAR_CATEGORIA;
    (categoriaService.restaurarCategoria as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useCategorias(false));
    
    await expect(async () => {
      await act(async () => {
        await result.current.restaurarCategoria('3');
      });
    }).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });
  
  test('deve tratar erros ao mover categoria para lixeira', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_MOVER_CATEGORIA_LIXEIRA;
    (categoriaService.moverParaLixeiraCategoria as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useCategorias());
    
    await expect(async () => {
      await act(async () => {
        await result.current.moverParaLixeira('1');
      });
    }).rejects.toThrow(errorMessage);
    
    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });
  
  test('deve tratar erros ao carregar categorias', async () => {
    (categoriaService.listenCategorias as jest.Mock).mockImplementation(() => {
      throw new Error(ERROR_MESSAGES.ERRO_CARREGAR_CATEGORIAS);
    });
    
    const { result } = renderHook(() => useCategorias());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(ERROR_MESSAGES.ERRO_CARREGAR_CATEGORIAS);
      expect(result.current.categorias).toEqual([]);
    });
  });
});

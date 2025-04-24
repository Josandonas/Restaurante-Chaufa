import { renderHook, act, waitFor } from '@testing-library/react';
import { usePratos } from '@/hooks/usePratos';
import * as pratoService from '@/services/pratoService';
import { ERROR_MESSAGES } from '@/lib/constants';
import type { Prato } from '@/models/Prato';

// Mock do módulo pratoService
jest.mock('@/services/pratoService');

describe('usePratos', () => {
  // Dados de teste
  const mockUser = { uid: 'user-1', email: 'teste@exemplo.com' } as any;
  
  const mockPratos: Prato[] = [
    { 
      id: 'prato-1', 
      nome: 'Arroz Chaufa', 
      preco: 25.90, 
      descricao: 'Prato tradicional peruano', 
      categoria: 'categoria-1', 
      imagem: 'url-imagem-1', 
      criado_em: new Date(), 
      ativo: true 
    },
    { 
      id: 'prato-2', 
      nome: 'Lomo Saltado', 
      preco: 32.90, 
      descricao: 'Carne com legumes', 
      categoria: 'categoria-2', 
      imagem: 'url-imagem-2', 
      criado_em: new Date(), 
      ativo: true 
    }
  ];

  const mockPratosLixeira: Prato[] = [
    { 
      id: 'prato-3', 
      nome: 'Prato Antigo', 
      preco: 19.90, 
      descricao: 'Descrição do prato antigo', 
      categoria: 'categoria-1', 
      imagem: 'url-imagem-3', 
      criado_em: new Date(), 
      ativo: false 
    }
  ];

  const novoPrato: Omit<Prato, 'id'> = {
    nome: 'Novo Prato',
    preco: 27.90,
    descricao: 'Descrição do novo prato',
    categoria: 'categoria-1',
    imagem: 'url-nova-imagem',
    criado_em: new Date(),
    ativo: true
  };
  
  // Função auxiliar para simular que o listener do Firestore é chamado imediatamente
  const mockListenCallback = (pratos: Prato[], mockFn: jest.Mock) => {
    mockFn.mockImplementation((callback) => {
      callback(pratos);
      return jest.fn(); // Retorna uma função de unsubscribe
    });
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão para os mocks
    mockListenCallback(mockPratos, pratoService.listenPratos as jest.Mock);
    mockListenCallback(mockPratosLixeira, pratoService.listenPratosLixeira as jest.Mock);
    (pratoService.addPrato as jest.Mock).mockResolvedValue(undefined);
    (pratoService.updatePrato as jest.Mock).mockResolvedValue(undefined);
    (pratoService.removePrato as jest.Mock).mockResolvedValue(undefined);
    (pratoService.moverParaLixeiraPrato as jest.Mock).mockResolvedValue(undefined);
    (pratoService.restaurarPrato as jest.Mock).mockResolvedValue(undefined);
  });

  test('deve carregar pratos ativos corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser, true));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(pratoService.listenPratos).toHaveBeenCalled();
    expect(result.current.pratos).toEqual(mockPratos);
    expect(result.current.error).toBeNull();
  });
  
  test('deve carregar pratos da lixeira corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser, false));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(pratoService.listenPratosLixeira).toHaveBeenCalled();
    expect(result.current.pratos).toEqual(mockPratosLixeira);
    expect(result.current.error).toBeNull();
  });
  
  test('não deve carregar pratos quando usuário não está autenticado', async () => {
    const { result } = renderHook(() => usePratos(null));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(pratoService.listenPratos).not.toHaveBeenCalled();
    expect(pratoService.listenPratosLixeira).not.toHaveBeenCalled();
    expect(result.current.pratos).toEqual([]);
  });
  
  test('deve adicionar prato corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser));
    
    await act(async () => {
      await result.current.adicionarPrato(novoPrato);
    });
    
    expect(pratoService.addPrato).toHaveBeenCalledWith(novoPrato);
    expect(result.current.error).toBeNull();
  });
  
  test('deve tratar erro ao adicionar prato', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_ADICIONAR_PRATO;
    (pratoService.addPrato as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => usePratos(mockUser));
    
    await expect(async () => {
      await act(async () => {
        await result.current.adicionarPrato(novoPrato);
      });
    }).rejects.toThrow();
    
    expect(result.current.error).toBe(errorMessage);
  });
  
  test('deve abrir modal de edição corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser));
    
    act(() => {
      result.current.abrirModal(mockPratos[0]);
    });
    
    expect(result.current.modalAberto).toBe(true);
    expect(result.current.pratoEditando).toEqual(mockPratos[0]);
  });
  
  test('deve fechar modal de edição corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser));
    
    // Primeiro abre o modal
    act(() => {
      result.current.abrirModal(mockPratos[0]);
    });
    
    // Depois fecha o modal
    act(() => {
      result.current.fecharModal();
    });
    
    expect(result.current.modalAberto).toBe(false);
    expect(result.current.pratoEditando).toBeNull();
  });
  
  test('deve salvar edição de prato corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser));
    
    // Configura o prato em edição
    act(() => {
      result.current.abrirModal(mockPratos[0]);
      
      // Simula alteração no prato
      if (result.current.pratoEditando) {
        result.current.setPratoEditando({
          ...result.current.pratoEditando,
          nome: 'Nome Atualizado',
          preco: 29.90
        });
      }
    });
    
    // Salva as alterações
    await act(async () => {
      await result.current.salvarEdicao();
    });
    
    expect(pratoService.updatePrato).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'prato-1',
        nome: 'Nome Atualizado',
        preco: 29.90
      })
    );
    expect(result.current.modalAberto).toBe(false);
    expect(result.current.pratoEditando).toBeNull();
  });
  
  test('deve tratar erro ao salvar edição', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_EDITAR_PRATO;
    (pratoService.updatePrato as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => usePratos(mockUser));
    
    // Configura o prato em edição
    act(() => {
      result.current.abrirModal(mockPratos[0]);
    });
    
    // Tenta salvar as alterações
    await expect(async () => {
      await act(async () => {
        await result.current.salvarEdicao();
      });
    }).rejects.toThrow();
    
    expect(result.current.error).toBe(errorMessage);
  });
  
  test('deve mover prato para lixeira corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser));
    
    await act(async () => {
      await result.current.moverParaLixeira('prato-1');
    });
    
    expect(pratoService.moverParaLixeiraPrato).toHaveBeenCalledWith('prato-1');
    expect(result.current.error).toBeNull();
  });
  
  test('deve tratar erro ao mover para lixeira', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_EXCLUIR_PRATO;
    (pratoService.moverParaLixeiraPrato as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => usePratos(mockUser));
    
    await expect(async () => {
      await act(async () => {
        await result.current.moverParaLixeira('prato-1');
      });
    }).rejects.toThrow();
    
    expect(result.current.error).toBe(errorMessage);
  });
  
  test('deve restaurar prato corretamente', async () => {
    const { result } = renderHook(() => usePratos(mockUser, false));
    
    await act(async () => {
      await result.current.restaurarPrato('prato-3');
    });
    
    expect(pratoService.restaurarPrato).toHaveBeenCalledWith('prato-3');
    expect(result.current.error).toBeNull();
  });
  
  test('deve tratar erro ao restaurar prato', async () => {
    (pratoService.restaurarPrato as jest.Mock).mockRejectedValue(new Error('Erro ao restaurar'));
    
    const { result } = renderHook(() => usePratos(mockUser, false));
    
    await expect(async () => {
      await act(async () => {
        await result.current.restaurarPrato('prato-3');
      });
    }).rejects.toThrow();
    
    expect(result.current.error).toBe('Não foi possível restaurar o prato.');
  });
  
  test('deve remover prato permanentemente', async () => {
    const { result } = renderHook(() => usePratos(mockUser));
    
    await act(async () => {
      await result.current.removerPrato('prato-1');
    });
    
    expect(pratoService.removePrato).toHaveBeenCalledWith('prato-1');
    expect(result.current.error).toBeNull();
  });
  
  test('deve tratar erro ao remover prato', async () => {
    const errorMessage = ERROR_MESSAGES.ERRO_EXCLUIR_PRATO;
    (pratoService.removePrato as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => usePratos(mockUser));
    
    await expect(async () => {
      await act(async () => {
        await result.current.removerPrato('prato-1');
      });
    }).rejects.toThrow();
    
    expect(result.current.error).toBe(errorMessage);
  });
});

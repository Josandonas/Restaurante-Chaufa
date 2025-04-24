import { renderHook, waitFor } from '@testing-library/react';
import { useAuthGuard } from '@/app/hooks/useAuthGuard';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock dos hooks necessários
jest.mock('@/app/context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('useAuthGuard', () => {
  // Mock do router para verificação de redirecionamento
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuração padrão do router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });
  
  test('redireciona para login quando usuário não está autenticado', async () => {
    // Mock do useAuth para simular usuário não autenticado
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      error: null
    });
    
    // Renderizar o hook
    renderHook(() => useAuthGuard());
    
    // Verificar se ocorreu o redirecionamento para a página de login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });
  });
  
  test('não redireciona quando usuário está autenticado', async () => {
    // Mock do useAuth para simular usuário autenticado
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: '123', email: 'teste@exemplo.com' },
      loading: false,
      error: null
    });
    
    // Renderizar o hook
    renderHook(() => useAuthGuard());
    
    // Verificar que não ocorreu redirecionamento
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
  
  test('não redireciona enquanto está carregando', async () => {
    // Mock do useAuth para simular carregamento em andamento
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      error: null
    });
    
    // Renderizar o hook
    renderHook(() => useAuthGuard());
    
    // Verificar que não ocorreu redirecionamento enquanto carrega
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});

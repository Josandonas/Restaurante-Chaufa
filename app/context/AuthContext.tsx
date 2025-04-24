/**
 * AuthContext.tsx
 * 
 * Contexto de autenticação do usuário utilizando Firebase Authentication.
 * Fornece estado de autenticação, funções de login/logout e estado de carregamento.
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Interface que define o tipo do contexto de autenticação
 */
interface AuthContextType {
  /** Usuário autenticado atual, ou null se não estiver autenticado */
  user: User | null;
  /** Estado de carregamento da autenticação */
  loading: boolean;
  /** Função para fazer logout */
  logout: () => Promise<void>;
  /** Mensagem de erro de autenticação, se houver */
  error: string | null;
}

/**
 * Contexto de autenticação com valores padrão
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  error: null
});

/**
 * Provedor do contexto de autenticação
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado do usuário atual
  const [user, setUser] = useState<User | null>(null);
  // Estado de carregamento da autenticação
  const [loading, setLoading] = useState(true);
  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Efeito para observar mudanças no estado de autenticação
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth, 
        // Callback quando o estado de autenticação muda
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
          setError(null);
        }
      );
      
      // Cleanup ao desmontar o componente
      return unsubscribe;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao monitorar estado de autenticação: ${errorMessage}`, error);
      setError(ERROR_MESSAGES.ERRO_AUTENTICACAO);
      setLoading(false);
      return () => {}; // Função de limpeza vazia em caso de erro
    }
  }, []);

  /**
   * Realiza o logout do usuário
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao fazer logout: ${errorMessage}`, error);
      setError(ERROR_MESSAGES.ERRO_AUTENTICACAO);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de autenticação
 * @returns Contexto de autenticação com usuário, estado de carregamento e funções
 */
export function useAuth() {
  return useContext(AuthContext);
}
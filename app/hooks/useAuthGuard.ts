/**
 * useAuthGuard.ts
 * 
 * Hook personalizado para proteção de rotas que requerem autenticação.
 * Redireciona para a página de admin quando o usuário não está autenticado.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Hook para proteção de rotas autenticadas
 * 
 * @returns Objeto contendo o usuário atual e estado de carregamento
 */
export function useAuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Efeito para redirecionar usuários não autenticados
  useEffect(() => {
    if (!loading && !user) {
      console.log('Acesso não autorizado: redirecionando para página de login');
      router.push('/admin');
    }
  }, [user, loading, router]);

  return { user, loading };
}
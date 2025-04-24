/**
 * useCategorias.ts
 * 
 * Hook personalizado para gerenciar categorias do cardápio.
 * Fornece funções para listar, adicionar e gerenciar categorias.
 */

import { useEffect, useState, useCallback } from 'react';
import type { Categoria } from '@/models/Categoria';
import * as categoriaService from '@/services/categoriaService';
import { NovaCategoria } from '@/services/categoriaService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';

/**
 * Interface de retorno do hook useCategorias
 */
interface UseCategoriaRetorno {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  adicionarCategoria: (nome: string) => Promise<void>;
  restaurarCategoria: (categoriaId: string) => Promise<void>;
  moverParaLixeira: (categoriaId: string) => Promise<void>;
}

/**
 * Hook para gerenciar categorias
 * @param ativos Se true, retorna apenas categorias ativas; se false, retorna categorias na lixeira
 * @returns Objeto com categorias e funções para gerenciá-las
 */
export function useCategorias(ativos: boolean = true): UseCategoriaRetorno {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
      setLoading(true);
      setError(null);
      
      unsubscribe = ativos
        ? categoriaService.listenCategorias(setCategorias)
        : categoriaService.listenCategoriasLixeira(setCategorias);
        
      setLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao carregar categorias: ${errorMessage}`, error);
      setError(ERROR_MESSAGES.ERRO_CARREGAR_CATEGORIAS);
      setLoading(false);
    }
    
    return () => unsubscribe();
  }, [ativos]);

  /**
   * Adiciona uma nova categoria
   */
  const adicionarCategoria = useCallback(async (nome: string): Promise<void> => {
    try {
      setError(null);
      const novaCategoria: NovaCategoria = {
        nome: nome.trim(),
        criado_em: new Date(),
        ativo: true
      };
      await categoriaService.addCategoria(novaCategoria);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao adicionar categoria: ${errorMessage}`, error);
      setError(ERROR_MESSAGES.ERRO_ADICIONAR_CATEGORIA);
      throw new Error(ERROR_MESSAGES.ERRO_ADICIONAR_CATEGORIA);
    }
  }, []);

  /**
   * Restaura uma categoria da lixeira
   */
  const restaurarCategoria = useCallback(async (categoriaId: string): Promise<void> => {
    try {
      setError(null);
      await categoriaService.restaurarCategoria(categoriaId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao restaurar categoria: ${errorMessage}`, error);
      setError(ERROR_MESSAGES.ERRO_RESTAURAR_CATEGORIA);
      throw new Error(ERROR_MESSAGES.ERRO_RESTAURAR_CATEGORIA);
    }
  }, []);

  /**
   * Move uma categoria para a lixeira
   */
  const moverParaLixeira = useCallback(async (categoriaId: string): Promise<void> => {
    try {
      setError(null);
      await categoriaService.moverParaLixeiraCategoria(categoriaId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao mover categoria para lixeira: ${errorMessage}`, error);
      setError(ERROR_MESSAGES.ERRO_MOVER_CATEGORIA_LIXEIRA);
      throw new Error(ERROR_MESSAGES.ERRO_MOVER_CATEGORIA_LIXEIRA);
    }
  }, []);

  return { 
    categorias, 
    loading,
    error,
    adicionarCategoria, 
    restaurarCategoria,
    moverParaLixeira
  };
}
/**
 * usePratos.ts
 * 
 * Hook personalizado para gerenciar pratos do cardápio.
 * Fornece funções para listar, adicionar, editar e gerenciar pratos.
 */

import { useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { Prato } from '@/models/Prato';
import * as pratoService from '@/services/pratoService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';

/**
 * Interface de retorno do hook usePratos
 */
interface UsePratosRetorno {
  pratos: Prato[];
  loading: boolean;
  error: string | null;
  modalAberto: boolean;
  pratoEditando: Prato | null;
  abrirModal: (prato: Prato) => void;
  fecharModal: () => void;
  salvarEdicao: () => Promise<void>;
  removerPrato: (id: string) => Promise<void>;
  moverParaLixeira: (id: string) => Promise<void>;
  restaurarPrato: (id: string) => Promise<void>;
  adicionarPrato: (prato: Omit<Prato, 'id'>) => Promise<void>;
  setPratoEditando: React.Dispatch<React.SetStateAction<Prato | null>>;
  setModalAberto: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook para gerenciar pratos
 * @param user Usuário autenticado (opcional)
 * @param ativos Se true, retorna apenas pratos ativos; se false, retorna pratos na lixeira
 * @returns Objeto com pratos e funções para gerenciá-los
 */
export function usePratos(user: User | null, ativos: boolean = true): UsePratosRetorno {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [pratoEditando, setPratoEditando] = useState<Prato | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      unsubscribe = ativos
        ? pratoService.listenPratos(setPratos)
        : pratoService.listenPratosLixeira(setPratos);
        
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar pratos:', err);
      setError(ERROR_MESSAGES.ERRO_CARREGAR_PRATOS);
      setLoading(false);
    }
    
    return () => unsubscribe();
  }, [user, ativos]);

  /**
   * Abre o modal de edição de prato
   */
  const abrirModal = useCallback((prato: Prato): void => {
    setPratoEditando(prato);
    setModalAberto(true);
  }, []);

  /**
   * Fecha o modal de edição e limpa o prato em edição
   */
  const fecharModal = useCallback((): void => {
    setModalAberto(false);
    setPratoEditando(null);
  }, []);

  /**
   * Salva as alterações feitas no prato em edição
   */
  const salvarEdicao = useCallback(async (): Promise<void> => {
    if (!pratoEditando) return;
    
    try {
      setError(null);
      await pratoService.updatePrato(pratoEditando);
      fecharModal();
    } catch (err) {
      console.error('Erro ao salvar edição do prato:', err);
      setError(ERROR_MESSAGES.ERRO_EDITAR_PRATO);
      throw err;
    }
  }, [pratoEditando, fecharModal]);

  /**
   * Remove permanentemente um prato
   */
  const removerPrato = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await pratoService.removePrato(id);
    } catch (err) {
      console.error('Erro ao remover prato:', err);
      setError(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
      throw err;
    }
  }, []);

  /**
   * Move um prato para a lixeira (soft delete)
   */
  const moverParaLixeira = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await pratoService.moverParaLixeiraPrato(id);
    } catch (err) {
      console.error('Erro ao mover prato para lixeira:', err);
      setError(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
      throw err;
    }
  }, []);

  /**
   * Restaura um prato da lixeira
   */
  const restaurarPrato = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await pratoService.restaurarPrato(id);
    } catch (err) {
      console.error('Erro ao restaurar prato:', err);
      setError('Não foi possível restaurar o prato.');
      throw err;
    }
  }, []);

  /**
   * Adiciona um novo prato
   */
  const adicionarPrato = useCallback(async (prato: Omit<Prato, 'id'>): Promise<void> => {
    try {
      setError(null);
      await pratoService.addPrato(prato);
    } catch (err) {
      console.error('Erro ao adicionar prato:', err);
      setError(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
      throw err;
    }
  }, []);

  return {
    pratos,
    loading,
    error,
    modalAberto,
    pratoEditando,
    abrirModal,
    fecharModal,
    salvarEdicao,
    removerPrato,
    moverParaLixeira,
    restaurarPrato,
    adicionarPrato,
    setPratoEditando,
    setModalAberto,
  };
}
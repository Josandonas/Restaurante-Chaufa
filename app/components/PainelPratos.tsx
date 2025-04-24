/**
 * PainelPratos.tsx
 * 
 * Componente que exibe e gerencia a lista de pratos ativos do cardápio.
 * Permite adicionar, editar e mover pratos para a lixeira.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePratos } from '@/hooks/usePratos';
import { ListaDePratos } from './ListaDePratosPainel';
import { EditarPratoModal } from './EditarPratoModal';
import { NovoPratoModal } from './NovoPratoModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { UI_LABELS, ERROR_MESSAGES, SUCCESS_MESSAGES, LOADING_STATES } from '@/lib/constants';
import type { Prato } from '@/models/Prato';

/**
 * Componente para gerenciar pratos do cardápio
 */
export function PainelPratos() {
  // Verificação de autenticação
  const { user } = useAuthGuard();
  
  // Estados e funções do hook personalizado de pratos
  const {
    pratos,
    loading,
    error,
    modalAberto,
    pratoEditando,
    abrirModal,
    salvarEdicao,
    fecharModal,
    setPratoEditando,
    adicionarPrato,
    moverParaLixeira
  } = usePratos(user, true);

  // Estado local para controle do modal de novo prato
  const [modalNovoPrato, setModalNovoPrato] = useState(false);
  // Estado para mensagens de erro locais
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  // Estado para mensagens de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  /**
   * Manipula a criação de um novo prato
   */
  const handleNovoPrato = useCallback(async (novo: Omit<Prato, 'id'>) => {
    try {
      setErroLocal(null);
      setMensagemSucesso(null);
      await adicionarPrato(novo);
      setMensagemSucesso(SUCCESS_MESSAGES.PRATO_ADICIONADO);
      setModalNovoPrato(false);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error) {
      console.error('Erro ao adicionar prato:', error);
      setErroLocal(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
    }
  }, [adicionarPrato]);

  /**
   * Manipula a remoção de um prato (mover para lixeira)
   */
  const handleRemoverPrato = useCallback(async (id: string) => {
    try {
      setErroLocal(null);
      setMensagemSucesso(null);
      await moverParaLixeira(id);
      setMensagemSucesso(SUCCESS_MESSAGES.ITEM_REMOVIDO);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error) {
      console.error('Erro ao mover prato para lixeira:', error);
      setErroLocal(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
    }
  }, [moverParaLixeira]);

  return (
    <div className="space-y-4">
      {/* Cabeçalho com botão para adicionar novo prato */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">{UI_LABELS.PRATOS_DISPONIVEIS}</h2>
        <button
          onClick={() => setModalNovoPrato(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          disabled={loading}
          aria-label="Adicionar novo prato ao cardápio"
        >
          {UI_LABELS.NOVO_PRATO}
        </button>
      </div>
      
      {/* Mensagens de erro/sucesso */}
      {(error || erroLocal) && (
        <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200">
          {error || erroLocal}
        </div>
      )}
      
      {mensagemSucesso && (
        <div className="bg-green-50 text-green-600 p-3 rounded border border-green-200">
          {mensagemSucesso}
        </div>
      )}

      {/* Estado de carregamento */}
      {loading ? (
        <div className="py-8 text-center text-gray-500">
          {LOADING_STATES.CARREGANDO_PRATOS}
        </div>
      ) : (
        /* Lista de pratos */
        <ListaDePratos
          pratos={pratos}
          onEditar={abrirModal}
          onRemover={handleRemoverPrato}
        />
      )}

      {/* Modais */}
      {modalAberto && pratoEditando && (
        <EditarPratoModal
          prato={pratoEditando}
          onClose={fecharModal}
          onSave={salvarEdicao}
          setPratoEditando={setPratoEditando}
        />
      )}

      {modalNovoPrato && (
        <NovoPratoModal
          onClose={() => setModalNovoPrato(false)}
          onCreate={handleNovoPrato}
        />
      )}
    </div>
  );
}
/**
 * ListaDePratosPainel.tsx
 * 
 * Componente que renderiza a lista de pratos no painel administrativo.
 * Permite editar e mover pratos para a lixeira.
 */

'use client';

import { useState, useCallback } from 'react';
import { ConfirmacaoModal } from '@/components/ConfirmacaoModal';
import { UI_LABELS, ERROR_MESSAGES } from '@/lib/constants';

import type { Prato } from '@/models/Prato';

/**
 * Props para o componente ListaDePratos
 */
interface ListaDePratosProps {
  /** Lista de pratos a serem exibidos */
  pratos: Prato[];
  /** Função chamada quando um prato é editado */
  onEditar: (prato: Prato) => void;
  /** Função chamada quando um prato é removido */
  onRemover: (id: string) => void;
}

/**
 * Componente que lista pratos no painel administrativo
 */
export function ListaDePratos({ pratos, onEditar, onRemover }: ListaDePratosProps) {
  // Estado para o prato selecionado para exclusão
  const [pratoSelecionado, setPratoSelecionado] = useState<Prato | null>(null);

  /**
   * Confirma a exclusão do prato selecionado
   */
  const confirmarLixeira = useCallback(() => {
    if (pratoSelecionado) {
      onRemover(pratoSelecionado.id);
      setPratoSelecionado(null);
    }
  }, [pratoSelecionado, onRemover]);
  
  /**
   * Cancela a exclusão e fecha o modal
   */
  const cancelarLixeira = useCallback(() => {
    setPratoSelecionado(null);
  }, []);

  /**
   * Renderiza o estado vazio quando não há pratos cadastrados
   */
  const renderizarEstadoVazio = useCallback(() => {
    return (
      <div 
        className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100"
        role="status"
        aria-live="polite"
      >
        {UI_LABELS.SEM_PRATOS}
      </div>
    );
  }, []);
  
  // Se não houver pratos, mostra uma mensagem
  if (pratos.length === 0) {
    return renderizarEstadoVazio();
  }

  return (
    <div className="grid gap-4">
      {/* Lista de pratos ordenados por categoria */}
      {[...pratos]
        .sort((a, b) => a.categoria.localeCompare(b.categoria))
        .map(prato => (
          <div 
            key={prato.id} 
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div className="flex-1 mb-4 md:mb-0">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">{prato.nome}</h2>
              <p className="text-sm text-gray-500 italic mb-2">{prato.categoria}</p>
              <p className="text-gray-700 text-sm mb-2">{prato.descricao || UI_LABELS.SEM_DESCRICAO}</p>
              <p className="text-green-600 font-semibold">R$ {prato.preco.toFixed(2)}</p>
            </div>
            <div className="flex gap-2 md:flex-col md:items-end">
              <button
                onClick={() => onEditar(prato)}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow min-w-[96px]"
                aria-label={`Editar ${prato.nome}`}
              >
                {UI_LABELS.EDITAR_PRATO}
              </button>
              <button
                onClick={() => setPratoSelecionado(prato)}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md shadow min-w-[96px]"
                aria-label={`Mover ${prato.nome} para a lixeira`}
              >
                {UI_LABELS.EXCLUIR}
              </button>
            </div>
          </div>
        ))
      }

      {/* Modal de confirmação para exclusão */}
      {pratoSelecionado && (
        <ConfirmacaoModal
          titulo="Confirmar Exclusão"
          mensagem={
            <>
              Tem certeza que deseja mover o prato <b>{pratoSelecionado.nome}</b> para a lixeira?
              <p className="text-sm text-gray-500 mt-2">
                {UI_LABELS.MENSAGEM_ITEM_LIXEIRA}
              </p>
            </>
          }
          onConfirmar={confirmarLixeira}
          onCancelar={cancelarLixeira}
        />
      )}
    </div>
  );
}
/**
 * ConfirmacaoModal.tsx
 * 
 * Componente genérico para modais de confirmação.
 * Utilizado para confirmar ações como exclusão, restauração, etc.
 */

'use client';

import { ReactNode } from 'react';
import { UI_LABELS } from '@/lib/constants';

/**
 * Props para o componente ConfirmacaoModal
 */
interface ConfirmacaoModalProps {
  /** Título do modal */
  titulo: string;
  /** Mensagem ou conteúdo do modal (pode ser texto ou elementos JSX) */
  mensagem: ReactNode;
  /** Função chamada quando o usuário confirma a ação */
  onConfirmar: () => void;
  /** Função chamada quando o usuário cancela a ação */
  onCancelar: () => void;
  /** Texto opcional para o botão de confirmação */
  textoConfirmar?: string;
  /** Texto opcional para o botão de cancelamento */
  textoCancelar?: string;
}

/**
 * Componente para modais de confirmação de ações
 */
export function ConfirmacaoModal({ 
  titulo, 
  mensagem, 
  onConfirmar, 
  onCancelar,
  textoConfirmar = UI_LABELS.CONFIRMAR,
  textoCancelar = UI_LABELS.CANCELAR 
}: ConfirmacaoModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h2 id="modal-titulo" className="text-xl font-semibold mb-3">{titulo}</h2>
        <div className="text-sm text-gray-700 mb-4">{mensagem}</div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onCancelar} 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition duration-200"
            aria-label={`Cancelar ação: ${titulo}`}
          >
            {textoCancelar}
          </button>
          <button 
            onClick={onConfirmar} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition duration-200"
            aria-label={`Confirmar ação: ${titulo}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
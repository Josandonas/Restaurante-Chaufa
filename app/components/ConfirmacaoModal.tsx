'use client';
import { ReactNode } from 'react';

interface ConfirmacaoModalProps {
    titulo: string;
    mensagem: ReactNode;
    onConfirmar: () => void;
    onCancelar: () => void;
  }

export function ConfirmacaoModal({ titulo, mensagem, onConfirmar, onCancelar }: ConfirmacaoModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">{titulo}</h2>
        <p className="text-sm text-gray-700 mb-4">{mensagem}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancelar} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">
            Cancelar
          </button>
          <button onClick={onConfirmar} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
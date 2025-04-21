'use client';

import { useState } from 'react';
import { ConfirmacaoModal } from '@/components/ConfirmacaoModal';

import type { Prato } from '@/models/Prato';

interface ListaDePratosProps {
  pratos: Prato[];
  onEditar: (prato: Prato) => void;
  onRemover: (id: string) => void;
}

export function ListaDePratos({ pratos, onEditar, onRemover }: ListaDePratosProps) {
  const [pratoSelecionado, setPratoSelecionado] = useState<Prato | null>(null);

  const confirmarLixeira = () => {
    if (pratoSelecionado) {
      onRemover(pratoSelecionado.id);
      setPratoSelecionado(null);
    }
  };

  return (
    <div className="grid gap-4">
      {[...pratos].sort((a, b) => a.categoria.localeCompare(b.categoria)).map(prato => (
        <div key={prato.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex-1 mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{prato.nome}</h2>
            <p className="text-sm text-gray-500 italic mb-2">{prato.categoria}</p>
            <p className="text-gray-700 text-sm mb-2">{prato.descricao}</p>
            <p className="text-green-600 font-semibold">R$ {prato.preco.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 md:flex-col md:items-end">
            <button
              onClick={() => onEditar(prato)}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow min-w-[96px]"
            >
              Editar
            </button>
            <button
              onClick={() => setPratoSelecionado(prato)}
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md shadow min-w-[96px]"
            >
              Mover para lixeira
            </button>
          </div>
        </div>
      ))}

      {pratoSelecionado && (
        <ConfirmacaoModal
          titulo="Confirmar Exclusão"
          mensagem={
            <>
              Tem certeza que deseja mover o prato <b>{pratoSelecionado.nome}</b> para a lixeira?
            </>
          }
          onConfirmar ={confirmarLixeira}
          onCancelar={() => setPratoSelecionado(null)}
        />
      )}
    </div>
  );
}
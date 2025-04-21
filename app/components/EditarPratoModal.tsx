'use client';

import { useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { useCategorias } from '@/hooks/useCategorias';

import type { Prato } from '@/models/Prato';

interface EditarPratoModalProps {
  prato: Prato;
  onClose: () => void;
  onSave: () => void;
  setPratoEditando: Dispatch<SetStateAction<Prato | null>>;
}

export function EditarPratoModal({ prato, onClose, onSave, setPratoEditando }: EditarPratoModalProps) {
  const { categorias } = useCategorias(true);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-semibold">Editar Prato</h2>

        <input
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder="Nome"
          value={prato.nome}
          onChange={e => setPratoEditando({ ...prato, nome: e.target.value })}
        />

        <select
          className="w-full border border-gray-300 p-3 rounded-md"
          value={prato.categoria}
          onChange={e => setPratoEditando({ ...prato, categoria: e.target.value })}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.nome}>{cat.nome}</option>
          ))}
        </select>

        <textarea
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder="Descrição"
          value={prato.descricao}
          onChange={e => setPratoEditando({ ...prato, descricao: e.target.value })}
        />

        <input
          type="number"
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder="Preço"
          value={prato.preco}
          onChange={e => {
            const value = parseFloat(e.target.value);
            setPratoEditando({ ...prato, preco: isNaN(value) ? 0 : value });
          }}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-red-400 hover:bg-red-600 rounded-md text-sm">Cancelar</button>
          <button onClick={onSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">Salvar</button>
        </div>
      </div>
    </div>
  );
}

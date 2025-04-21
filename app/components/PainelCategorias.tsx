import { useState } from 'react';
import { ListaDeCategoriasPainel } from '@/components/ListaDeCategoriasPainel';
import { NovaCategoriaModal } from '@/components/NovaCategoriaModal';

export function PainelCategorias() {
  const [modalAberto, setModalAberto] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-700">Gerenciar Categorias</h2>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Nova Categoria
        </button>
      </div>
      <ListaDeCategoriasPainel />
      {modalAberto && (
        <NovaCategoriaModal onClose={() => setModalAberto(false)} />
      )}
    </div>
  );
}
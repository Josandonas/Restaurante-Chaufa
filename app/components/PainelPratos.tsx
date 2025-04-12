'use client';

import { useState } from 'react';
import { usePratos, type Prato } from '@/hooks/usePratos';
import { ListaDePratos } from './ListaDePratosPainel';
import { EditarPratoModal } from './EditarPratoModal';
import { NovoPratoModal } from './NovoPratoModal';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export function PainelPratos() {
  const { user } = useAuthGuard();
  const {
    pratos,
    modalAberto,
    pratoEditando,
    abrirModal,
    salvarEdicao,
    removerPrato,
    fecharModal,
    setPratoEditando,
    adicionarPrato
  } = usePratos(user);

  const [modalNovoPrato, setModalNovoPrato] = useState(false);

  const handleNovoPrato = async (novo: Omit<Prato, 'id'>) => {
    await adicionarPrato(novo);
    setModalNovoPrato(false);
  };

  const categoriasUnicas = Array.from(new Set(pratos.map(p => p.categoria)));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModalNovoPrato(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Novo Prato
        </button>
      </div>

      <ListaDePratos
        pratos={pratos}
        onEditar={abrirModal}
        onRemover={removerPrato}
      />

      {modalAberto && pratoEditando && (
        <EditarPratoModal
          prato={pratoEditando}
          onClose={fecharModal}
          onSave={salvarEdicao}
          setPratoEditando={setPratoEditando}
          categorias={categoriasUnicas}
        />
      )}

      {modalNovoPrato && (
        <NovoPratoModal
          onClose={() => setModalNovoPrato(false)}
          onCreate={handleNovoPrato}
          categorias={categoriasUnicas}
        />
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { usePratos, type Prato } from '@/hooks/usePratos';
import { EditarPratoModal } from '@/components/EditarPratoModal';
import { ListaDePratos } from '@/components/ListaDePratosPainel';
import { NovoPratoModal } from '@/components/NovoPratoModal';

export default function AdminPainelPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard();
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  const handleNovoPrato = async (novo: Omit<Prato, 'id'>) => {
    await adicionarPrato(novo);
    setModalNovoPrato(false);
  };

  const categoriasUnicas = Array.from(new Set(pratos.map(p => p.categoria)));

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setModalNovoPrato(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Novo Prato
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Sair
          </button>
        </div>
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
    </main>
  );
}
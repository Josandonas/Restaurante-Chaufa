'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { PainelPratos } from '@/components/PainelPratos';
import { PainelCategorias } from '@/components/PainelCategorias';

export default function AdminPainelPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard();
  const [abaAtiva, setAbaAtiva] = useState<'pratos' | 'categorias'>('pratos');

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 space-y-6">
      {/* Navbar superior */}
      <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
          <p className="text-sm text-gray-500">Usuário logado: <span className="font-semibold text-gray-700">{user?.email}</span></p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Navegação secundária */}
      <div className="flex gap-4">
        <button
          onClick={() => setAbaAtiva('pratos')}
          className={`px-4 py-2 rounded shadow ${abaAtiva === 'pratos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border'}`}
        >
          Pratos
        </button>
        <button
          onClick={() => setAbaAtiva('categorias')}
          className={`px-4 py-2 rounded shadow ${abaAtiva === 'categorias' ? 'bg-purple-600 text-white' : 'bg-white text-gray-800 border'}`}
        >
          Categorias
        </button>
      </div>

      {/* Conteúdo condicional */}
      {abaAtiva === 'pratos' && <PainelPratos />}
      {abaAtiva === 'categorias' && <PainelCategorias />}
    </main>
  );
}

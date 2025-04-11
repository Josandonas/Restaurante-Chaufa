'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const initialForm = { email: '', senha: '' };

export default function AdminPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) router.push('/admin/painel');
    });
    return unsubscribe;
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErro('E-mail ou senha incorretos.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Acesso Administrativo</h1>

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />

        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
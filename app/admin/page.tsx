/**
 * admin/page.tsx
 * 
 * Página de login administrativo do restaurante.
 * Permite autenticação de usuários administrativos com redirecionamento para o painel.
 */

'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { UI_LABELS, ERROR_MESSAGES, LOADING_STATES, PLACEHOLDERS } from '@/lib/constants';

/** Valores iniciais do formulário de login */
const initialForm = { email: '', senha: '' };

export default function AdminPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já está autenticado e redireciona para o painel
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) router.push('/admin/painel');
    });
    
    // Cleanup ao desmontar o componente
    return unsubscribe;
  }, [router]);

  /**
   * Manipula mudanças nos campos do formulário
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Manipula o envio do formulário de login
   */
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      // O redirecionamento é feito pelo listener onAuthStateChanged
    } catch (error: unknown) {
      console.error('Erro ao fazer login:', error);
      
      // Tipagem correta para erros do Firebase
      if (error instanceof FirebaseError) {
        // Mensagens de erro personalizadas com base no código de erro do Firebase
        switch (error.code) {
          case 'auth/invalid-email':
            setErro('Email inválido. Verifique o formato do email informado.');
            break;
          case 'auth/user-not-found':
            setErro('Usuário não encontrado. Verifique suas credenciais.');
            break;
          case 'auth/wrong-password':
            setErro('Senha incorreta. Tente novamente.');
            break;
          case 'auth/too-many-requests':
            setErro('Muitas tentativas de login. Tente novamente mais tarde.');
            break;
          default:
            setErro(ERROR_MESSAGES.ERRO_AUTENTICACAO);
        }
      } else if (error instanceof Error) {
        setErro(`Erro ao fazer login: ${error.message}`);
      } else {
        setErro(ERROR_MESSAGES.ERRO_AUTENTICACAO);
      }
    } finally {
      setCarregando(false);
    }
  }, [form.email, form.senha]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100 p-4">
      <div className="max-w-md w-full">
        {/* Logo e cabeçalho */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full bg-orange-500 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Restaurante Chaufa</h1>
          <p className="text-gray-600 mt-2">Autentique-se para acessar o painel administrativo</p>
        </div>
        
        {/* Formulário de login */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-xl shadow-lg p-8 w-full"
          aria-labelledby="login-titulo"
        >
          <h2 id="login-titulo" className="text-2xl font-bold mb-6 text-gray-800">Acesso Administrativo</h2>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Seu e-mail de administrador"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              required
              aria-label="Endereço de e-mail"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="senha" className="block text-gray-700 text-sm font-medium mb-2">Senha</label>
            <input
              id="senha"
              type="password"
              name="senha"
              placeholder="Sua senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              required
              aria-label="Senha"
            />
          </div>

          {erro && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-medium transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            aria-busy={carregando}
          >
            {carregando ? LOADING_STATES.AUTENTICANDO : UI_LABELS.LOGIN}
          </button>
          
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Visualizar Cardápio
            </Link>
          </div>
        </form>
      </div>
      
      <footer className="mt-8 text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Restaurante Chaufa - Todos os direitos reservados
      </footer>
    </main>
  );
}
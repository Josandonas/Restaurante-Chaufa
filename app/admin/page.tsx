/**
 * admin/page.tsx
 * 
 * Página de login administrativo do restaurante.
 * Permite autenticação de usuários administrativos com redirecionamento para o painel.
 */

'use client';

import { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { UI_LABELS, ERROR_MESSAGES, LOADING_STATES, PLACEHOLDERS } from '@/lib/constants';

// Constantes para segurança
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutos em milissegundos

/** Valores iniciais do formulário de login */
const initialForm = { email: '', senha: '' };

// Armazenar tentativas de login (em uma aplicação real, isso seria tratado no back-end)
const loginAttempts: Record<string, {count: number, lastAttempt: number}> = {};

export default function AdminPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [contadorTentativas, setContadorTentativas] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Verifica se o usuário já está autenticado e redireciona para o painel
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) router.push('/admin/painel');
    });
    
    // Cleanup ao desmontar o componente
    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [router]);

  /**
   * Manipula mudanças nos campos do formulário
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  /**
   * Atualiza o contador regressivo de bloqueio
   */
  const iniciarContagemRegressiva = useCallback((tempoTotal: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTempoRestante(tempoTotal / 1000);
    
    timerRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /**
   * Formata o tempo restante em minutos e segundos
   */
  const formatarTempoRestante = useCallback(() => {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = Math.floor(tempoRestante % 60);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  }, [tempoRestante]);

  /**
   * Alterna entre mostrar e ocultar a senha
   */
  const toggleMostrarSenha = useCallback(() => {
    setMostrarSenha(prev => !prev);
  }, []);

  /**
   * Verifica se o IP está bloqueado (simulação - em produção seria pelo backend)
   */
  const verificarBloqueio = useCallback((email: string) => {
    const agora = Date.now();
    const tentativas = loginAttempts[email];
    
    if (tentativas && tentativas.count >= MAX_LOGIN_ATTEMPTS) {
      const tempoDecorrido = agora - tentativas.lastAttempt;
      
      if (tempoDecorrido < LOCKOUT_TIME) {
        const tempoRestante = LOCKOUT_TIME - tempoDecorrido;
        iniciarContagemRegressiva(tempoRestante);
        return true;
      } else {
        // Reset após o período de bloqueio
        loginAttempts[email] = { count: 0, lastAttempt: agora };
      }
    }
    return false;
  }, [iniciarContagemRegressiva]);

  /**
   * Registra uma tentativa de login falha
   */
  const registrarTentativaFalha = useCallback((email: string) => {
    const agora = Date.now();
    
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 1, lastAttempt: agora };
    } else {
      loginAttempts[email].count += 1;
      loginAttempts[email].lastAttempt = agora;
    }
    
    setContadorTentativas(loginAttempts[email].count);
    
    // Verifica se deve bloquear
    if (loginAttempts[email].count >= MAX_LOGIN_ATTEMPTS) {
      iniciarContagemRegressiva(LOCKOUT_TIME);
    }
  }, [iniciarContagemRegressiva]);

  /**
   * Manipula o envio do formulário de login
   */
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    
    // Validações de segurança
    if (!form.email.trim() || !form.senha.trim()) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }
    
    // Verifica bloqueio por tentativas excessivas
    if (verificarBloqueio(form.email)) {
      setErro(`Conta temporariamente bloqueada. Tente novamente em ${formatarTempoRestante()}.`);
      return;
    }
    
    setCarregando(true);
    
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      // O redirecionamento é feito pelo listener onAuthStateChanged
      
      // Reseta contagem de tentativas após login bem-sucedido
      if (loginAttempts[form.email]) {
        loginAttempts[form.email].count = 0;
      }
    } catch (error: unknown) {
      console.error('Erro ao fazer login:', error);
      
      // Registra tentativa falha
      registrarTentativaFalha(form.email);
      
      // Mensagens de erro genéricas para maior segurança
      setErro('Credenciais inválidas. Por favor, verifique seu email e senha.');
      
      // Em desenvolvimento, podemos mostrar mensagens mais específicas para debug
      if (process.env.NODE_ENV === 'development' && error instanceof FirebaseError) {
        console.log('Código de erro Firebase:', error.code);
      }
    } finally {
      setCarregando(false);
    }
  }, [form.email, form.senha, verificarBloqueio, formatarTempoRestante, registrarTentativaFalha]);

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
            <div className="relative">
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Sua senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                required
                aria-label="Senha"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={toggleMostrarSenha}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
          </div>

          {erro && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{erro}</p>
            </div>
          )}
          
          {/* Aviso de tentativas restantes */}
          {contadorTentativas > 0 && contadorTentativas < MAX_LOGIN_ATTEMPTS && (
            <div className="p-3 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Atenção: {MAX_LOGIN_ATTEMPTS - contadorTentativas} tentativa(s) restante(s) antes do bloqueio temporário.
              </p>
            </div>
          )}
          
          {/* Contador regressivo quando bloqueado */}
          {tempoRestante > 0 && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                Conta temporariamente bloqueada. Tente novamente em {formatarTempoRestante()}.
              </p>
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
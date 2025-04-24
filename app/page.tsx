/**
 * page.tsx
 * 
 * Página principal do aplicativo Cardápio Digital.
 * Permite visualização do cardápio, adição de pratos e download em PDF.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  getDoc,
  DocumentData,
  FirestoreError
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Componentes
import { CardapioPDF } from '@/components/CardapioPDF';
import { PratoItem } from '@/components/PratoItem';
import { FormularioPrato, PratoFormValues } from '@/components/FormularioPrato';

// Modelos, constantes e serviços
import type { Prato } from '@/models/Prato';
import { COLLECTIONS, UI_LABELS, ERROR_MESSAGES, SUCCESS_MESSAGES, LOADING_STATES, PREFIXES, DOCUMENT_FIELDS } from '@/lib/constants';

/**
 * Formato da versão do cardápio
 */
interface Versao {
  numero: string;
  ultimaAtualizacao: string;
}

/**
 * Formata um número para sempre ter dois dígitos (adiciona zero à esquerda se necessário)
 */
function formatarNumero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Componente da página principal do aplicativo
 */
export default function Home() {
  // Estado do usuário autenticado
  const [user, setUser] = useState<User | null>(null);
  // Lista de pratos do cardápio
  const [pratos, setPratos] = useState<Prato[]>([]);
  // Informações de versão do cardápio
  const [versao, setVersao] = useState<Versao>({ numero: '', ultimaAtualizacao: '' });
  // Estados de loading
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingVersao, setLoadingVersao] = useState<boolean>(true);
  // Estados de feedback
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  // Estado de autenticação
  const [loadingAuth, setLoadingAuth] = useState<boolean>(false);
  const [erroAuth, setErroAuth] = useState<string | null>(null);
  
  /**
   * Busca dados do cardápio e configurações ao carregar a página
   */
  useEffect(() => {
    // Listener para mudanças no estado de autenticação
    const unsubAuth = onAuthStateChanged(auth, setUser);

    // Listener para mudanças na coleção de pratos
    const unsubPratos = onSnapshot(
      collection(db, COLLECTIONS.CARDAPIO),
      (snapshot) => {
        const pratosData = snapshot.docs
          .filter(doc => doc.data().ativo) // Filtrar apenas pratos ativos
          .map(doc => ({ id: doc.id, ...doc.data() } as Prato));
        setPratos(pratosData);
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error(`Erro ao carregar pratos: ${error.code}`, error);
        setErro(ERROR_MESSAGES.ERRO_CARREGAR_PRATOS);
        setLoading(false);
      }
    );

    // Buscar informações da versão atual
    const fetchVersao = async () => {
      try {
        setLoadingVersao(true);
        const docSnap = await getDoc(doc(db, COLLECTIONS.CONFIGURACOES, DOCUMENT_FIELDS.VERSAO));
        if (docSnap.exists()) {
          setVersao(docSnap.data() as Versao);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`Erro ao obter versão: ${errorMessage}`, error);
      } finally {
        setLoadingVersao(false);
      }
    };
    
    fetchVersao();

    // Cleanup function
    return () => {
      unsubAuth();
      unsubPratos();
    };
  }, []);

  /**
   * Realiza o login do usuário administrativo
   * Observação: Em uma implementação real, seria necessário um formulário de login
   */
  const login = useCallback(async () => {
    try {
      setErroAuth(null);
      setLoadingAuth(true);
      
      // TODO: Isto é apenas para demonstração. Em produção, seria necessário
      // um formulário de login real com credenciais válidas
      await signInWithEmailAndPassword(auth, 'admin@example.com', 'password');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro de autenticação: ${errorMessage}`, error);
      setErroAuth(ERROR_MESSAGES.ERRO_AUTENTICACAO);
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  /**
   * Realiza o logout do usuário
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao fazer logout: ${errorMessage}`, error);
    }
  }, []);

  /**
   * Atualiza a versão do cardápio
   */
  const atualizarVersao = useCallback(async () => {
    try {
      setErro(null);
      setSucesso(null);
      setLoadingVersao(true);
      
      // Gerar número de versão com formato padronizado
      const now = new Date();
      const ano = now.getFullYear();
      const mes = formatarNumero(now.getMonth() + 1);
      const dia = formatarNumero(now.getDate());
      const hora = formatarNumero(now.getHours());
      const minuto = formatarNumero(now.getMinutes());
      const segundo = formatarNumero(now.getSeconds());
      
      const numero = `v${ano}.${mes}.${dia}-${hora}${minuto}${segundo}`;
      const novaVersao: Versao = {
        numero,
        ultimaAtualizacao: now.toISOString()
      };
      
      // Salvar nova versão no Firestore
      await setDoc(doc(db, COLLECTIONS.CONFIGURACOES, DOCUMENT_FIELDS.VERSAO), novaVersao);
      setVersao(novaVersao);
      setSucesso(SUCCESS_MESSAGES.CARDAPIO_ATUALIZADO);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao atualizar versão: ${errorMessage}`, error);
      setErro(ERROR_MESSAGES.ERRO_ATUALIZAR_VERSAO);
    } finally {
      setLoadingVersao(false);
    }
  }, []);

  /**
   * Manipula a submissão do formulário de novo prato
   */
  const handleSubmitPrato = useCallback(async (valores: PratoFormValues) => {
    try {
      setErro(null);
      setSucesso(null);
      
      // Importar o serviço sob demanda
      const { addPrato } = await import('@/services/pratoService');
      
      // Verificar se a categoria tem o prefixo de nova categoria
      let categoria = valores.categoria;
      if (categoria.startsWith(PREFIXES.NOVA_CATEGORIA)) {
        const { addCategoria } = await import('@/services/categoriaService');
        const novaCategoriaNome = categoria.substring(5).trim();
        
        // Adicionar nova categoria
        await addCategoria({
          nome: novaCategoriaNome,
          criado_em: new Date(),
          ativo: true
        });
        
        categoria = novaCategoriaNome;
      }
      
      // Criar o novo prato
      await addPrato({
        nome: valores.nome,
        preco: typeof valores.preco === 'string' ? parseFloat(valores.preco) : valores.preco,
        categoria: categoria,
        descricao: valores.descricao,
        ativo: true
      });
      
      // Atualizar a versão do cardápio
      await atualizarVersao();
      setSucesso(SUCCESS_MESSAGES.PRATO_ADICIONADO);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao adicionar prato: ${errorMessage}`, error);
      setErro(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
    }
  }, [atualizarVersao]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{UI_LABELS.CARDAPIO}</h1>

      {/* Mensagens de feedback */}
      {erro && (
        <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 mb-4">
          {erro}
        </div>
      )}
      
      {sucesso && (
        <div className="bg-green-50 text-green-600 p-3 rounded border border-green-200 mb-4">
          {sucesso}
        </div>
      )}
      
      {/* Seção de login/logout */}
      {!user ? (
        <div className="mb-8">
          <button 
            onClick={login} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loadingAuth}
            aria-busy={loadingAuth}
            aria-label="Fazer login como administrador"
          >
            {loadingAuth ? LOADING_STATES.AUTENTICANDO : UI_LABELS.LOGIN}
          </button>
          {erroAuth && <p className="text-red-500 text-sm mt-2">{erroAuth}</p>}
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">{UI_LABELS.ADMIN_STATUS}</span>
            </div>
            <button 
              onClick={logout} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              aria-label="Fazer logout do sistema"
            >
              {UI_LABELS.LOGOUT}
            </button>
          </div>

          {/* Formulário para adicionar novo prato */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">{UI_LABELS.NOVO_PRATO}</h2>
            <FormularioPrato 
              categorias={Array.from(new Set(pratos.map(p => p.categoria)))}
              onSubmit={handleSubmitPrato}
              textoBotao={UI_LABELS.ADICIONAR}
              permiteNovaCategoria={true}
              onError={setErro}
            />
          </div>

          {/* Botão para baixar o cardápio em PDF */}
          <div className="mb-8">
            <PDFDownloadLink
              document={<CardapioPDF pratos={pratos} versao={versao} />}
              fileName={`cardapio-${versao.numero || 'atual'}.pdf`}
            >
              {({ loading: loadingPDF, error: errorPDF }) => (
                <>
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-300"
                    disabled={loadingPDF}
                    aria-busy={loadingPDF}
                    aria-label="Baixar cardápio em formato PDF"
                  >
                    {loadingPDF ? LOADING_STATES.GERANDO_PDF : UI_LABELS.BAIXAR_PDF}
                  </button>
                  
                  {/* Mostrar mensagem de erro quando necessário */}
                  {errorPDF && (
                    <p className="text-red-500 text-sm mt-2">
                      {ERROR_MESSAGES.ERRO_GERAR_PDF}
                    </p>
                  )}
                </>
              )}
            </PDFDownloadLink>
            <p className="text-xs text-gray-500 mt-2">
              {UI_LABELS.PDF_INFO}
            </p>
          </div>

          {/* Lista de pratos do cardápio */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{UI_LABELS.PRATOS_DISPONIVEIS}</h2>
            
            {loading ? (
              <div className="text-center py-4">
                <p>{LOADING_STATES.CARREGANDO_PRATOS}</p>
              </div>
            ) : pratos.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">{UI_LABELS.SEM_PRATOS}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pratos.map(prato => (
                  <PratoItem key={prato.id} prato={prato} />
                ))}
              </div>
            )}

            {/* Informações de versão */}
            <div className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
              {loadingVersao ? (
                <span>{LOADING_STATES.CARREGANDO_VERSAO}</span>
              ) : (
                versao.numero ? (
                  <>
                    {UI_LABELS.VERSAO_INFO.replace('{0}', versao.numero)} | Atualizado em: {new Date(versao.ultimaAtualizacao).toLocaleDateString()} às {new Date(versao.ultimaAtualizacao).toLocaleTimeString()}
                  </>
                ) : (
                  <span>{UI_LABELS.VERSAO_INDISPONIVEL}</span>
                )
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

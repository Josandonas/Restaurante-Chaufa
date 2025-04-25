/**
 * page.tsx
 * 
 * Página principal do aplicativo Cardápio Digital.
 * Permite visualização do cardápio, adição de pratos e download em PDF.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
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

// Componentes
import { CardapioMenu } from '@/app/components/CardapioMenu';
import { CardapioVisual } from '@/app/components/CardapioVisual';
import { CardapioDigital } from '@/app/components/CardapioDigital';
import { PDFDownloader } from '@/app/components/PDFDownloader';
import { PratoItem } from '@/components/PratoItem';
import { FormularioPrato, PratoFormValues } from '@/components/FormularioPrato';

// Serviços
import { obterTaxaCambioFormatada } from '@/services/prato/pratoService';

// Modelos, constantes e serviços
import type { Prato } from '@/models/Prato';
import { COLLECTIONS, UI_LABELS, ERROR_MESSAGES, SUCCESS_MESSAGES, LOADING_STATES, PREFIXES, DOCUMENT_FIELDS } from '@/lib/constants';

/**
 * Formato da versão do cardápio
 */
export interface Versao {
  numero: string;
  ultimaAtualizacao: string;
}

/**
 * Formata um número para sempre ter dois dígitos (adiciona zero à esquerda se necessário)
 */
function formatarNumero(num: number): string {
  return num < 10 ? `0${num}` : num.toString();
}

/**
 * Componente da página principal do aplicativo
 */
export default function Home() {
  // Estado para armazenar os pratos carregados
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estado para armazenar mensagens de erro e sucesso
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  
  // Estado para o usuário logado
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregandoUsuario, setCarregandoUsuario] = useState<boolean>(true);
  
  // Estado para o modo de visualização do cardápio
  const [modoVisualizacao, setModoVisualizacao] = useState<'digital' | 'lista' | 'menu' | 'visual'>('digital');
  
  // Estado para a versão do cardápio
  const [versao, setVersao] = useState<Versao>({ numero: '', ultimaAtualizacao: '' });
  const [loadingVersao, setLoadingVersao] = useState<boolean>(true);
  
  // Carrega os pratos do Firestore
  useEffect(() => {
    setLoading(true);
    
    // Inscrever-se para atualizações em tempo real
    const unsubscribe = onSnapshot(
      collection(db, COLLECTIONS.CARDAPIO),
      (snapshot) => {
        const pratosCarregados: Prato[] = [];
        snapshot.forEach((doc) => {
          const dados = doc.data() as Prato;
          pratosCarregados.push({
            ...dados,
            id: doc.id
          });
        });
        
        // Atualizar estado com os pratos ativos
        setPratos(pratosCarregados.filter(prato => prato.ativo));
        setLoading(false);
      },
      (error: FirestoreError) => {
        console.error('Erro ao carregar pratos:', error);
        setErro(ERROR_MESSAGES.ERRO_CARREGAR_PRATOS);
        setLoading(false);
      }
    );
    
    // Limpar inscrição quando o componente for desmontado
    return () => unsubscribe();
  }, []);
  
  // Carrega a versão atual do cardápio
  useEffect(() => {
    setLoadingVersao(true);
    
    async function carregarVersao() {
      try {
        const docRef = doc(db, COLLECTIONS.CONFIGURACOES, DOCUMENT_FIELDS.VERSAO);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setVersao(docSnap.data() as Versao);
        }
      } catch (error) {
        console.error('Erro ao carregar versão:', error);
      } finally {
        setLoadingVersao(false);
      }
    }
    
    carregarVersao();
  }, []);
  
  // Monitora o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregandoUsuario(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  /**
   * Atualiza a versão do cardápio
   */
  const atualizarVersao = useCallback(async () => {
    try {
      setLoadingVersao(true);
      setErro(null);
      setSucesso(null);
      
      // Gerar novo número de versão com base na data atual
      const now = new Date();
      const ano = now.getFullYear().toString().substring(2); // Últimos 2 dígitos do ano
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
          ativo: true,
          criado_em: new Date()
        });
        
        categoria = novaCategoriaNome;
      }
      
      // Adicionar prato
      await addPrato({
        nome: valores.nome,
        preco: typeof valores.preco === 'string' ? parseFloat(valores.preco) : valores.preco,
        descricao: valores.descricao,
        categoria,
        ativo: true
      });
      
      // Atualizar versão do cardápio
      await atualizarVersao();
      
      setSucesso(SUCCESS_MESSAGES.PRATO_ADICIONADO);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao adicionar prato: ${errorMessage}`, error);
      setErro(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
    }
  }, [atualizarVersao]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Restaurante Chaufa</h1>
        <p className="text-center text-gray-600">{obterTaxaCambioFormatada()}</p>
      </div>
      
      {/* Controles principais */}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        {/* Navegação entre modos de visualização */}
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => setModoVisualizacao('digital')}
            className={`px-4 py-2 rounded-md text-center transition-colors ${modoVisualizacao === 'digital' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Cardápio Digital
          </button>
          <button 
            onClick={() => setModoVisualizacao('menu')}
            className={`px-4 py-2 rounded-md text-center transition-colors ${modoVisualizacao === 'menu' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Cardápio Menu
          </button>
          <button 
            onClick={() => setModoVisualizacao('visual')}
            className={`px-4 py-2 rounded-md text-center transition-colors ${modoVisualizacao === 'visual' ? 'bg-amber-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Cardápio Visual
          </button>
        </div>
        
        {/* Opções de PDF */}
        <div className="flex items-center gap-2">
          <select 
            className="px-2 py-1 border border-gray-300 rounded text-sm" 
            defaultValue="pt" 
            id="idiomaPDF"
          >
            <option value="pt">Traduzir para Português</option>
            <option value="es">Manter em Español</option>
          </select>
          <select 
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            defaultValue="brl"
            id="moedaPDF"
          >
            <option value="brl">Preços em Reais (R$)</option>
            <option value="bob">Preços em Bolivianos (Bs)</option>
          </select>
          <PDFDownloader pratos={pratos} versao={versao} />
        </div>
      </div>
      
      {/* Mensagens de erro e sucesso */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {erro}
        </div>
      )}
      
      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {sucesso}
        </div>
      )}
      
      {/* Componentes de visualização do cardápio */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{LOADING_STATES.CARREGANDO_PRATOS}</p>
          </div>
        ) : pratos.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">{UI_LABELS.SEM_PRATOS}</p>
          </div>
        ) : (
          <>
            {/* Exibe o tipo de cardápio selecionado */}
            {modoVisualizacao === 'digital' && (
              <CardapioDigital 
                pratos={pratos} 
                versao={versao} 
                loading={loading}
              />
            )}
            
            {modoVisualizacao === 'menu' && (
              <CardapioMenu 
                pratos={pratos} 
                loading={loading}
              />
            )}
            
            {modoVisualizacao === 'visual' && (
              <CardapioVisual 
                pratos={pratos} 
                loading={loading}
              />
            )}
          </>
        )}
      </div>
      
      {/* Informações de versão */}
      <div className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100 text-center">
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
    </main>
  );
}

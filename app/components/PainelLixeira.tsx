/**
 * PainelLixeira.tsx
 * 
 * Componente que exibe e gerencia itens na lixeira (pratos e categorias).
 * Permite restaurar itens ou esvaziar a lixeira permanentemente.
 */

/**
 * PainelLixeira.tsx
 * 
 * Componente que exibe e gerencia itens na lixeira (pratos e categorias).
 * Permite restaurar itens ou esvaziar a lixeira permanentemente.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePratos } from '@/hooks/usePratos';
import { useCategorias } from '@/hooks/useCategorias';
import * as pratoService from '@/services/pratoService';
import * as categoriaService from '@/services/categoriaService';
import type { Prato } from '@/models/Prato';
import type { Categoria } from '@/models/Categoria';
import { UI_LABELS, SUCCESS_MESSAGES, ERROR_MESSAGES, LOADING_STATES } from '@/lib/constants';
import { Timestamp } from 'firebase/firestore';

/**
 * Formata um timestamp do Firebase para uma data legível
 * @param timestamp Timestamp do Firebase ou objeto com propriedade seconds
 * @returns String com a data formatada
 */
const formatarData = (timestamp: Timestamp | any): string => {
  try {
    // Verifica se é um Timestamp do Firebase
    if (timestamp instanceof Timestamp) {
      return new Date(timestamp.toMillis()).toLocaleDateString();
    }
    
    // Verifica se é um objeto com a propriedade seconds
    if (timestamp && typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000).toLocaleDateString();
    }
    
    // Tenta converter diretamente para Date se for outro tipo
    return new Date(timestamp).toLocaleDateString();
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data indisponível';
  }
};

export function PainelLixeira() {
  // Usa custom hooks para buscar dados da lixeira
  const { pratos, loading: loadingPratos, error: pratosError } = usePratos(null, false);
  const { categorias, loading: loadingCategorias, error: categoriasError, restaurarCategoria } = useCategorias(false);
  
  // Estado local para controlar a operação de esvaziamento
  const [esvaziando, setEsvaziando] = useState(false);
  // Estado para erros
  const [erro, setErro] = useState<string | null>(null);
  // Estado de mensagem de sucesso
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  /**
   * Esvazia permanentemente a lixeira
   */
  const esvaziarLixeira = useCallback(async () => {
    if (!confirm('Tem certeza que deseja esvaziar permanentemente a lixeira? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setErro(null);
      setMensagemSucesso(null);
      setEsvaziando(true);
      
      await Promise.all([
        pratoService.esvaziarLixeiraPratos(),
        categoriaService.esvaziarLixeiraCategorias(),
      ]);
      
      setMensagemSucesso('Lixeira esvaziada com sucesso.');
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error) {
      console.error('Erro ao esvaziar lixeira:', error);
      setErro('Ocorreu um erro ao esvaziar a lixeira. Tente novamente.');
    } finally {
      setEsvaziando(false);
    }
  }, []);

  /**
   * Restaura um prato da lixeira
   */
  const handleRestaurarPrato = useCallback(async (id: string) => {
    try {
      setErro(null);
      setMensagemSucesso(null);
      await pratoService.restaurarPrato(id);
      setMensagemSucesso(SUCCESS_MESSAGES.ITEM_RESTAURADO);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error) {
      console.error(`Erro ao restaurar prato ${id}:`, error);
      setErro('Ocorreu um erro ao restaurar o prato. Tente novamente.');
    }
  }, []);
  
  /**
   * Restaura uma categoria da lixeira
   */
  const handleRestaurarCategoria = useCallback(async (id: string) => {
    try {
      setErro(null);
      setMensagemSucesso(null);
      await restaurarCategoria(id);
      setMensagemSucesso(SUCCESS_MESSAGES.ITEM_RESTAURADO);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error) {
      console.error(`Erro ao restaurar categoria ${id}:`, error);
      setErro(ERROR_MESSAGES.ERRO_RESTAURAR_CATEGORIA);
    }
  }, [restaurarCategoria]);
  
  const loading = loadingPratos || loadingCategorias;
  const error = pratosError || categoriasError || erro;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Lixeira</h2>
        <button
          onClick={esvaziarLixeira}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow disabled:opacity-60"
          disabled={esvaziando || loading || pratos.length === 0 && categorias.length === 0}
        >
          {esvaziando ? "Esvaziando..." : "Esvaziar Lixeira Permanentemente"}
        </button>
      </div>
      
      {/* Mensagens de erro/sucesso */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200">
          {error}
        </div>
      )}
      
      {mensagemSucesso && (
        <div className="bg-green-50 text-green-600 p-3 rounded border border-green-200">
          {mensagemSucesso}
        </div>
      )}
      
      {loading ? (
        <div className="py-8 text-center text-gray-500">
          {LOADING_STATES.CARREGANDO_PRATOS}
        </div>
      ) : (
        <>
          {/* Pratos na lixeira */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Pratos na Lixeira</h3>
            {pratos.length === 0 ? (
              <p className="text-gray-500 bg-gray-50 p-3 rounded-md text-center">Nenhum prato na lixeira.</p>
            ) : (
              <ul className="space-y-2">
                {[...pratos]
                  .sort((a, b) => a.categoria.localeCompare(b.categoria))
                  .map(prato => (
                    <li key={prato.id} className="bg-yellow-50 rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div>
                        <span className="font-semibold block">{prato.nome}</span>
                        <span className="text-sm text-gray-600">
                          {prato.categoria} — R$ {typeof prato.preco === 'number' ? prato.preco.toFixed(2) : '0,00'}
                        </span>
                      </div>
                      <button
                        className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        onClick={() => handleRestaurarPrato(prato.id)}
                      >
                        {UI_LABELS.RESTAURAR}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
          
          {/* Categorias na lixeira */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Categorias na Lixeira</h3>
            {categorias.length === 0 ? (
              <p className="text-gray-500 bg-gray-50 p-3 rounded-md text-center">Nenhuma categoria na lixeira.</p>
            ) : (
              <ul className="space-y-2">
                {categorias.map(cat => (
                  <li key={cat.id} className="bg-yellow-50 rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <span className="font-semibold">{cat.nome}</span>
                      {/* Informação adicional opcional */}
                      {cat.criado_em && (
                        <span className="text-xs text-gray-500 block">
                          Criada em: {formatarData(cat.criado_em)}
                        </span>
                      )}
                    </div>
                    <button
                      className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      onClick={() => handleRestaurarCategoria(cat.id)}
                    >
                      {UI_LABELS.RESTAURAR}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

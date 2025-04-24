/**
 * ListaDeCategoriasPainel.tsx
 * 
 * Componente para exibir a lista de categorias no painel administrativo.
 * Permite mover categorias para a lixeira.
 */

'use client';

import { useState, useCallback } from 'react';
import { useCategorias } from '@/hooks/useCategorias';
import { UI_LABELS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants';
import type { Categoria } from '@/models/Categoria';

/**
 * Componente para exibir a lista de categorias no painel administrativo
 */
export function ListaDeCategoriasPainel() {
  // Obtém categorias do hook personalizado
  const { categorias, moverParaLixeira } = useCategorias(true);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  /**
   * Formata a data de criação da categoria
   */
  const formatarData = useCallback((data: any): string => {
    if (!data) return 'Data desconhecida';
    
    try {
      if (data.toDate) {
        const dataObj = data.toDate();
        return `${dataObj.toLocaleDateString('pt-BR')} ${dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      if (data instanceof Date) {
        return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      return 'Data desconhecida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data desconhecida';
    }
  }, []);
  
  /**
   * Move uma categoria para a lixeira
   */
  const handleMoverParaLixeira = useCallback(async (categoria: Categoria) => {
    try {
      setMensagemErro(null);
      setMensagemSucesso(null);
      
      await moverParaLixeira(categoria.id);
      setMensagemSucesso(SUCCESS_MESSAGES.ITEM_REMOVIDO);
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(null), 3000);
    } catch (error) {
      console.error('Erro ao mover categoria para lixeira:', error);
      setMensagemErro(ERROR_MESSAGES.ERRO_MOVER_CATEGORIA_LIXEIRA);
    }
  }, [moverParaLixeira]);

  return (
    <div className="space-y-3">
      {/* Mensagens de feedback */}
      {mensagemErro && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md mb-4">
          {mensagemErro}
        </div>
      )}
      
      {mensagemSucesso && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-md mb-4">
          {mensagemSucesso}
        </div>
      )}
      
      {/* Lista de categorias */}
      {categorias.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
          Nenhuma categoria encontrada
        </div>
      ) : (
        categorias.map(categoria => (
          <div key={categoria.id} className="bg-white rounded-md p-4 shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition duration-200">
            <div>
              <h3 className="font-semibold text-gray-800">{categoria.nome}</h3>
              <p className="text-sm text-gray-500">
                Criada em: {formatarData(categoria.criado_em)}
              </p>
            </div>
            <button
              onClick={() => handleMoverParaLixeira(categoria)}
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-700 rounded-md shadow transition duration-200"
              aria-label={`Mover categoria ${categoria.nome} para lixeira`}
            >
              {UI_LABELS.EXCLUIR}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

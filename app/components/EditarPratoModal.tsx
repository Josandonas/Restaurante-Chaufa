/**
 * EditarPratoModal.tsx
 * 
 * Componente de modal para edição de pratos existentes.
 * Utiliza o FormularioPrato como componente reutilizável.
 */

'use client';

import { useState, useCallback } from 'react';
import { Dispatch, SetStateAction } from 'react';
import { useCategorias } from '@/hooks/useCategorias';
import { FormularioPrato, PratoFormValues } from './FormularioPrato';
import { UI_LABELS, LOADING_STATES, ERROR_MESSAGES } from '@/lib/constants';

import type { Prato } from '@/models/Prato';

interface EditarPratoModalProps {
  prato: Prato;
  onClose: () => void;
  onSave: () => void;
  setPratoEditando: Dispatch<SetStateAction<Prato | null>>;
}

/**
 * Modal para edição de pratos existentes
 */
export function EditarPratoModal({ prato, onClose, onSave, setPratoEditando }: EditarPratoModalProps) {
  // Obtém lista de categorias ativas
  const { categorias, loading } = useCategorias(true);
  // Estado para mensagens de erro
  const [erro, setErro] = useState<string | null>(null);
  
  // Lista de nomes de categorias para o formulário
  const categoriasNomes = categorias.map(cat => cat.nome);
  
  /**
   * Manipula a submissão do formulário
   */
  const handleSubmit = useCallback(async (valores: PratoFormValues) => {
    try {
      // Atualiza o prato em edição com os novos valores
      setPratoEditando({
        ...prato,
        nome: valores.nome,
        categoria: valores.categoria,
        descricao: valores.descricao,
        preco: typeof valores.preco === 'string' ? parseFloat(valores.preco) : valores.preco
      });
      
      // Chama a função de salvamento
      await onSave();
    } catch (error) {
      console.error(`Erro ao editar prato:`, error);
      setErro(ERROR_MESSAGES.ERRO_EDITAR_PRATO);
    }
  }, [prato, setPratoEditando, onSave]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-titulo" className="text-2xl font-semibold">{UI_LABELS.EDITAR_PRATO}</h2>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
        </div>
        
        {loading ? (
          <div className="py-4 text-center text-gray-500">{LOADING_STATES.CARREGANDO_CATEGORIAS}</div>
        ) : (
          <FormularioPrato
            pratoInicial={prato}
            categorias={categoriasNomes}
            onSubmit={handleSubmit}
            onError={setErro}
            textoBotao={UI_LABELS.SALVAR}
          />
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
            aria-label="Cancelar edição e fechar modal"
          >
            {UI_LABELS.CANCELAR}
          </button>
        </div>
      </div>
    </div>
  );
}

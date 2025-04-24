/**
 * NovaCategoriaModal.tsx
 * 
 * Componente de modal para criação de novas categorias.
 * Permite adicionar uma categoria após validação para evitar duplicação.
 */

'use client';

import { useState, useCallback } from 'react';
import { useCategorias } from '@/hooks/useCategorias';
import { UI_LABELS, ERROR_MESSAGES, FORM_LABELS, PLACEHOLDERS } from '@/lib/constants';

/**
 * Props para o componente NovaCategoriaModal
 */
interface NovaCategoriaModalProps {
  /** Função chamada ao fechar o modal */
  onClose: () => void;
  /** Função opcional chamada quando uma categoria é criada com sucesso */
  onSuccess?: () => void;
}

/**
 * Modal para criação de novas categorias
 */
export function NovaCategoriaModal({ onClose, onSuccess }: NovaCategoriaModalProps) {
  // Estados do formulário
  const [nome, setNome] = useState<string>('');
  const [erro, setErro] = useState<string>('');
  const [salvando, setSalvando] = useState<boolean>(false);
  
  // Obtém dados e funções do hook de categorias
  const { categorias, adicionarCategoria } = useCategorias(true);

  /**
   * Normaliza uma string para comparação (remove espaços e converte para minúsculas)
   */
  const normalizar = useCallback((str: string): string => {
    return str.trim().toLocaleLowerCase();
  }, []);

  /**
   * Valida e salva a nova categoria
   */
  const salvar = useCallback(async (): Promise<void> => {
    // Limpa erro anterior
    setErro('');
    
    // Validação do campo nome
    if (!nome.trim()) {
      setErro(ERROR_MESSAGES.CAMPOS_OBRIGATORIOS);
      return;
    }
    
    // Verificação de duplicidade
    const existe = categorias.some(cat => 
      normalizar(cat.nome) === normalizar(nome)
    );
    
    if (existe) {
      setErro(ERROR_MESSAGES.CATEGORIA_DUPLICADA);
      return;
    }
    
    // Salva a nova categoria
    setSalvando(true);
    try {
      await adicionarCategoria(nome.trim());
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(`Erro ao cadastrar categoria: ${error instanceof Error ? error.message : 'erro desconhecido'}`, error);
      setErro(ERROR_MESSAGES.ERRO_ADICIONAR_CATEGORIA);
    } finally {
      setSalvando(false);
    }
  }, [nome, categorias, normalizar, adicionarCategoria, onSuccess, onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 id="modal-title" className="text-xl font-semibold mb-4">{UI_LABELS.NOVA_CATEGORIA}</h2>
        
        <div className="mb-4">
          <label htmlFor="categoria-nome" className="block text-sm font-medium text-gray-700 mb-1">
            {FORM_LABELS.NOVA_CATEGORIA}
          </label>
          <input
            id="categoria-nome"
            className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder={PLACEHOLDERS.NOVA_CATEGORIA}
            value={nome}
            onChange={e => setNome(e.target.value)}
            disabled={salvando}
            required
            autoFocus
          />
        </div>
        
        {erro && (
          <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 border border-red-100 rounded">
            {erro}
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition duration-200"
            disabled={salvando}
            aria-label="Cancelar criação de categoria"
          >
            {UI_LABELS.CANCELAR}
          </button>
          <button 
            onClick={salvar} 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition duration-200 disabled:bg-green-300"
            disabled={salvando}
            aria-label="Salvar nova categoria"
          >
            {salvando ? UI_LABELS.SALVANDO : UI_LABELS.SALVAR}
          </button>
        </div>
      </div>
    </div>
  );
}

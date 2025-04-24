/**
 * NovoPratoModal.tsx
 * 
 * Componente de modal para criação de novos pratos.
 * Utiliza o FormularioPrato como componente reutilizável.
 */

'use client';

import { useState, useCallback } from 'react';
import type { Prato } from '@/models/Prato';
import { useCategorias } from '@/hooks/useCategorias';
import { FormularioPrato, PratoFormValues } from './FormularioPrato';
import * as categoriaService from '@/services/categoriaService';
import * as pratoService from '@/services/pratoService';
import { UI_LABELS, ERROR_MESSAGES, LOADING_STATES } from '@/lib/constants';

interface NovoPratoModalProps {
  onClose: () => void;
  onCreate?: (novo: Omit<Prato, 'id'>) => void;
}

/**
 * Modal para criação de novos pratos
 */
export function NovoPratoModal({ onClose, onCreate }: NovoPratoModalProps) {
  // Obtém lista de categorias ativas
  const { categorias, loading, error: categoriasError } = useCategorias(true);
  // Estado para mensagens de erro
  const [erro, setErro] = useState<string | null>(null);
  // Lista de nomes de categorias para o formulário
  const categoriasNomes = categorias.map(cat => cat.nome);
  
  /**
   * Normaliza string para comparação
   */
  const normalizar = useCallback((str: string) => str.trim().toLocaleLowerCase(), []);
  
  /**
   * Verifica se uma categoria já existe (independente de capitalização/acentuação)
   */
  const categoriaExiste = useCallback((nome: string): boolean => {
    return categoriasNomes.some(cat => normalizar(cat) === normalizar(nome));
  }, [categoriasNomes, normalizar]);
  
  /**
   * Manipula a submissão do formulário
   */
  const handleSubmit = useCallback(async (valores: PratoFormValues) => {
    try {
      // Verifica se está usando nova categoria
      if (valores.categoria.startsWith('nova:')) {
        const novaCategoriaNome = valores.categoria.substring(5).trim();
        
        // Verifica duplicidade
        if (categoriaExiste(novaCategoriaNome)) {
          setErro(ERROR_MESSAGES.CATEGORIA_DUPLICADA);
          return;
        }
        
        // Cria nova categoria
        await categoriaService.addCategoria({ 
          nome: novaCategoriaNome, 
          criado_em: new Date(), 
          ativo: true 
        });
        
        // Atualiza categoria do prato para usar o nome correto
        valores.categoria = novaCategoriaNome;
      }
      
      // Cria o novo prato
      const novoPrato: Omit<Prato, 'id'> = {
        nome: valores.nome,
        categoria: valores.categoria,
        descricao: valores.descricao,
        preco: typeof valores.preco === 'string' ? parseFloat(valores.preco) : valores.preco,
        ativo: true,
      };
      
      // Salva o prato
      await pratoService.addPrato(novoPrato);
      
      // Notifica o componente pai se callback fornecido
      if (onCreate) {
        onCreate(novoPrato);
      }
      
      // Fecha o modal
      onClose();
    } catch (error) {
      console.error('Erro ao criar novo prato:', error);
      setErro(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
    }
  }, [categoriaExiste, onClose, onCreate]);
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-titulo" className="text-2xl font-semibold">{UI_LABELS.NOVO_PRATO}</h2>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
        </div>
        
        {loading ? (
          <div className="py-4 text-center text-gray-500">{LOADING_STATES.CARREGANDO_CATEGORIAS}</div>
        ) : categoriasError ? (
          <div className="py-4 text-center text-red-500">{categoriasError}</div>
        ) : (
          <FormularioPrato
            categorias={categoriasNomes}
            onSubmit={handleSubmit}
            onError={setErro}
            textoBotao={UI_LABELS.SALVAR}
            permiteNovaCategoria={true}
          />
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
            aria-label="Cancelar e fechar modal"
          >
            {UI_LABELS.CANCELAR}
          </button>
        </div>
      </div>
    </div>
  );
}

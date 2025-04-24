/**
 * PainelCategorias.tsx
 * 
 * Componente para gerenciamento de categorias no painel administrativo.
 * Permite listar, adicionar, editar e excluir categorias.
 */

'use client';

import { useState } from 'react';
import { ListaDeCategoriasPainel } from '@/components/ListaDeCategoriasPainel';
import { NovaCategoriaModal } from '@/components/NovaCategoriaModal';
import { UI_LABELS } from '@/lib/constants';

/**
 * Componente principal para gerenciamento de categorias
 */
export function PainelCategorias() {
  // Estado para controlar a abertura/fechamento do modal de nova categoria
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  
  /**
   * Abre o modal de criação de categoria
   */
  const abrirModal = () => setModalAberto(true);
  
  /**
   * Fecha o modal de criação de categoria
   */
  const fecharModal = () => setModalAberto(false);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-700">Gerenciar Categorias</h2>
        <button
          onClick={abrirModal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition duration-200"
          aria-label="Adicionar nova categoria"
        >
          {UI_LABELS.NOVA_CATEGORIA}
        </button>
      </div>
      
      {/* Lista de categorias existentes */}
      <ListaDeCategoriasPainel />
      
      {/* Modal para adicionar nova categoria (renderizado condicionalmente) */}
      {modalAberto && (
        <NovaCategoriaModal onClose={fecharModal} />
      )}
    </div>
  );
}
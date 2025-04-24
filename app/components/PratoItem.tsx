/**
 * PratoItem.tsx
 * 
 * Componente que exibe um prato individual no cardápio.
 * Utilizado para exibir informações básicas como nome, categoria, descrição e preço.
 */

import { useCallback } from 'react';
import type { Prato } from '@/models/Prato';
import { UI_LABELS } from '@/lib/constants';

/**
 * Props para o componente PratoItem
 */
interface PratoItemProps {
  /** Dados do prato a ser exibido */
  prato: Prato;
}

/**
 * Componente que exibe um único prato no cardápio
 */
export function PratoItem({ prato }: PratoItemProps) {
  return (
    <div 
      className="border rounded-lg p-4 shadow-md bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
      role="article"
      aria-labelledby={`prato-${prato.id}-titulo`}
    >
      <div className="flex-1">
        <h2 id={`prato-${prato.id}-titulo`} className="text-lg font-bold text-gray-800">{prato.nome}</h2>
        <p className="text-gray-600 text-sm italic">{prato.categoria}</p>
        <p className="text-gray-700 text-sm">{prato.descricao || UI_LABELS.SEM_DESCRICAO}</p>
      </div>
      <div className="text-right sm:text-left">
        <p className="text-xl font-semibold text-green-700">R$ {prato.preco.toFixed(2)}</p>
      </div>
    </div>
  );
}
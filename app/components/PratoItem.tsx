/**
 * PratoItem.tsx
 * 
 * Componente que exibe um prato individual no cardápio.
 * Utilizado para exibir informações básicas como nome, categoria, descrição e preço.
 * Suporta exibição em múltiplos idiomas e moedas.
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
  /** Idioma selecionado (pt ou es) */
  idioma?: 'pt' | 'es';
  /** Layout estilo menu visual */
  estiloMenu?: boolean;
}

/**
 * Formatar preço para exibição
 */
function formatarPreco(valor: number, moeda: string): string {
  return `${moeda} ${valor.toFixed(2)}`;
}

/**
 * Componente que exibe um único prato no cardápio
 */
export function PratoItem({ prato, idioma = 'pt', estiloMenu = false }: PratoItemProps) {
  // Usar os campos diretos do modelo simplificado
  const nome = prato.nome;
  const categoria = prato.categoria;
  const descricao = prato.descricao || UI_LABELS.SEM_DESCRICAO;
  
  // Para preços, usamos o valor em BOB do modelo e calculamos BRL com taxa fixa
  // Em uma versão mais completa, esta taxa poderia vir de um serviço
  const precoBOB = prato.preco;
  const precoBRL = prato.preco / 3.5; // Convertendo de BOB para BRL

  // Se o estilo de menu visual está ativado, usamos o layout inspirado na imagem de referência
  if (estiloMenu) {
    return (
      <div 
        className="relative mb-4 bg-black/5 rounded-lg p-3 shadow-sm"
        role="article"
        aria-labelledby={`prato-${prato.id}-titulo`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 id={`prato-${prato.id}-titulo`} className="text-lg font-bold text-gray-800">{nome}</h3>
            <p className="text-sm text-gray-600 mb-1">{descricao}</p>
          </div>
          
          <div className="flex flex-col items-end ml-3">
            <div className="bg-amber-100 px-2 py-1 rounded-md text-right whitespace-nowrap">
              <p className="font-bold text-amber-900">R$ {precoBRL.toFixed(2)}</p>
              <p className="text-xs text-amber-800">Bs {precoBOB.toFixed(2)}</p>
            </div>
          </div>
        </div>

      </div>
    );
  }
  
  // Layout padrão para outros casos
  return (
    <div 
      className="border rounded-lg p-4 shadow-md bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
      role="article"
      aria-labelledby={`prato-${prato.id}-titulo`}
    >
      <div className="flex-1">
        <h2 id={`prato-${prato.id}-titulo`} className="text-lg font-bold text-gray-800">{nome}</h2>
        <p className="text-gray-600 text-sm italic">{categoria}</p>
        <p className="text-gray-700 text-sm">{descricao}</p>
      </div>
      <div className="text-right sm:text-left">
        <p className="text-lg font-semibold text-green-700">{formatarPreco(precoBRL, 'R$')}</p>
        <p className="text-sm text-green-600">{formatarPreco(precoBOB, 'Bs')}</p>
      </div>
    </div>
  );
}
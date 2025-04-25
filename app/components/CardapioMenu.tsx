/**
 * CardapioMenu.tsx
 * 
 * Componente que implementa o layout de cardápio estilo menu visual,
 * com suporte a múltiplos idiomas e moedas.
 */

import { useState } from 'react';
import Image from 'next/image';
import type { Prato } from '@/models/Prato';
import { PratoItem } from './PratoItem';
import { UI_LABELS } from '@/lib/constants';

// Textos em diferentes idiomas
const textos: {
  titulo: { pt: string; es: string };
  subtitulo: { pt: string; es: string };
  categorias: Record<string, { pt: string; es: string }>;
  semPratos: { pt: string; es: string };
  trocarIdioma: { pt: string; es: string };
} = {
  titulo: {
    pt: "Cardápio",
    es: "Menú"
  },
  subtitulo: {
    pt: "Pratos peruanos tradicionais",
    es: "Platos peruanos tradicionales"
  },
  categorias: {
    entrada: { pt: "Entradas", es: "Entradas" },
    principal: { pt: "Pratos Principais", es: "Platos Principales" },
    sobremesa: { pt: "Sobremesas", es: "Postres" },
    bebida: { pt: "Bebidas", es: "Bebidas" }
  },
  semPratos: {
    pt: "Nenhum prato disponível nesta categoria",
    es: "No hay platos disponibles en esta categoría"
  },
  trocarIdioma: {
    pt: "Ver em Español",
    es: "Ver em Português"
  }
};

interface CardapioMenuProps {
  pratos: Prato[];
  loading: boolean;
}

/**
 * Agrupa pratos por categoria
 */
function agruparPorCategoria(pratos: Prato[]): Record<string, Prato[]> {
  const grupos: Record<string, Prato[]> = {};
  
  pratos.forEach(prato => {
    // A categoria é uma string simples em espanhol
    const categoria = prato.categoria;
    
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(prato);
  });
  
  return grupos;
}

export function CardapioMenu({ pratos, loading }: CardapioMenuProps) {
  const [idioma, setIdioma] = useState<'pt' | 'es'>('pt');
  
  const alternarIdioma = () => {
    setIdioma(prev => prev === 'pt' ? 'es' : 'pt');
  };
  
  // Agora agruparPorCategoria não precisa mais do parâmetro idioma
  const pratosPorCategoria = agruparPorCategoria(pratos);
  const categorias = Object.keys(pratosPorCategoria);
  
  return (
    <div className="relative">
      {/* Cabeçalho do cardápio */}
      <div className="bg-amber-900 text-white p-6 rounded-t-lg shadow-md text-center">
        <div className="flex justify-center items-center mb-2">
          <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
            <span className="text-amber-900 text-2xl font-bold">RC</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">{textos.titulo[idioma]}</h1>
        </div>
        <p className="text-amber-200 italic">{textos.subtitulo[idioma]}</p>
        
        <button 
          onClick={alternarIdioma}
          className="absolute top-4 right-4 bg-amber-700 hover:bg-amber-800 text-white text-xs px-2 py-1 rounded-full transition-colors"
        >
          {textos.trocarIdioma[idioma]}
        </button>
      </div>
      
      {/* Corpo do cardápio */}
      <div className="bg-amber-50 rounded-b-lg overflow-hidden pt-2 pb-6 px-4 sm:px-6 shadow-md">
        {loading ? (
          <div className="py-8 text-center text-amber-800">
            <p>{idioma === 'pt' ? 'Carregando cardápio...' : 'Cargando menú...'}</p>
          </div>
        ) : (
          <>
            {categorias.length === 0 ? (
              <div className="py-8 text-center text-amber-800">
                <p>{textos.semPratos[idioma]}</p>
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {categorias.map(categoria => {
                  // Usar o mapeamento local de categorias para exibir o nome no idioma certo
                  // Isso não depende mais da estrutura do modelo Prato
                  const categoriaNome = textos.categorias[categoria.toLowerCase()]?.[idioma] || categoria;
                  
                  return (
                    <div key={categoria} className="mb-6">
                      <h2 className="text-xl font-bold text-amber-900 border-b-2 border-amber-200 pb-1 mb-3">
                        {categoriaNome}
                      </h2>
                      
                      <div className="space-y-1">
                        {pratosPorCategoria[categoria].map(prato => (
                          <PratoItem 
                            key={prato.id} 
                            prato={prato} 
                            idioma={idioma}
                            estiloMenu={true}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        
        {/* Rodapé do cardápio */}
        <div className="mt-8 pt-4 border-t border-amber-200 text-center text-amber-800 text-sm">
          <p>{idioma === 'pt' ? 'Preços em Reais (R$) e Bolivianos (Bs)' : 'Precios en Reales (R$) y Bolivianos (Bs)'}</p>
          <p className="mt-1">© {new Date().getFullYear()} Restaurante Chaufa</p>
        </div>
      </div>
    </div>
  );
}

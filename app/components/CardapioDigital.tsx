'use client';

/**
 * CardapioDigital.tsx
 * 
 * Componente que implementa o layout de cardápio digital similar ao PDF,
 * com suporte a múltiplos idiomas e moedas.
 */

import { useState, useEffect } from 'react';
import type { Prato } from '@/models/Prato';
import type { Versao } from '@/app/page';
import { processarPratos, obterTaxaCambioFormatada } from '@/services/prato/pratoService';

// Textos em diferentes idiomas
const textos = {
  titulo: {
    pt: "MENU - Restaurante Chaufa",
    es: "MENÚ - Restaurante Chaufa"
  },
  subtitulo: {
    pt: "Pratos peruanos tradicionais",
    es: "Platos peruanos tradicionales"
  },
  rodape: {
    pt: "Endereço: Calle Venezuela 750 - Entre Aniceto y Av. La Jota",
    es: "Dirección: Calle Venezuela 750 - Entre Aniceto y Av. La Jota"
  },
  versao: {
    pt: "Versão",
    es: "Versión"
  },
  taxaCambio: {
    pt: "Taxa de câmbio:",
    es: "Tasa de cambio:"
  },
  semPratos: {
    pt: "Nenhum prato disponível nesta categoria",
    es: "No hay platos disponibles en esta categoría"
  },
  semDescricao: {
    pt: "(sem descrição)",
    es: "(sin descripción)"
  }
};

// Símbolos de moeda
const simbolosMoeda = {
  brl: "R$",
  bob: "Bs"
};

interface CardapioDigitalProps {
  pratos: Prato[];
  versao: Versao;
  loading?: boolean;
}

/**
 * Agrupa pratos por categoria
 */
function agruparPorCategoria(pratos: Prato[]): Record<string, Prato[]> {
  const grupos: Record<string, Prato[]> = {};
  
  pratos.forEach(prato => {
    const categoria = prato.categoria;
    
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(prato);
  });
  
  return grupos;
}

export function CardapioDigital({ pratos, versao, loading = false }: CardapioDigitalProps) {
  const [idioma, setIdioma] = useState<'pt' | 'es'>('pt');
  const [moeda, setMoeda] = useState<'brl' | 'bob'>('brl');
  const [pratosProcessados, setPratosProcessados] = useState<Prato[]>([]);
  const [taxaCambio, setTaxaCambio] = useState<string>('');
  const [processando, setProcessando] = useState<boolean>(true);
  
  // Processar pratos quando os dados originais forem carregados ou o idioma mudar
  useEffect(() => {
    async function processarDados() {
      if (loading) return;
      
      setProcessando(true);
      try {
        // Processar pratos com tradução e conversão de moeda conforme necessário
        const pratosAtualizados = await processarPratos(pratos, {
          traduzir: idioma === 'pt',  // Traduzir se o idioma for português
          converterMoeda: true         // Sempre converter para ter ambas as moedas
        });
        
        setPratosProcessados(pratosAtualizados);
        
        // Obter e formatar a taxa de câmbio
        const taxaFormatada = obterTaxaCambioFormatada();
        setTaxaCambio(taxaFormatada);
      } catch (error) {
        console.error('Erro ao processar pratos:', error);
      } finally {
        setProcessando(false);
      }
    }
    
    processarDados();
  }, [pratos, loading, idioma]);
  
  const pratosPorCategoria = agruparPorCategoria(pratosProcessados);
  const categorias = Object.keys(pratosPorCategoria);
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Cabeçalho do cardápio */}
      <div className="bg-amber-800 text-white p-8 text-center relative">
        <h1 className="text-3xl font-bold mb-2">{textos.titulo[idioma]}</h1>
        <p className="text-lg italic">{textos.subtitulo[idioma]}</p>
        
        <div className="mt-2 text-sm text-amber-200">
          <p>{textos.versao[idioma]}: {versao.numero}</p>
          <p>{textos.taxaCambio[idioma]} {taxaCambio}</p>
        </div>
        
        {/* Controles para idioma e moeda */}
        <div className="mt-4 flex justify-center gap-4">
          <select 
            className="bg-amber-700 text-white px-3 py-1 rounded text-sm"
            value={idioma}
            onChange={(e) => setIdioma(e.target.value as 'pt' | 'es')}
          >
            <option value="pt">Português</option>
            <option value="es">Español</option>
          </select>
          
          <select 
            className="bg-amber-700 text-white px-3 py-1 rounded text-sm"
            value={moeda}
            onChange={(e) => setMoeda(e.target.value as 'brl' | 'bob')}
          >
            <option value="brl">Preços em Reais (R$)</option>
            <option value="bob">Preços em Bolivianos (Bs)</option>
          </select>
        </div>
      </div>
      
      {/* Conteúdo do cardápio */}
      <div className="p-6">
        {loading || processando ? (
          <div className="py-8 text-center text-gray-600">
            <p>Carregando cardápio...</p>
          </div>
        ) : (
          <>
            {categorias.length === 0 ? (
              <div className="py-8 text-center text-gray-600">
                <p>{textos.semPratos[idioma]}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {categorias.map(categoria => (
                  <div key={categoria}>
                    <h2 className="text-xl font-bold text-amber-800 border-b-2 border-amber-300 pb-1 mb-4">
                      • {categoria}
                    </h2>
                    
                    <div className="space-y-3">
                      {pratosPorCategoria[categoria].map(prato => {
                        // Obter nome e descrição
                        const nome = prato.nome;                          
                        const descricao = prato.descricao || textos.semDescricao[idioma];
                        
                        // Obter preço na moeda selecionada
                        const precoExibido = moeda === 'brl' ? 
                          `${simbolosMoeda.brl} ${(prato.preco / 3.5).toFixed(2)}` : 
                          `${simbolosMoeda.bob} ${prato.preco.toFixed(2)}`;
                        
                        return (
                          <div key={prato.id} className="flex items-baseline mb-2">
                            <div className="flex-1">
                              <div className="flex items-baseline">
                                <span className="font-medium text-gray-800">{nome}</span>
                                <span className="border-b border-dotted border-gray-300 flex-grow mx-2"></span>
                                <span className="font-bold text-amber-700">{precoExibido}</span>
                              </div>
                              {descricao && (
                                <p className="text-gray-600 text-sm mt-1">{descricao}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>{textos.rodape[idioma]}</p>
          <p className="mt-1">© {new Date().getFullYear()} Restaurante Chaufa</p>
        </div>
      </div>
    </div>
  );
}

/**
 * CardapioVisual.tsx
 * 
 * Componente que implementa o layout de cardápio visual estilo menu de restaurante,
 * com fundo escuro, imagens dos pratos e suporte a múltiplos idiomas e moedas.
 * Utiliza API de tradução para converter textos do espanhol para português
 * e serviço de taxa de câmbio que é atualizado via WhatsApp.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Prato } from '@/models/Prato';
import { processarPratos, obterTaxaCambioFormatada } from '@/services/prato/pratoService';

// Interfaces para os textos do componente
interface TextosMenuSimples {
  [key: string]: {
    pt: string;
    es: string;
  };
}

// Textos fixos do componente em diferentes idiomas
const textos = {
  titulo: {
    pt: "Menú",
    es: "Menú"
  },
  subtitulo: {
    pt: "Pratos peruanos tradicionais",
    es: "Platos peruanos tradicionales"
  },
  semPratos: {
    pt: "Nenhum prato disponível nesta categoria",
    es: "No hay platos disponibles en esta categoría"
  },
  carregando: {
    pt: "Carregando cardápio...",
    es: "Cargando menú..."
  },
  trocarIdioma: {
    pt: "Ver en Español",
    es: "Ver em Português"
  },
  trocarMoeda: {
    pt: {
      bob: "Ver preços em Bolivianos (Bs)",
      brl: "Ver preços em Reais (R$)"
    },
    es: {
      bob: "Ver precios en Bolivianos (Bs)",
      brl: "Ver precios en Reales (R$)"
    }
  },
  taxaCambio: {
    pt: "Taxa de câmbio: ",
    es: "Tasa de cambio: "
  },
  rodape: {
    pt: {
      pedidos: "Pedidos e Reservas:",
      endereco: "Endereço:",
      entre: "Entre Aniceto y Av. La Jota"
    },
    es: {
      pedidos: "Pedidos y Reservas:",
      endereco: "Dirección:",
      entre: "Entre Aniceto y Av. La Jota"
    }
  }
};

interface CardapioVisualProps {
  pratos: Prato[];
  loading: boolean;
}

/**
 * Agrupa pratos por categoria
 */
function agruparPorCategoria(pratos: Prato[]): Record<string, Prato[]> {
  const grupos: Record<string, Prato[]> = {};
  
  pratos.forEach(prato => {
    // Usa a categoria processada se estiver disponível, ou a original
    const categoria = prato.categoria;
    
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    grupos[categoria].push(prato);
  });
  
  return grupos;
}

/**
 * Item individual do cardápio com layout visual
 */
function PratoVisualItem({ 
  prato, 
  idioma, 
  moeda 
}: { 
  prato: Prato; 
  idioma: 'pt' | 'es'; 
  moeda: 'brl' | 'bob' 
}) {
  // Obter texto no idioma selecionado usando os campos processados quando disponíveis
  const nome = prato.nome;
  const descricao = prato.descricao;
  
  // Obter preço na moeda selecionada
  const precoExibido = moeda === 'brl' ? 
    `R$ ${prato.preco.toFixed(2)}` : 
    `Bs ${prato.preco.toFixed(2)}`;
  
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium text-white text-md">{nome}</span>
          <span className="border-b border-dotted border-gray-400 flex-grow mx-2"></span>
          <span className="text-yellow-400 font-bold">{precoExibido}</span>
        </div>
        {descricao && <p className="text-gray-300 text-xs mt-1">{descricao}</p>}
      </div>
    </div>
  );
}

/**
 * Componente principal do cardápio visual
 */
export function CardapioVisual({ pratos, loading }: CardapioVisualProps) {
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
  
  const alternarIdioma = () => {
    setIdioma(prev => prev === 'pt' ? 'es' : 'pt');
  };
  
  const alternarMoeda = () => {
    setMoeda(prev => prev === 'brl' ? 'bob' : 'brl');
  };
  
  const pratosPorCategoria = agruparPorCategoria(pratosProcessados);
  const categorias = Object.keys(pratosPorCategoria);
  
  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Fundo escuro para todo o cardápio */}
      <div className="bg-[#2A2322] text-white rounded-lg shadow-xl overflow-hidden">
        {/* Cabeçalho do cardápio com logotipo */}
        <div className="bg-yellow-600 p-4 relative">
          <div className="absolute top-0 left-0 w-20 h-20 bg-yellow-600 transform -rotate-45 translate-x-[-40%] translate-y-[-40%] z-0"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-shrink-0">
              <div className="bg-yellow-500 text-black p-2 rounded-lg shadow-md inline-block">
                <span className="uppercase font-bold text-sm">Restaurante</span>
                <br />
                <span className="uppercase font-extrabold text-lg">Chaufa</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center flex-grow">{textos.titulo[idioma]}</h1>
            {/* Botões de troca de idioma e moeda */}
            <div className="flex-shrink-0 space-y-2">
              <button 
                onClick={alternarIdioma}
                className="block w-full bg-amber-700 hover:bg-amber-800 text-white text-xs px-3 py-1 rounded transition-colors"
                disabled={loading || processando}
              >
                {textos.trocarIdioma[idioma]}
              </button>
              <button 
                onClick={alternarMoeda}
                className="block w-full bg-amber-700 hover:bg-amber-800 text-white text-xs px-3 py-1 rounded transition-colors"
                disabled={loading || processando}
              >
                {textos.trocarMoeda[idioma][moeda === 'brl' ? 'bob' : 'brl']}
              </button>
            </div>
          </div>
          <p className="text-center text-amber-100 italic mt-2 relative z-10">{textos.subtitulo[idioma]}</p>
          <p className="text-center text-amber-100 text-xs mt-2 relative z-10">{textos.taxaCambio[idioma]} {taxaCambio}</p>
        </div>
        
        {/* Conteúdo principal do cardápio */}
        <div className="p-6 bg-[#2A2322] relative">
          {/* Imagem de fundo decorativa */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/images/food-pattern.png)', backgroundSize: '400px', backgroundRepeat: 'space' }}></div>
          {loading || processando ? (
            <div className="py-8 text-center text-amber-200">
              <p>{textos.carregando[idioma]}</p>
            </div>
          ) : (
            <>
              {categorias.length === 0 ? (
                <div className="py-8 text-center text-amber-200">
                  <p>{textos.semPratos[idioma]}</p>
                </div>
              ) : (
                <div className="space-y-8 relative">
                  {/* Imagens de pratos destacados */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="relative rounded-lg overflow-hidden h-32 shadow-lg">
                      <Image src="/images/prato-frango.jpeg" alt="Prato de frango" fill style={{objectFit: 'cover'}} />
                    </div>
                    <div className="relative rounded-lg overflow-hidden h-32 shadow-lg">
                      <Image src="/images/prato-batata.png" alt="Prato de batata" fill style={{objectFit: 'cover'}} />
                    </div>
                    <div className="relative rounded-lg overflow-hidden h-32 shadow-lg">
                      <Image src="/images/prato-carne.png" alt="Prato de carne" fill style={{objectFit: 'cover'}} />
                    </div>
                  </div>
                  
                  {/* Pratos agrupados por categoria */}
                  {categorias.map(categoria => {
                    return (
                      <div key={categoria} className="mb-8 relative z-10">
                        <h2 className="text-xl font-bold text-yellow-400 border-b border-yellow-500 pb-1 mb-4">
                          • {categoria}
                        </h2>
                        
                        <div>
                          {pratosPorCategoria[categoria].map(prato => (
                            <PratoVisualItem 
                              key={prato.id} 
                              prato={prato} 
                              idioma={idioma}
                              moeda={moeda}
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
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-left">
                <p>{textos.rodape[idioma].pedidos}</p>
                <p className="font-bold text-yellow-500">7 00-21 00</p>
              </div>
              <div className="text-center">
                <p>{textos.rodape[idioma].endereco}</p>
                <p className="font-bold text-white">Calle Venezuela 750</p>
                <p>{textos.rodape[idioma].entre}</p>
              </div>
              <div className="text-right">
                <div className="bg-yellow-600 text-black text-xs p-1 rounded inline-block mb-1">
                  <span className="font-bold">Restaurante Chaufa</span>
                </div>
                <p>© {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

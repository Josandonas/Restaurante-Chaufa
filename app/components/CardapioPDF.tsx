/**
 * CardapioPDF.tsx
 * 
 * Componente para geração do PDF do cardápio utilizando react-pdf/renderer.
 * Este componente renderiza a lista de pratos em um formato padronizado para download.
 * Suporta múltiplos idiomas e moedas utilizando a API de tradução e o serviço de taxa de câmbio.
 */

import { useState, useEffect } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';

import type { Prato } from '@/models/Prato';
import { processarPratos, obterTaxaCambioFormatada } from '@/services/prato/pratoService';

// Textos traduzidos para o PDF
interface TextosPDF {
  [key: string]: {
    pt: string;
    es: string;
  }
}

// Textos em diferentes idiomas
const textosPDF: TextosPDF = {
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
    pt: "Nenhum prato disponível",
    es: "No hay platos disponibles"
  },
  semDescricao: {
    pt: "Sem descrição",
    es: "Sin descripción"
  }
};

// Símbolos de moeda
const simbolosMoeda: Record<string, string> = {
  brl: "R$",
  bob: "Bs"
};

/**
 * Props para o componente CardapioPDF
 */
interface CardapioPDFProps {
  /** Lista de pratos para exibir no cardápio */
  pratos: Prato[];
  /** Informações de versão do cardápio */
  versao: { 
    numero: string; 
    ultimaAtualizacao: string; 
  };
  /** Idioma selecionado */
  idioma?: 'pt' | 'es';
  /** Moeda selecionada */
  moeda?: 'brl' | 'bob';
  /** Aplicar tradução aos textos (ativado por padrão para PT) */
  traduzir?: boolean;
}
  
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
      fontFamily: 'Helvetica',
      backgroundColor: '#2a2322'
    },
    title: {
      fontSize: 22,
      marginBottom: 5,
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#fff'
    },
    subtitle: {
      fontSize: 12,
      marginBottom: 15,
      textAlign: 'center',
      fontStyle: 'italic',
      color: '#e2ac50'
    },
    header: {
      fontSize: 10,
      textAlign: 'right',
      marginBottom: 20,
      color: '#aaa'
    },
    sectionTitle: {
      fontSize: 16,
      marginTop: 15,
      marginBottom: 10,
      borderBottom: 1,
      paddingBottom: 4,
      color: '#e2ac50',
      borderColor: '#555'
    },
    item: {
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    itemContent: {
      flex: 1
    },
    itemLine: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    nome: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fff'
    },
    categoria: {
      fontStyle: 'italic',
      color: '#aaa',
      fontSize: 10
    },
    descricao: {
      marginTop: 2,
      fontSize: 10,
      color: '#ccc'
    },
    preco: {
      fontWeight: 'bold',
      color: '#e2ac50'
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      fontSize: 10,
      textAlign: 'center',
      color: '#aaa'
    },
    version: {
      position: 'absolute',
      top: 15,
      right: 15,
      fontSize: 8,
      color: '#999'
    },
    taxaInfo: {
      position: 'absolute',
      top: 25,
      right: 15,
      fontSize: 8,
      color: '#999'
    },
    semPratos: {
      marginTop: 30,
      textAlign: 'center',
      color: '#aaa',
      fontSize: 14,
      fontStyle: 'italic'
    }
  });
  
/**
 * Função para agrupar pratos por categoria
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
 * Componente que gera um PDF do cardápio
 */
export function CardapioPDF({ pratos, versao, idioma = 'pt', moeda = 'brl', traduzir }: CardapioPDFProps) {
  // Determina se deve traduzir com base no parâmetro ou no idioma selecionado
  const deveTraducir = traduzir !== undefined ? traduzir : idioma === 'pt';
  
  // Estado para armazenar pratos processados
  const [pratosProcessados, setPratosProcessados] = useState<Prato[]>([]);
  const [taxaCambio, setTaxaCambio] = useState<string>('');
  const [carregado, setCarregado] = useState<boolean>(false);

  // Efeito para processar os pratos quando o componente for montado
  useEffect(() => {
    const processarDadosPDF = async () => {
      try {
        // Processar pratos com tradução e conversão de moeda conforme necessário
        const pratosAtualizados = await processarPratos(pratos, {
          traduzir: deveTraducir,   // Traduzir se solicitado ou se o idioma for português
          converterMoeda: true       // Sempre converter para ter ambas as moedas
        });
        
        setPratosProcessados(pratosAtualizados);
        
        // Obter e formatar a taxa de câmbio
        const taxaFormatada = obterTaxaCambioFormatada();
        setTaxaCambio(taxaFormatada);
        
        setCarregado(true);
      } catch (error) {
        console.error('Erro ao processar pratos para PDF:', error);
      }
    };
    
    processarDadosPDF();
  }, [pratos, deveTraducir]);

  // Não renderiza nada até que os dados estejam prontos
  if (!carregado) {
    return null;
  }

  const pratosPorCategoria = agruparPorCategoria(pratosProcessados);
  const categorias = Object.keys(pratosPorCategoria);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.title}>{textosPDF.titulo[idioma]}</Text>
        <Text style={styles.subtitle}>{textosPDF.subtitulo[idioma]}</Text>
        
        {/* Informação de versão e taxa de câmbio */}
        <Text style={styles.version}>
          {textosPDF.versao[idioma]}: {versao.numero}
        </Text>
        <Text style={styles.taxaInfo}>
          {textosPDF.taxaCambio[idioma]} {taxaCambio}
        </Text>
        
        {/* Pratos agrupados por categoria */}
        {categorias.length === 0 ? (
          <Text style={styles.semPratos}>{textosPDF.semPratos[idioma]}</Text>
        ) : (
          categorias.map(categoria => {
            return (
              <View key={categoria}>
                <Text style={styles.sectionTitle}>• {categoria}</Text>
                
                {pratosPorCategoria[categoria].map(prato => {
                  // Obter nome e descrição no idioma correto
                  const nome = prato.nome;
                    
                  const descricao = prato.descricao || textosPDF.semDescricao[idioma];
                  
                  // Obter preço na moeda selecionada
                  const precoExibido = moeda === 'brl' ? 
                    `${simbolosMoeda.brl} ${prato.preco.toFixed(2)}` : 
                    `${simbolosMoeda.bob} ${prato.preco.toFixed(2)}`;
                  
                  return (
                    <View key={prato.id} style={styles.item}>
                      <View style={styles.itemContent}>
                        <View style={styles.itemLine}>
                          <Text style={styles.nome}>{nome}</Text>
                          <Text style={styles.preco}>{precoExibido}</Text>
                        </View>
                        <Text style={styles.descricao}>{descricao}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
        
        {/* Rodapé */}
        <Text style={styles.footer}>
          {textosPDF.rodape[idioma]} | Tel: 7 00-21 00
        </Text>
      </Page>
    </Document>
  );
}
  
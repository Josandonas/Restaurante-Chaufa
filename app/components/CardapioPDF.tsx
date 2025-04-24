/**
 * CardapioPDF.tsx
 * 
 * Componente para geração do PDF do cardápio utilizando react-pdf/renderer.
 * Este componente renderiza a lista de pratos em um formato padronizado para download.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

import type { Prato } from '@/models/Prato';
import { UI_LABELS } from '@/lib/constants';
  
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
}
  
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontSize: 12,
      fontFamily: 'Helvetica'
    },
    title: {
      fontSize: 18,
      marginBottom: 10,
      textAlign: 'center',
      fontWeight: 'bold'
    },
    header: {
      fontSize: 10,
      textAlign: 'right',
      marginBottom: 10
    },
    item: {
      marginBottom: 12
    },
    nome: {
      fontSize: 14,
      fontWeight: 'bold'
    },
    categoria: {
      fontStyle: 'italic',
      color: '#555'
    },
    descricao: {
      marginTop: 2
    },
    preco: {
      marginTop: 2,
      color: 'green'
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      fontSize: 10,
      textAlign: 'center',
      color: '#999'
    }
  });
  
/**
 * Componente que gera um PDF do cardápio
 */
export function CardapioPDF({ pratos, versao }: CardapioPDFProps) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{UI_LABELS.CARDAPIO}</Text>
          {pratos.map(prato => (
            <View key={prato.id} style={styles.item}>
              <Text style={styles.nome}>{prato.nome}</Text>
              <Text style={styles.categoria}>{prato.categoria}</Text>
              <Text style={styles.descricao}>{prato.descricao || UI_LABELS.SEM_DESCRICAO}</Text>
              <Text style={styles.preco}>R$ {prato.preco.toFixed(2)}</Text>
            </View>
          ))}
           <Text style={styles.footer}>
            {UI_LABELS.VERSAO_INFO.replace('{0}', versao.numero)} | {UI_LABELS.PDF_INFO}
          </Text>
        </Page>
      </Document>
    );
  }
  
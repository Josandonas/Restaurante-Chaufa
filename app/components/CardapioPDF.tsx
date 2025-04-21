// components/CardapioPDF.tsx

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
  //  Font
  } from '@react-pdf/renderer';
  
  import type { Prato } from '@/models/Prato';
  
  interface Props {
    pratos: Prato[];
    versao: { numero: string; ultimaAtualizacao: string };
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
  
  export function CardapioPDF({ pratos, versao }: Props) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Cardápio Digital</Text>
          {pratos.map(prato => (
            <View key={prato.id} style={styles.item}>
              <Text style={styles.nome}>{prato.nome}</Text>
              <Text style={styles.categoria}>{prato.categoria}</Text>
              <Text style={styles.descricao}>{prato.descricao}</Text>
              <Text style={styles.preco}>R$ {prato.preco.toFixed(2)}</Text>
            </View>
          ))}
           <Text style={styles.footer}>
            Versão: {versao.numero} | Baixado em: {new Date(versao.ultimaAtualizacao).toLocaleString()}
          </Text>
        </Page>
      </Document>
    );
  }
  
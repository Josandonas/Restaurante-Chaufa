'use client';

/**
 * PDFDownloader.tsx
 * 
 * Componente do lado do cliente para gerar PDF do cardápio.
 * Separado para permitir acesso às APIs do navegador como document.
 */

import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CardapioPDF } from './CardapioPDF';
import type { Prato } from '@/models/Prato';
import type { Versao } from '@/app/page';

interface PDFDownloaderProps {
  pratos: Prato[];
  versao: Versao;
}

export function PDFDownloader({ pratos, versao }: PDFDownloaderProps) {
  const [mounted, setMounted] = useState(false);
  
  // Só renderiza no lado do cliente após a montagem do componente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <button className="bg-amber-600 text-white px-4 py-2 rounded-md shadow-sm opacity-50 cursor-not-allowed">
      Preparando PDF...
    </button>;
  }

  // Seguro para acessar document aqui, pois estamos no lado do cliente
  const getIdioma = (): 'pt' | 'es' => {
    return (document.getElementById('idiomaPDF') as HTMLSelectElement)?.value as 'pt' | 'es' || 'pt';
  };

  const getMoeda = (): 'brl' | 'bob' => {
    return (document.getElementById('moedaPDF') as HTMLSelectElement)?.value as 'brl' | 'bob' || 'brl';
  };

  const getTraduzir = (): boolean => {
    return (document.getElementById('idiomaPDF') as HTMLSelectElement)?.value === 'pt';
  };

  return (
    <PDFDownloadLink
      document={
        <CardapioPDF 
          pratos={pratos} 
          versao={versao} 
          idioma={getIdioma()}
          moeda={getMoeda()}
          traduzir={getTraduzir()}
        />
      }
      fileName={`cardapio-${versao.numero || 'atual'}.pdf`}
    >
      {({ loading: loadingPDF, error: errorPDF }) => (
        <button
          className={`bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors ${
            loadingPDF ? 'opacity-50 cursor-wait' : ''
          }`}
          disabled={loadingPDF}
        >
          {loadingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}

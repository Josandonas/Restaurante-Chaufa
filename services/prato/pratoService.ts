/**
 * pratoService.ts
 * 
 * Serviço para processamento dos pratos do cardápio,
 * incluindo tradução e conversão de moeda.
 */

import { Prato, PratoProcessado } from '@/models/Prato';
import { translateText } from '../translation/translationService';
import { convertBOBtoBRL, getExchangeRate } from '../exchangeRate/exchangeRateService';

/**
 * Processa um prato aplicando tradução e conversão de moeda conforme necessário
 * @param prato Prato original (em espanhol e BOB)
 * @param options Opções de processamento
 * @returns Prato processado com dados traduzidos e convertidos
 */
export async function processarPrato(
  prato: Prato,
  options: { traduzir?: boolean; converterMoeda?: boolean } = {}
): Promise<PratoProcessado> {
  const { traduzir = false, converterMoeda = false } = options;
  
  // Cria uma cópia do prato original
  const pratoProcessado: PratoProcessado = { ...prato };
  
  // Se tradução solicitada, traduz os textos do espanhol para português
  if (traduzir) {
    // Traduz o nome
    const nomeResult = await translateText(prato.nome);
    pratoProcessado.nomeProcessado = nomeResult.translatedText;
    
    // Traduz a categoria
    const categoriaResult = await translateText(prato.categoria);
    pratoProcessado.categoriaProcessada = categoriaResult.translatedText;
    
    // Traduz a descrição, se existir
    if (prato.descricao) {
      const descricaoResult = await translateText(prato.descricao);
      pratoProcessado.descricaoProcessada = descricaoResult.translatedText;
    }
    
    pratoProcessado.idioma = 'pt';
  } else {
    // Se não for traduzir, mantém o idioma original
    pratoProcessado.idioma = 'es';
  }
  
  // Se conversão de moeda solicitada, converte o preço de BOB para BRL
  if (converterMoeda) {
    pratoProcessado.precoBRL = convertBOBtoBRL(prato.preco);
  }
  
  return pratoProcessado;
}

/**
 * Processa uma lista de pratos aplicando tradução e conversão de moeda
 * @param pratos Lista de pratos originais
 * @param options Opções de processamento
 * @returns Lista de pratos processados
 */
export async function processarPratos(
  pratos: Prato[],
  options: { traduzir?: boolean; converterMoeda?: boolean } = {}
): Promise<PratoProcessado[]> {
  // Processa cada prato individualmente
  const promessas = pratos.map(prato => processarPrato(prato, options));
  return Promise.all(promessas);
}

/**
 * Obtém o preço formatado do prato na moeda desejada
 * @param prato Prato ou prato processado
 * @param moeda Moeda desejada ('bob' ou 'brl')
 * @returns String formatada com símbolo da moeda
 */
export function obterPrecoFormatado(
  prato: Prato | PratoProcessado,
  moeda: 'bob' | 'brl' = 'bob'
): string {
  if (moeda === 'brl') {
    // Se for prato processado e já tiver o preço em BRL calculado
    if ('precoBRL' in prato && prato.precoBRL !== undefined) {
      return `R$ ${prato.precoBRL.toFixed(2)}`;
    }
    
    // Caso contrário, converter o preço de BOB para BRL
    const precoBRL = convertBOBtoBRL(prato.preco);
    return `R$ ${precoBRL.toFixed(2)}`;
  } else {
    // Formato para Bolivianos
    return `Bs ${prato.preco.toFixed(2)}`;
  }
}

/**
 * Obtém o texto do prato no idioma desejado
 * @param prato Prato processado
 * @param campo Nome do campo (nome, categoria ou descricao)
 * @returns Texto no idioma configurado ou original se não houver tradução
 */
export function obterTextoPrato(
  prato: PratoProcessado,
  campo: 'nome' | 'categoria' | 'descricao'
): string {
  // Se o idioma for português e existir o campo processado, retorna o campo processado
  if (prato.idioma === 'pt') {
    if (campo === 'nome' && prato.nomeProcessado) {
      return prato.nomeProcessado;
    }
    if (campo === 'categoria' && prato.categoriaProcessada) {
      return prato.categoriaProcessada;
    }
    if (campo === 'descricao' && prato.descricaoProcessada) {
      return prato.descricaoProcessada || '';
    }
  }
  
  // Caso contrário, retorna o campo original
  return prato[campo] || '';
}

/**
 * Obtém a taxa de câmbio atual formatada
 * @returns String formatada com a taxa de câmbio
 */
export function obterTaxaCambioFormatada(): string {
  const taxa = getExchangeRate();
  return `1 BOB = ${taxa.toFixed(2)} BRL`;
}

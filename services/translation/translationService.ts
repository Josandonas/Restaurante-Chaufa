/**
 * translationService.ts
 * 
 * Serviço responsável por traduzir textos do espanhol para o português
 * utilizando a API do Google Translate ou similar.
 */

import axios from 'axios';

// Interface para o objeto de configuração da API de tradução
interface TranslationAPIConfig {
  apiKey: string;
  endpoint: string;
}

// Interface para o resultado da tradução
interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: 'es';
  targetLanguage: 'pt';
}

// Configuração padrão (precisa ser atualizada com suas chaves reais)
const DEFAULT_CONFIG: TranslationAPIConfig = {
  apiKey: process.env.TRANSLATION_API_KEY || 'sua-chave-api-aqui',
  endpoint: 'https://translation.googleapis.com/language/translate/v2'
};

/**
 * Traduz um texto do espanhol para o português
 * @param text Texto em espanhol para traduzir
 * @param config Configuração da API (opcional)
 */
export async function translateText(
  text: string, 
  config: TranslationAPIConfig = DEFAULT_CONFIG
): Promise<TranslationResult> {
  try {
    // Implementação utilizando a API do Google Translate
    // Nota: Em um ambiente de produção, use sua chave API real e trate exceções adequadamente
    
    // Por enquanto, vamos simular a resposta para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      // Em desenvolvimento, retornamos uma simulação para não consumir a API
      console.log(`[DEV] Simulando tradução de: "${text}"`);
      return {
        originalText: text,
        translatedText: simulateTranslation(text),
        sourceLanguage: 'es',
        targetLanguage: 'pt'
      };
    }
    
    // Para produção, usamos a API real
    const response = await axios.post(
      config.endpoint,
      {
        q: text,
        source: 'es',
        target: 'pt',
        format: 'text'
      },
      {
        params: {
          key: config.apiKey
        }
      }
    );
    
    return {
      originalText: text,
      translatedText: response.data.data.translations[0].translatedText,
      sourceLanguage: 'es',
      targetLanguage: 'pt'
    };
  } catch (error) {
    console.error('Erro ao traduzir texto:', error);
    
    // Em caso de erro, retornar o texto original
    return {
      originalText: text,
      translatedText: text, // Em caso de falha, mantemos o texto original
      sourceLanguage: 'es',
      targetLanguage: 'pt'
    };
  }
}

/**
 * Traduz um objeto completo com múltiplos campos de texto
 * @param obj Objeto com campos a serem traduzidos
 * @param fieldsToTranslate Lista de campos que devem ser traduzidos
 */
export async function translateObject<T extends Record<string, any>>(
  obj: T, 
  fieldsToTranslate: (keyof T)[]
): Promise<T> {
  const translatedObj = { ...obj };
  
  for (const field of fieldsToTranslate) {
    if (typeof obj[field] === 'string') {
      const result = await translateText(obj[field] as string);
      translatedObj[field] = result.translatedText as any;
    }
  }
  
  return translatedObj;
}

/**
 * Função simples para simular traduções em desenvolvimento
 * Apenas para fins de teste, não para uso em produção
 */
function simulateTranslation(text: string): string {
  // Mapeamento simples de algumas palavras de espanhol para português
  const dictionary: Record<string, string> = {
    'menú': 'cardápio',
    'plato': 'prato',
    'pollo': 'frango',
    'arroz': 'arroz',
    'carne': 'carne',
    'bebida': 'bebida',
    'precio': 'preço',
    'restaurante': 'restaurante',
    'comida': 'comida',
    'tradicional': 'tradicional',
    'peruano': 'peruano',
    'entrada': 'entrada',
    'postre': 'sobremesa',
    'sabor': 'sabor',
    'delicioso': 'delicioso',
    'caliente': 'quente',
    'frio': 'frio',
    'y': 'e',
    'con': 'com',
    'sin': 'sem',
    'de': 'de',
    'el': 'o',
    'la': 'a',
    'los': 'os',
    'las': 'as'
  };
  
  // Substituir palavras conhecidas
  let translatedText = text.toLowerCase();
  
  Object.keys(dictionary).forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    translatedText = translatedText.replace(regex, dictionary[word]);
  });
  
  // Manter a capitalização similar ao original
  if (text.charAt(0) === text.charAt(0).toUpperCase()) {
    translatedText = translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
  }
  
  return translatedText;
}

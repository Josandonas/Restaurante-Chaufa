/**
 * exchangeRateService.ts
 * 
 * Serviço responsável por gerenciar a taxa de câmbio entre 
 * Boliviano (BOB) e Real Brasileiro (BRL).
 * 
 * Versão isomórfica que funciona tanto no cliente quanto no servidor.
 */

// Taxa de câmbio padrão 
const DEFAULT_EXCHANGE_RATE = 2.70; // 1 BOB = 0.7 BRL (exemplo)

// Variável para armazenar a taxa em memória
let currentExchangeRate = DEFAULT_EXCHANGE_RATE;

/**
 * Obtém a taxa de câmbio atual entre BOB e BRL
 * @returns Taxa de câmbio (1 BOB = X BRL)
 */
export function getExchangeRate(): number {
  // Simplesmente retorna a taxa atual em memória
  return currentExchangeRate;
}

/**
 * Atualiza a taxa de câmbio
 * @param newRate Nova taxa de câmbio (1 BOB = X BRL)
 * @returns true se atualização foi bem-sucedida, false caso contrário
 */
export function updateExchangeRate(newRate: number): boolean {
  try {
    // Valida a taxa de câmbio
    if (isNaN(newRate) || newRate <= 0) {
      console.error('Taxa de câmbio inválida:', newRate);
      return false;
    }
    
    // Atualiza a taxa em memória
    currentExchangeRate = newRate;
    console.log(`Taxa de câmbio atualizada para: ${newRate}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar taxa de câmbio:', error);
    return false;
  }
}

/**
 * Converte um valor de BOB para BRL usando a taxa atual
 * @param bobValue Valor em Bolivianos (BOB)
 * @returns Valor equivalente em Reais (BRL)
 */
export function convertBOBtoBRL(bobValue: number): number {
  const rate = getExchangeRate();
  return bobValue * rate;
}

/**
 * Converte um valor de BRL para BOB usando a taxa atual
 * @param brlValue Valor em Reais (BRL)
 * @returns Valor equivalente em Bolivianos (BOB)
 */
export function convertBRLtoBOB(brlValue: number): number {
  const rate = getExchangeRate();
  return brlValue / rate;
}

/**
 * Obtém a taxa de câmbio formatada para exibição
 * @returns String formatada (ex: "1 BOB = R$ 0.70")
 */
export function obterTaxaCambioFormatada(): string {
  const taxa = getExchangeRate();
  return `1 Bs = R$ ${taxa.toFixed(2)}`;
}

// Inicializa a taxa de câmbio com o valor padrão
updateExchangeRate(DEFAULT_EXCHANGE_RATE);

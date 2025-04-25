/**
 * whatsappService.ts
 * 
 * Serviço responsável por receber e processar mensagens do WhatsApp
 * para atualizar a taxa de câmbio entre Boliviano (BOB) e Real (BRL).
 * 
 * Este serviço simula a recepção de mensagens e atualiza o arquivo
 * de configuração da taxa de câmbio.
 */

import fs from 'fs';
import path from 'path';
import { updateExchangeRate } from '../exchangeRate/exchangeRateService';

// Caminho para o arquivo de log de mensagens do WhatsApp
const whatsappLogPath = path.join(process.cwd(), 'logs', 'whatsapp.log');

// Interface para mensagem do WhatsApp
interface WhatsAppMessage {
  from: string;
  timestamp: Date;
  content: string;
  processed: boolean;
}

/**
 * Processa uma mensagem do WhatsApp para verificar se contém
 * informações sobre a taxa de câmbio.
 * 
 * O formato esperado é: "taxa:X.XX" onde X.XX é o valor da taxa de BOB para BRL
 * Exemplo: "taxa:1.35" significa 1 BOB = 1.35 BRL
 */
export function processWhatsAppMessage(message: WhatsAppMessage): boolean {
  // Verifica se a mensagem já foi processada
  if (message.processed) {
    return false;
  }
  
  // Procura por padrão de taxa de câmbio na mensagem
  const ratePattern = /taxa[:=\s]*([\d.]+)/i;
  const match = message.content.match(ratePattern);
  
  if (match) {
    const rate = parseFloat(match[1]);
    
    // Verifica se o valor da taxa é válido
    if (!isNaN(rate) && rate > 0) {
      // Atualiza a taxa de câmbio
      updateExchangeRate(rate);
      
      // Marca mensagem como processada
      message.processed = true;
      
      // Registra a atualização
      logWhatsappUpdate(message, rate);
      
      console.log(`Taxa de câmbio atualizada para: ${rate} BRL por BOB`);
      return true;
    }
  }
  
  return false;
}

/**
 * Simula o recebimento de uma mensagem do WhatsApp
 * Apenas para desenvolvimento e teste
 */
export function simulateWhatsappMessage(content: string, from: string = '+5591999999999'): void {
  const message: WhatsAppMessage = {
    from,
    timestamp: new Date(),
    content,
    processed: false
  };
  
  processWhatsAppMessage(message);
}

/**
 * Registra atualizações de taxa de câmbio no arquivo de log
 */
function logWhatsappUpdate(message: WhatsAppMessage, rate: number): void {
  try {
    // Certifica-se de que o diretório de logs existe
    const logDir = path.dirname(whatsappLogPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logEntry = `[${message.timestamp.toISOString()}] ${message.from} - Taxa atualizada para: ${rate} BRL por BOB\n`;
    
    fs.appendFileSync(whatsappLogPath, logEntry);
  } catch (error) {
    console.error('Erro ao registrar mensagem de WhatsApp:', error);
  }
}

/**
 * Função que iniciaria o webhook ou serviço de escuta do WhatsApp
 * Em produção, isso seria integrado com uma API oficial do WhatsApp Business
 */
export function startWhatsAppListener(): void {
  console.log('Serviço de escuta do WhatsApp iniciado');
  
  // Em produção, aqui seria implementada a integração com a API do WhatsApp Business
  // Exemplo: webhook do WhatsApp Cloud API ou similar
  
  // Para desenvolvimento, apenas registramos que o serviço foi "iniciado"
}

/**
 * testarWhatsapp.ts
 * 
 * Script para testar a recepção e processamento de mensagens do WhatsApp
 * para atualizar a taxa de câmbio entre Boliviano (BOB) e Real (BRL).
 */

import { simulateWhatsappMessage } from './whatsappService';
import { getExchangeRate } from '../exchangeRate/exchangeRateService';
import fs from 'fs';
import path from 'path';

/**
 * Função principal para testar o processamento de mensagens do WhatsApp
 */
async function testarMensagemWhatsapp() {
  console.log('\n====== TESTE DE MENSAGEM WHATSAPP PARA TAXA DE CÂMBIO ======\n');
  
  // Exibir a taxa atual
  const taxaAtual = getExchangeRate();
  console.log(`Taxa de câmbio atual: 1 BOB = ${taxaAtual.toFixed(2)} BRL`);
  
  // Simular o recebimento de uma mensagem
  console.log('\nSimulando recebimento de mensagem do WhatsApp...');
  
  // Gerar uma taxa ligeiramente diferente para mostrar a mudança
  const novaTaxa = (taxaAtual * 1.05).toFixed(2); // 5% maior
  
  const mensagem = `Taxa: ${novaTaxa}`;
  const remetente = '+5591987654321';
  
  console.log(`De: ${remetente}`);
  console.log(`Mensagem: "${mensagem}"\n`);
  
  // Processar a mensagem
  simulateWhatsappMessage(mensagem, remetente);
  
  // Verificar se a taxa foi atualizada
  const taxaAtualizada = getExchangeRate();
  console.log(`\nTaxa de câmbio atualizada: 1 BOB = ${taxaAtualizada.toFixed(2)} BRL`);
  
  // Verificar se o arquivo de log foi criado
  const logPath = path.join(process.cwd(), 'logs', 'whatsapp.log');
  if (fs.existsSync(logPath)) {
    const logContent = fs.readFileSync(logPath, 'utf-8');
    console.log('\nConteúdo do log de mensagens:');
    console.log(logContent);
  } else {
    console.log('\nArquivo de log não encontrado.');
  }
}

// Executar o teste
testarMensagemWhatsapp()
  .then(() => {
    console.log('\n====== TESTE CONCLUÍDO ======\n');
  })
  .catch(error => {
    console.error('\nErro durante o teste:', error);
  });

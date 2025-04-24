/**
 * pratoService.ts
 *
 * Serviço responsável por gerenciar operações relacionadas aos pratos do cardápio.
 * Utiliza Firebase Firestore para persistência de dados.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  DocumentData,
  Unsubscribe,
  QuerySnapshot,
  FirestoreError,
  query,
  where,
  writeBatch
} from 'firebase/firestore';

import type { Prato } from '@/models/Prato';
import { COLLECTIONS, DOCUMENT_FIELDS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Escuta por mudanças nos pratos ativos do cardápio
 * @param callback Função chamada quando há mudanças na coleção
 * @returns Função para cancelar a inscrição
 */
export function listenPratos(callback: (pratos: Prato[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CARDAPIO), where(DOCUMENT_FIELDS.ATIVO, '==', true)), 
      (snapshot: QuerySnapshot) => {
        const lista = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...(doc.data() as DocumentData) 
        })) as Prato[];
        callback(lista);
      },
      (error: FirestoreError) => {
        console.error(`Erro ao escutar pratos: ${error.code}`, error);
        callback([]);
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao configurar listener de pratos: ${errorMessage}`, error);
    return () => {}; // Retorna uma função de unsubscribe vazia em caso de erro
  }
}

/**
 * Escuta por mudanças nos pratos na lixeira
 * @param callback Função chamada quando há mudanças na coleção
 * @returns Função para cancelar a inscrição
 */
export function listenPratosLixeira(callback: (pratos: Prato[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CARDAPIO), where(DOCUMENT_FIELDS.ATIVO, '==', false)), 
      (snapshot: QuerySnapshot) => {
        const lista = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...(doc.data() as DocumentData) 
        })) as Prato[];
        callback(lista);
      },
      (error: FirestoreError) => {
        console.error(`Erro ao escutar pratos na lixeira: ${error.code}`, error);
        callback([]);
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao configurar listener de pratos na lixeira: ${errorMessage}`, error);
    return () => {}; // Retorna uma função de unsubscribe vazia em caso de erro
  }
}

/**
 * Move um prato para a lixeira (soft delete)
 * @param id ID do prato a ser movido para lixeira
 * @returns Promise que resolve quando a operação é concluída
 */
export async function moverParaLixeiraPrato(id: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CARDAPIO, id);
    await updateDoc(ref, { [DOCUMENT_FIELDS.ATIVO]: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao mover prato ${id} para lixeira: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
  }
}

/**
 * Restaura um prato da lixeira
 * @param id ID do prato a ser restaurado
 * @returns Promise que resolve quando a operação é concluída
 */
export async function restaurarPrato(id: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CARDAPIO, id);
    await updateDoc(ref, { [DOCUMENT_FIELDS.ATIVO]: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao restaurar prato ${id}: ${errorMessage}`, error);
    throw new Error(`Não foi possível restaurar o prato. Por favor, tente novamente.`);
  }
}

/**
 * Esvazia permanentemente a lixeira de pratos
 * @returns Promise que resolve quando a operação é concluída
 */
export async function esvaziarLixeiraPratos(): Promise<void> {
  try {
    const q = query(collection(db, COLLECTIONS.CARDAPIO), where(DOCUMENT_FIELDS.ATIVO, '==', false));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return; // Não há pratos na lixeira para excluir
    }
    
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao esvaziar lixeira de pratos: ${errorMessage}`, error);
    throw new Error(`Não foi possível esvaziar a lixeira. Por favor, tente novamente.`);
  }
}

/**
 * Atualiza as informações de um prato
 * @param prato Objeto prato com dados atualizados
 * @returns Promise que resolve quando a operação é concluída
 */
export async function updatePrato(prato: Prato): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CARDAPIO, prato.id);
    await updateDoc(ref, {
      [DOCUMENT_FIELDS.NOME]: prato.nome,
      [DOCUMENT_FIELDS.PRECO]: prato.preco,
      [DOCUMENT_FIELDS.CATEGORIA]: prato.categoria,
      [DOCUMENT_FIELDS.DESCRICAO]: prato.descricao
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao atualizar prato ${prato.id}: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_EDITAR_PRATO);
  }
}

/**
 * Remove permanentemente um prato (hard delete)
 * @param id ID do prato a ser removido
 * @returns Promise que resolve quando a operação é concluída
 */
export async function removePrato(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CARDAPIO, id));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao remover prato ${id}: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
  }
}

/**
 * Adiciona um novo prato ao cardápio
 * @param prato Objeto contendo os dados do novo prato (sem ID)
 * @returns Promise que resolve quando a operação é concluída
 */
export async function addPrato(prato: Omit<Prato, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.CARDAPIO), { 
      ...prato, 
      [DOCUMENT_FIELDS.ATIVO]: true 
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao adicionar prato: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
  }
}

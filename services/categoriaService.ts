/**
 * categoriaService.ts
 *
 * Serviço responsável por gerenciar operações relacionadas às categorias do cardápio.
 * Utiliza Firebase Firestore para persistência de dados.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  DocumentData,
  Unsubscribe,
  QuerySnapshot,
  query,
  where,
  getDocs,
  writeBatch,
  updateDoc,
  doc,
  FirestoreError
} from 'firebase/firestore';

import type { Categoria } from '@/models/Categoria';
import { COLLECTIONS, DOCUMENT_FIELDS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Tipo auxiliar para dados de nova categoria
 */
export type NovaCategoria = {
  nome: string;
  criado_em: Date;
  ativo: boolean;
};

/**
 * Escuta por mudanças nas categorias ativas
 * @param callback Função chamada quando há mudanças na coleção
 * @returns Função para cancelar a inscrição
 */
export function listenCategorias(callback: (categorias: Categoria[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CATEGORIAS), where(DOCUMENT_FIELDS.ATIVO, '==', true)),
      (snapshot: QuerySnapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as DocumentData)
        })) as Categoria[];
        callback(lista);
      },
      (error: FirestoreError) => {
        console.error(`Erro ao escutar categorias: ${error.code}`, error);
        callback([]);
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao configurar listener de categorias: ${errorMessage}`, error);
    return () => {}; // Retorna uma função de unsubscribe vazia em caso de erro
  }
}

/**
 * Escuta por mudanças nas categorias na lixeira
 * @param callback Função chamada quando há mudanças na coleção
 * @returns Função para cancelar a inscrição
 */
export function listenCategoriasLixeira(callback: (categorias: Categoria[]) => void): Unsubscribe {
  try {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CATEGORIAS), where(DOCUMENT_FIELDS.ATIVO, '==', false)),
      (snapshot: QuerySnapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as DocumentData)
        })) as Categoria[];
        callback(lista);
      },
      (error: FirestoreError) => {
        console.error(`Erro ao escutar categorias na lixeira: ${error.code}`, error);
        callback([]);
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao configurar listener de categorias na lixeira: ${errorMessage}`, error);
    return () => {}; // Retorna uma função de unsubscribe vazia em caso de erro
  }
}

/**
 * Move uma categoria para a lixeira (soft delete)
 * @param id ID da categoria a ser movida para lixeira
 * @returns Promise que resolve quando a operação é concluída
 */
export async function moverParaLixeiraCategoria(id: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CATEGORIAS, id);
    await updateDoc(ref, { [DOCUMENT_FIELDS.ATIVO]: false });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao mover categoria ${id} para lixeira: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_MOVER_CATEGORIA_LIXEIRA);
  }
}

/**
 * Restaura uma categoria da lixeira
 * @param id ID da categoria a ser restaurada
 * @returns Promise que resolve quando a operação é concluída
 */
export async function restaurarCategoria(id: string): Promise<void> {
  try {
    const ref = doc(db, COLLECTIONS.CATEGORIAS, id);
    await updateDoc(ref, { [DOCUMENT_FIELDS.ATIVO]: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao restaurar categoria ${id}: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_RESTAURAR_CATEGORIA);
  }
}

/**
 * Esvazia permanentemente a lixeira de categorias
 * @returns Promise que resolve quando a operação é concluída
 */
export async function esvaziarLixeiraCategorias(): Promise<void> {
  try {
    const q = query(collection(db, COLLECTIONS.CATEGORIAS), where(DOCUMENT_FIELDS.ATIVO, '==', false));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return; // Não há categorias na lixeira para excluir
    }
    
    const batch = writeBatch(db);
    snapshot.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao esvaziar lixeira de categorias: ${errorMessage}`, error);
    throw new Error(`Não foi possível esvaziar a lixeira de categorias. Tente novamente.`);
  }
}

/**
 * Adiciona uma nova categoria
 * @param categoria Objeto contendo os dados da nova categoria
 * @returns Promise que resolve quando a operação é concluída
 */
export async function addCategoria(categoria: NovaCategoria): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.CATEGORIAS), categoria);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`Erro ao adicionar categoria: ${errorMessage}`, error);
    throw new Error(ERROR_MESSAGES.ERRO_ADICIONAR_CATEGORIA);
  }
}

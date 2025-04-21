import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, DocumentData } from 'firebase/firestore';
import type { Categoria } from '@/models/Categoria';

import { query, where, getDocs, writeBatch, updateDoc, doc } from 'firebase/firestore';

export function listenCategorias(callback: (categorias: Categoria[]) => void) {
  return onSnapshot(query(collection(db, 'categorias'), where('ativo', '==', true)), snapshot => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Categoria[];
    callback(lista);
  });
}

export function listenCategoriasLixeira(callback: (categorias: Categoria[]) => void) {
  return onSnapshot(query(collection(db, 'categorias'), where('ativo', '==', false)), snapshot => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Categoria[];
    callback(lista);
  });
}

export async function moverParaLixeiraCategoria(id: string) {
  const ref = doc(db, 'categorias', id);
  await updateDoc(ref, { ativo: false });
}

export async function restaurarCategoria(id: string) {
  const ref = doc(db, 'categorias', id);
  await updateDoc(ref, { ativo: true });
}

export async function esvaziarLixeiraCategorias() {
  const q = query(collection(db, 'categorias'), where('ativo', '==', false));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach(docSnap => batch.delete(docSnap.ref));
  await batch.commit();
}

export async function addCategoria(categoria: { nome: string; criado_em: Date; ativo: boolean }) {
  await addDoc(collection(db, 'categorias'), categoria);
}

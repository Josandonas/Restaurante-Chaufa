import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  DocumentData
} from 'firebase/firestore';
import type { Prato } from '@/models/Prato';

import { query, where, writeBatch } from 'firebase/firestore';

export function listenPratos(callback: (pratos: Prato[]) => void) {
  return onSnapshot(query(collection(db, 'cardapio'), where('ativo', '==', true)), snapshot => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Prato[];
    callback(lista);
  });
}

export function listenPratosLixeira(callback: (pratos: Prato[]) => void) {
  return onSnapshot(query(collection(db, 'cardapio'), where('ativo', '==', false)), snapshot => {
    const lista = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Prato[];
    callback(lista);
  });
}

export async function moverParaLixeiraPrato(id: string) {
  const ref = doc(db, 'cardapio', id);
  await updateDoc(ref, { ativo: false });
}

export async function restaurarPrato(id: string) {
  const ref = doc(db, 'cardapio', id);
  await updateDoc(ref, { ativo: true });
}

export async function esvaziarLixeiraPratos() {
  const q = query(collection(db, 'cardapio'), where('ativo', '==', false));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.forEach(docSnap => batch.delete(docSnap.ref));
  await batch.commit();
}

export async function updatePrato(prato: Prato) {
  const ref = doc(db, 'cardapio', prato.id);
  await updateDoc(ref, {
    nome: prato.nome,
    preco: prato.preco,
    categoria: prato.categoria,
    descricao: prato.descricao
  });
}

export async function removePrato(id: string) {
  await deleteDoc(doc(db, 'cardapio', id));
}

export async function addPrato(prato: Omit<Prato, 'id'>) {
  await addDoc(collection(db, 'cardapio'), { ...prato, ativo: true });
}

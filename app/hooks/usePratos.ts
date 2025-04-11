import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  DocumentData
} from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface Prato {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
}
export type { Prato };
export function usePratos(user: User | null){
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pratoEditando, setPratoEditando] = useState<Prato | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, 'cardapio'), snapshot => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Prato[];
      setPratos(lista);
    });

    return () => unsubscribe();
  }, [user]);

  const abrirModal = (prato: Prato) => {
    setPratoEditando(prato);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPratoEditando(null);
  };

  const salvarEdicao = async () => {
    if (pratoEditando) {
      const ref = doc(db, 'cardapio', pratoEditando.id);
      await updateDoc(ref, {
        nome: pratoEditando.nome,
        preco: pratoEditando.preco,
        categoria: pratoEditando.categoria,
        descricao: pratoEditando.descricao
      });
      fecharModal();
    }
  };

  const removerPrato = async (id: string) => {
    const confirmado = confirm('Deseja remover este prato?');
    if (confirmado) {
      await deleteDoc(doc(db, 'cardapio', id));
    }
  };

  const adicionarPrato = async (novo: Omit<Prato, 'id'>) => {
    await addDoc(collection(db, 'cardapio'), novo);
  };

  return {
    pratos,
    modalAberto,
    pratoEditando,
    abrirModal,
    fecharModal,
    salvarEdicao,
    removerPrato,
    setPratoEditando,
    adicionarPrato 
  };
}
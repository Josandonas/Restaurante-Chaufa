import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Categoria {
  id: string;
  nome: string;
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categorias'), snapshot => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as { nome: string })
      }));
      setCategorias(lista);
    });

    return () => unsubscribe();
  }, []);

  const adicionarCategoria = async (nome: string) => {
    if (!nome.trim()) return;
    await addDoc(collection(db, 'categorias'), {
      nome: nome.trim(),
      criadoEm: Timestamp.now()
    });
  };

  return {
    categorias,
    adicionarCategoria
  };
}
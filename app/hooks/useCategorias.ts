import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
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
        nome: doc.data().nome,
      }));
      setCategorias(lista);
    });

    return unsubscribe;
  }, []);

  const adicionarCategoria = async (nome: string) => {
    await addDoc(collection(db, 'categorias'), {
      nome: nome.trim(),
      criado_em: new Date(),
    });
  };

  return { categorias, adicionarCategoria };
}
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Categoria {
  id: string;
  nome: string;
  criado_em: Timestamp;
}

export function ListaDeCategoriasPainel() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categorias'), snapshot => {
      const lista: Categoria[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome: data.nome,
          criado_em: data.criado_em ?? Timestamp.now(),
        };
      });
      setCategorias(lista);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-3">
      {categorias.map(categoria => (
        <div key={categoria.id} className="bg-white rounded-md p-4 shadow flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">{categoria.nome}</h3>
            <p className="text-sm text-gray-500">
              Criada em: {categoria.criado_em.toDate().toLocaleDateString('pt-BR')}
            </p>
          </div>
          {/* Em breve: Botões para editar/remover */}
        </div>
      ))}
    </div>
  );
}

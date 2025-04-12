'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Prato } from '@/hooks/usePratos';

interface NovoPratoModalProps {
  onClose: () => void;
  onCreate: (novo: Omit<Prato, 'id'>) => void;
  categorias: string[];
}

export function NovoPratoModal({ onClose, onCreate }: NovoPratoModalProps) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [usarNovaCategoria, setUsarNovaCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number>(0);
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categorias'), snapshot => {
      const nomes = snapshot.docs.map(doc => doc.data().nome as string);
      setCategorias(nomes);
    });
    return unsubscribe;
  }, []);

  const salvar = async () => {
    const categoriaFinal = usarNovaCategoria ? novaCategoria.trim() : categoria;
    if (!nome || !categoriaFinal || preco <= 0) return;

    if (usarNovaCategoria && novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      await addDoc(collection(db, 'categorias'), {
        nome: novaCategoria.trim(),
        criado_em: new Date()
      });
    }

    const novoPrato: Omit<Prato, 'id'> = {
      nome,
      categoria: categoriaFinal,
      descricao,
      preco,
    };

    await addDoc(collection(db, 'cardapio'), novoPrato);
    onCreate(novoPrato);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full space-y-4">
        <h2 className="text-2xl font-semibold">Novo Prato</h2>

        <input
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="usarNovaCategoria"
            checked={usarNovaCategoria}
            onChange={() => setUsarNovaCategoria(!usarNovaCategoria)}
            className="accent-blue-600"
          />
          <label htmlFor="usarNovaCategoria" className="text-sm">Cadastrar nova categoria</label>
        </div>

        {!usarNovaCategoria ? (
          <select
            className="w-full border border-gray-300 p-3 rounded-md"
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
          >
            <option value="">Selecione uma categoria existente</option>
            {categorias.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          <input
            className="w-full border border-gray-300 p-3 rounded-md"
            placeholder="Digite nova categoria"
            value={novaCategoria}
            onChange={e => setNovaCategoria(e.target.value)}
          />
        )}

        <textarea
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />

        <input
          type="number"
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder="Preço"
          value={preco}
          onChange={e => setPreco(parseFloat(e.target.value))}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-red-400 hover:bg-red-600 rounded-md text-sm">Cancelar</button>
          <button onClick={salvar} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">Salvar</button>
        </div>
      </div>
    </div>
  );
}

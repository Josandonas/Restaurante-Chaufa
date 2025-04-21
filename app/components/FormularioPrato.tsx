'use client';

import { useState } from 'react';
import type { Prato } from '@/models/Prato';
import * as pratoService from '@/services/pratoService';

type Props = {
  onSalvar: () => Promise<void>;
};

export function FormularioPrato({ onSalvar }: Props) {
  const [form, setForm] = useState({
    nome: '',
    preco: '',
    categoria: '',
    descricao: '',
  });

  const [erro, setErro] = useState('');

  const handleSubmit = async () => {
    if (!form.nome || !form.preco) {
      setErro('Nome e preço são obrigatórios');
      return;
    }

    try {
      const novoPrato: Omit<Prato, 'id'> = {
        nome: form.nome,
        preco: parseFloat(form.preco),
        categoria: form.categoria,
        descricao: form.descricao,
        ativo: true,
      };
      await pratoService.addPrato(novoPrato);
      setForm({ nome: '', preco: '', categoria: '', descricao: '' });
      setErro('');
      await onSalvar();
    } catch (e) {
      console.error(e);
      setErro('Erro ao salvar prato');
    }
  };

  return (
    <div className="grid gap-2 mb-6">
      <input
        className="border p-2 rounded"
        placeholder="Nome"
        value={form.nome}
        onChange={e => setForm({ ...form, nome: e.target.value })}
      />
      <input
        className="border p-2 rounded"
        placeholder="Preço"
        type="number"
        value={form.preco}
        onChange={e => setForm({ ...form, preco: e.target.value })}
      />
      <input
        className="border p-2 rounded"
        placeholder="Categoria"
        value={form.categoria}
        onChange={e => setForm({ ...form, categoria: e.target.value })}
      />
      <textarea
        className="border p-2 rounded"
        placeholder="Descrição"
        value={form.descricao}
        onChange={e => setForm({ ...form, descricao: e.target.value })}
      />
      {erro && <p className="text-red-500 text-sm">{erro}</p>}
      <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Salvar Prato
      </button>
    </div>
  );
}
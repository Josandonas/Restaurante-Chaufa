"use client";
import { useState } from "react";
import { addCategoria } from "@/services/categoriaService";
import { useCategorias } from "@/hooks/useCategorias";

interface NovaCategoriaModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function NovaCategoriaModal({ onClose, onSuccess }: NovaCategoriaModalProps) {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const { categorias } = useCategorias(true);
  const [salvando, setSalvando] = useState(false);

  const normalizar = (str: string) => str.trim().toLocaleLowerCase();

  const salvar = async () => {
    setErro("");
    if (!nome.trim()) {
      setErro("Digite o nome da categoria.");
      return;
    }
    // Verificação de escrita e duplicidade
    const existe = categorias.some(cat => normalizar(cat.nome) === normalizar(nome));
    if (existe) {
      setErro("Já existe uma categoria com esse nome (verifique acentuação e caixa).");
      return;
    }
    setSalvando(true);
    try {
      await addCategoria({ nome: nome.trim(), criado_em: new Date(), ativo: true });
      setSalvando(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      setErro("Erro ao cadastrar categoria.");
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Nova Categoria</h2>
        <input
          className="border px-3 py-2 rounded w-full mb-2"
          placeholder="Nome da categoria"
          value={nome}
          onChange={e => setNome(e.target.value)}
          disabled={salvando}
        />
        {erro && <div className="text-red-600 text-sm mb-2">{erro}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-red-400 hover:bg-red-600 rounded-md text-sm">Cancelar</button>
          <button onClick={salvar} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm" disabled={salvando}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

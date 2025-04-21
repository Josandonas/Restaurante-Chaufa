"use client";
import { useEffect, useState } from "react";
import { listenPratosLixeira, esvaziarLixeiraPratos } from "@/services/pratoService";
import { listenCategoriasLixeira, esvaziarLixeiraCategorias } from "@/services/categoriaService";
import type { Prato } from "@/models/Prato";
import type { Categoria } from "@/models/Categoria";

export function PainelLixeira() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [esvaziando, setEsvaziando] = useState(false);

  useEffect(() => {
    const unsubPratos = listenPratosLixeira(setPratos);
    const unsubCategorias = listenCategoriasLixeira(setCategorias);
    setLoading(false);
    return () => {
      unsubPratos();
      unsubCategorias();
    };
  }, []);

  const esvaziarLixeira = async () => {
    setEsvaziando(true);
    await Promise.all([
      esvaziarLixeiraPratos(),
      esvaziarLixeiraCategorias(),
    ]);
    setEsvaziando(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Lixeira</h2>
        <button
          onClick={esvaziarLixeira}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow disabled:opacity-60"
          disabled={esvaziando}
        >
          {esvaziando ? "Esvaziando..." : "Esvaziar Lixeira"}
        </button>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Pratos na Lixeira</h3>
        {pratos.length === 0 ? (
          <p className="text-gray-500">Nenhum prato na lixeira.</p>
        ) : (
          <ul className="space-y-2">
            {[...pratos].sort((a, b) => a.categoria.localeCompare(b.categoria)).map(prato => (
              <li key={prato.id} className="bg-yellow-50 rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center">
                <span>
                  <b>{prato.nome}</b> — {prato.categoria} — R$ {typeof prato.preco === 'number' ? prato.preco.toFixed(2) : '0,00'}
                </span>
                <span className="text-xs text-gray-400">ID: {prato.id}</span>
                <button
                  className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  onClick={async () => {
                    await import('@/services/pratoService').then(mod => mod.restaurarPrato(prato.id));
                  }}
                >
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Categorias na Lixeira</h3>
        {categorias.length === 0 ? (
          <p className="text-gray-500">Nenhuma categoria na lixeira.</p>
        ) : (
          <ul className="space-y-2">
            {categorias.map(cat => (
              <li key={cat.id} className="bg-yellow-50 rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center">
                <span>
                  <b>{cat.nome}</b>
                </span>
                <span className="text-xs text-gray-400">ID: {cat.id}</span>
                <button
                  className="px-4 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  onClick={async () => {
                    await import('@/services/categoriaService').then(mod => mod.restaurarCategoria(cat.id));
                  }}
                >
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

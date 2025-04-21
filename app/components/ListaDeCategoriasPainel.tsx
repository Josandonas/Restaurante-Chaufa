'use client';

import { useCategorias } from '@/hooks/useCategorias';

export function ListaDeCategoriasPainel() {
  const { categorias } = useCategorias(true);

  return (
    <div className="space-y-3">
      {categorias.map(categoria => (
        <div key={categoria.id} className="bg-white rounded-md p-4 shadow flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">{categoria.nome}</h3>
            <p className="text-sm text-gray-500">
              Criada em: {categoria.criado_em?.toDate ? `${categoria.criado_em.toDate().toLocaleDateString('pt-BR')} ${categoria.criado_em.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Data desconhecida'}
            </p>
          </div>
          <button
            onClick={async () => {
              await import('@/services/categoriaService').then(mod => mod.moverParaLixeiraCategoria(categoria.id));
            }}
            className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-700 rounded-md shadow"
          >
            Mover para lixeira
          </button>
        </div>
      ))}
    </div>
  );
}

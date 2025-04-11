'use client';

interface Prato {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
}

interface ListaDePratosProps {
  pratos: Prato[];
  onEditar: (prato: Prato) => void;
  onRemover: (id: string) => void;
}

export function ListaDePratos({ pratos, onEditar, onRemover }: ListaDePratosProps) {
  return (
    <div className="grid gap-4">
      {pratos.map(prato => (
        <div key={prato.id} className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex-1 mb-4 md:mb-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">{prato.nome}</h2>
            <p className="text-sm text-gray-500 italic mb-2">{prato.categoria}</p>
            <p className="text-gray-700 text-sm mb-2">{prato.descricao}</p>
            <p className="text-green-600 font-semibold">R$ {prato.preco.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 md:flex-col md:items-end">
            <button
              onClick={() => onEditar(prato)}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow"
            >
              Editar
            </button>
            <button
              onClick={() => onRemover(prato.id)}
              className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md shadow"
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
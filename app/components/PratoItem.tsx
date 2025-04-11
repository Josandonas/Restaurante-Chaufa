type Prato = {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
};

type Props = {
  prato: Prato;
};

export function PratoItem({ prato }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-md bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800">{prato.nome}</h2>
        <p className="text-gray-600 text-sm italic">{prato.categoria}</p>
        <p className="text-gray-700 text-sm">{prato.descricao}</p>
      </div>
      <div className="text-right sm:text-left">
        <p className="text-xl font-semibold text-green-700">R$ {prato.preco.toFixed(2)}</p>
      </div>
    </div>
  );
}
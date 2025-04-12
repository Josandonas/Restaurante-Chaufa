import { ListaDeCategoriasPainel } from '@/components/ListaDeCategoriasPainel';

export function PainelCategorias() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700">Gerenciar Categorias</h2>
      <ListaDeCategoriasPainel />
    </div>
  );
}
import { useEffect, useState } from 'react';
import type { Categoria } from '@/models/Categoria';
import * as categoriaService from '@/services/categoriaService';

export function useCategorias(ativos: boolean = true) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    const unsubscribe = ativos
      ? categoriaService.listenCategorias(setCategorias)
      : categoriaService.listenCategoriasLixeira(setCategorias);
    return () => unsubscribe();
  }, [ativos]);

  const adicionarCategoria = async (nome: string) => {
    await categoriaService.addCategoria(nome.trim());
  };

  const restaurarCategoria = async (categoriaId: string) => {
    await categoriaService.restaurarCategoria(categoriaId);
  };

  return { categorias, adicionarCategoria, restaurarCategoria };
}
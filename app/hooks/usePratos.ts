import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import type { Prato } from '@/models/Prato';
import * as pratoService from '@/services/pratoService';
export function usePratos(user: User | null, ativos: boolean = true) {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [pratoEditando, setPratoEditando] = useState<Prato | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = ativos
      ? pratoService.listenPratos(setPratos)
      : pratoService.listenPratosLixeira(setPratos);
    return () => unsubscribe();
  }, [user, ativos]);

  const abrirModal = (prato: Prato) => {
    setPratoEditando(prato);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPratoEditando(null);
  };

  const salvarEdicao = async () => {
    if (pratoEditando) {
      await pratoService.updatePrato(pratoEditando);
      fecharModal();
    }
  };

  const removerPrato = async (id: string) => {
    await pratoService.removePrato(id);
  };

  const adicionarPrato = async (prato: Omit<Prato, 'id'>) => {
    await pratoService.addPrato(prato);
  };

  return {
    pratos,
    modalAberto,
    pratoEditando,
    abrirModal,
    fecharModal,
    salvarEdicao,
    removerPrato,
    adicionarPrato,
    setPratoEditando,
    setModalAberto,
  };
}
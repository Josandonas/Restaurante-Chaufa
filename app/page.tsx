'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CardapioPDF } from '@/components/CardapioPDF';
import { PratoItem } from '@/components/PratoItem';
import { FormularioPrato } from '@/components/FormularioPrato';

type Prato = {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  descricao: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [versao, setVersao] = useState({ numero: '', ultimaAtualizacao: '' });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);

    const unsubPratos = onSnapshot(collection(db, 'cardapio'), snap => {
      setPratos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prato)));
    });

    getDoc(doc(db, 'configuracoes', 'versao')).then(docSnap => {
      if (docSnap.exists()) {
        setVersao(docSnap.data() as { numero: string; ultimaAtualizacao: string });
      }
    });

    return () => {
      unsub();
      unsubPratos();
    };
  }, []);

  const login = () => {
    signInWithEmailAndPassword(auth, 'admin@chaufarestaurante.com', 'Fome2@-FogAO\\1').catch(console.error);
  };

  const logout = () => signOut(auth);

  const atualizarVersao = async () => {
    const now = new Date();
    const numero = `v${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}-${now.getHours()}${now.getMinutes()}`;
    await setDoc(doc(db, 'configuracoes', 'versao'), {
      numero,
      ultimaAtualizacao: now.toISOString()
    });
    setVersao({ numero, ultimaAtualizacao: now.toISOString() });
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Cardápio Digital</h1>

      {!user ? (
        <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
      ) : (
        <>
          <div className="mb-4 flex justify-between">
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
          </div>

          <FormularioPrato onSalvar={atualizarVersao} />

          <PDFDownloadLink
            document={<CardapioPDF pratos={pratos} versao={versao} />}
            fileName={`cardapio-${versao.numero}.pdf`}
          >
            {({ loading }) => (
              <button
                className="mb-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {loading ? 'Gerando PDF...' : 'Baixar Cardápio em PDF'}
              </button>
            )}
          </PDFDownloadLink>

          <div className="space-y-4">
            {pratos.map(prato => (
              <PratoItem key={prato.id} prato={prato} />
            ))}

            <div className="text-xs text-gray-400 mt-4">
              Versão: {versao.numero} | Atualizado em: {new Date(versao.ultimaAtualizacao).toLocaleString()}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

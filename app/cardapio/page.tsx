'use client';

/**
 * cardapio/page.tsx
 * 
 * Página principal do cardápio visual do Restaurante Chaufa.
 * Exibe os pratos em formato de menu com suporte a dois idiomas.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Prato } from '@/models/Prato';
import { CardapioVisual } from '@/components/CardapioVisual';
import { COLLECTIONS, DOCUMENT_FIELDS } from '@/lib/constants';

export default function CardapioPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Carrega os pratos ativos do firestore
    const q = query(
      collection(db, COLLECTIONS.CARDAPIO), 
      where(DOCUMENT_FIELDS.ATIVO, '==', true)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const pratosData = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Compatibilidade com o modelo antigo de prato
            const prato: Prato = {
              id: doc.id,
              nome: typeof data.nome === 'object' ? data.nome : { pt: data.nome, es: data.nome },
              categoria: typeof data.categoria === 'object' ? data.categoria : { pt: data.categoria, es: data.categoria },
              descricao: typeof data.descricao === 'object' ? data.descricao : { pt: data.descricao || '', es: data.descricao || '' },
              preco: typeof data.preco === 'object' ? data.preco : { brl: data.preco, bob: data.preco * 3.5 },
              ativo: data.ativo
            };
            
            return prato;
          });
          
          setPratos(pratosData);
        } catch (error) {
          console.error('Erro ao processar dados:', error);
          setErro('Ocorreu um erro ao carregar o cardápio.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Erro ao carregar pratos:', error);
        setErro('Ocorreu um erro ao carregar o cardápio.');
        setLoading(false);
      }
    );
    
    return unsubscribe;
  }, []);

  return (
    <main className="min-h-screen bg-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {erro ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            <p>{erro}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm underline mt-2"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <CardapioVisual pratos={pratos} loading={loading} />
        )}
        
        <div className="mt-8 text-center">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-amber-800 hover:text-amber-600 font-medium"
          >
            <span>Área Administrativa</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}

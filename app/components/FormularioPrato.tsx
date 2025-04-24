/**
 * FormularioPrato.tsx
 * 
 * Componente reutilizável para formulário de pratos, usado tanto para criação quanto para edição.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Prato } from '@/models/Prato';
import { ERROR_MESSAGES, DOCUMENT_FIELDS, UI_LABELS, PLACEHOLDERS, FORM_LABELS } from '@/lib/constants';

/**
 * Interface para valores do formulário, sem tipagem de ID
 */
export interface PratoFormValues {
  nome: string;
  preco: string | number; // Recebe string do campo, mas pode ser inicializado como number
  categoria: string;
  descricao: string;
}

/**
 * Props para o componente de formulário
 */
interface FormularioPratoProps {
  /** Prato inicial para edição (opcional) */
  pratoInicial?: Prato | null;
  /** Lista de categorias disponíveis */
  categorias: string[];
  /** Função chamada quando o formulário é enviado com sucesso */
  onSubmit: (valores: PratoFormValues) => Promise<void>;
  /** Texto do botão de envio */
  textoBotao?: string;
  /** Função chamada em caso de erro */
  onError?: (mensagem: string) => void;
  /** Flag para permitir nova categoria (opcional, para NovoPratoModal) */
  permiteNovaCategoria?: boolean;
}

/**
 * Componente de formulário reutilizável para pratos
 */
export function FormularioPrato({
  pratoInicial,
  categorias,
  onSubmit,
  textoBotao = UI_LABELS.SALVAR,
  onError,
  permiteNovaCategoria = false,
}: FormularioPratoProps) {
  // Estado inicial do formulário
  const [form, setForm] = useState<PratoFormValues>({
    nome: '',
    preco: '',
    categoria: '',
    descricao: '',
  });

  // Flag para uso de nova categoria
  const [usarNovaCategoria, setUsarNovaCategoria] = useState(false);
  // Campo para nova categoria
  const [novaCategoria, setNovaCategoria] = useState('');
  // Estado de erro
  const [erro, setErro] = useState('');
  // Estado de envio
  const [enviando, setEnviando] = useState(false);

  // Atualiza o formulário quando o prato inicial muda (para modo edição)
  useEffect(() => {
    if (pratoInicial) {
      setForm({
        nome: pratoInicial.nome,
        preco: pratoInicial.preco,
        categoria: pratoInicial.categoria,
        descricao: pratoInicial.descricao,
      });
    }
  }, [pratoInicial]);

  /**
   * Valida os campos do formulário
   * @returns True se o formulário é válido
   */
  const validarFormulario = useCallback((): boolean => {
    // Limpa erro anterior
    setErro('');
    
    // Valida nome
    if (!form.nome.trim()) {
      setErro(ERROR_MESSAGES.NOME_OBRIGATORIO);
      return false;
    }
    
    // Valida preço
    const preco = typeof form.preco === 'string' ? parseFloat(form.preco) : form.preco;
    if (isNaN(preco) || preco <= 0) {
      setErro(ERROR_MESSAGES.PRECO_INVALIDO);
      return false;
    }
    
    // Valida categoria
    const categoriaFinal = usarNovaCategoria && permiteNovaCategoria
      ? novaCategoria.trim()
      : form.categoria;
      
    if (!categoriaFinal) {
      setErro(ERROR_MESSAGES.CATEGORIA_OBRIGATORIA);
      return false;
    }
    
    return true;
  }, [form.nome, form.preco, form.categoria, novaCategoria, usarNovaCategoria, permiteNovaCategoria]);

  /**
   * Manipula o envio do formulário
   */
  const handleSubmit = useCallback(async () => {
    if (!validarFormulario()) return;
    
    try {
      setEnviando(true);
      
      // Prepara os valores do formulário
      const valores: PratoFormValues = {
        nome: form.nome.trim(),
        preco: typeof form.preco === 'string' ? parseFloat(form.preco) : form.preco,
        descricao: form.descricao.trim(),
        // Tratamento especial para novas categorias
        categoria: usarNovaCategoria && permiteNovaCategoria 
          ? `nova:${novaCategoria.trim()}` // Prefixo 'nova:' para sinalizar ao componente pai que é uma nova categoria
          : form.categoria,
      };
      
      // Chama a função de envio fornecida pelo componente pai
      await onSubmit(valores);
      
      // Limpa o formulário após o envio bem-sucedido (apenas no modo de criação, não edição)
      if (!pratoInicial) {
        setForm({ nome: '', preco: '', categoria: '', descricao: '' });
        setNovaCategoria('');
        setUsarNovaCategoria(false); // Resetar a flag também
      }
      
      setErro('');
    } catch (error) {
      console.error(`Erro ao processar formulário:`, error);
      const mensagemErro = ERROR_MESSAGES.ERRO_SALVAR_PRATO;
      setErro(mensagemErro);
      
      // Notifica o componente pai sobre o erro, se callback fornecido
      if (onError) {
        onError(mensagemErro);
      }
    } finally {
      setEnviando(false);
    }
  }, [validarFormulario, form, novaCategoria, usarNovaCategoria, permiteNovaCategoria, onSubmit, pratoInicial, onError]);

  return (
    <div className="space-y-4">
      {/* Campo Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">{FORM_LABELS.NOME_PRATO}</label>
        <input
          id="nome"
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder={PLACEHOLDERS.NOME_PRATO}
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          aria-required="true"
        />
      </div>
      
      {/* Seção Categoria */}
      {permiteNovaCategoria ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="usarNovaCategoria"
              checked={usarNovaCategoria}
              onChange={() => setUsarNovaCategoria(!usarNovaCategoria)}
              className="accent-blue-600"
            />
            <label htmlFor="usarNovaCategoria" className="text-sm">{FORM_LABELS.CADASTRAR_NOVA_CATEGORIA}</label>
          </div>
          
          {usarNovaCategoria ? (
            <div>
              <label htmlFor="novaCategoria" className="block text-sm font-medium text-gray-700 mb-1">{FORM_LABELS.NOVA_CATEGORIA}</label>
              <input
                id="novaCategoria"
                className="w-full border border-gray-300 p-3 rounded-md"
                placeholder={PLACEHOLDERS.NOVA_CATEGORIA}
                value={novaCategoria}
                onChange={e => setNovaCategoria(e.target.value)}
                aria-required="true"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">{FORM_LABELS.CATEGORIA}</label>
              <select
                id="categoria"
                className="w-full border border-gray-300 p-3 rounded-md"
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
                aria-required="true"
              >
                <option value="">{PLACEHOLDERS.SELECIONE_CATEGORIA}</option>
                {categorias.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">{FORM_LABELS.CATEGORIA}</label>
          <select
            id="categoria"
            className="w-full border border-gray-300 p-3 rounded-md"
            value={form.categoria}
            onChange={e => setForm({ ...form, categoria: e.target.value })}
            aria-required="true"
          >
            <option value="">{PLACEHOLDERS.SELECIONE_CATEGORIA}</option>
            {categorias.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}
      
      {/* Campo Descrição */}
      <div>
        <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">{FORM_LABELS.DESCRICAO}</label>
        <textarea
          id="descricao"
          className="w-full border border-gray-300 p-3 rounded-md h-24"
          placeholder={PLACEHOLDERS.DESCRICAO_PRATO}
          value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />
      </div>
      
      {/* Campo Preço */}
      <div>
        <label htmlFor="preco" className="block text-sm font-medium text-gray-700 mb-1">{FORM_LABELS.PRECO}</label>
        <input
          id="preco"
          type="number"
          step="0.01"
          min="0"
          className="w-full border border-gray-300 p-3 rounded-md"
          placeholder={PLACEHOLDERS.PRECO_PRATO}
          value={form.preco}
          onChange={e => setForm({ ...form, preco: e.target.value })}
          aria-required="true"
        />
      </div>
      
      {/* Mensagem de erro */}
      {erro && <p className="text-red-500 text-sm">{erro}</p>}
      
      {/* Botão de envio */}
      <button 
        onClick={handleSubmit} 
        disabled={enviando}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {enviando ? UI_LABELS.SALVANDO : textoBotao}
      </button>
    </div>
  );
} 
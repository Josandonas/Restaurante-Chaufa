/**
 * Testes para o serviço pratoService
 */

import * as pratoService from '@/services/pratoService';
import { db } from '@/lib/firebase';
import { ERROR_MESSAGES, COLLECTIONS, DOCUMENT_FIELDS } from '@/lib/constants';
import type { Prato } from '@/models/Prato';

// Mock do Firebase
jest.mock('@/lib/firebase', () => {
  return {
    db: {
      collection: jest.fn(),
      doc: jest.fn(),
    }
  };
});

describe('pratoService', () => {
  // Mock de funções e retornos do Firebase
  const mockAddDoc = jest.fn().mockResolvedValue({ id: 'novo-prato-id' });
  const mockUpdateDoc = jest.fn().mockResolvedValue(undefined);
  const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
  const mockGetDocs = jest.fn();
  const mockWhere = jest.fn().mockReturnThis();
  const mockQuery = jest.fn().mockReturnThis();
  const mockOnSnapshot = jest.fn();
  const mockWriteBatch = jest.fn(() => ({
    delete: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined)
  }));

  // Dados de teste
  const mockPrato: Prato = {
    id: 'prato-teste-id',
    nome: 'Arroz Chaufa',
    preco: 25.9,
    descricao: 'Prato de arroz tradicional peruano',
    categoria: 'categoria-1',
    imagem: 'url-da-imagem',
    criado_em: new Date(),
    ativo: true
  };

  const mockPratoSemId: Omit<Prato, 'id'> = {
    nome: 'Novo Arroz Chaufa',
    preco: 27.9,
    descricao: 'Descrição do novo prato',
    categoria: 'categoria-1',
    imagem: 'url-da-nova-imagem',
    criado_em: new Date(),
    ativo: true
  };

  // Configuração para os testes
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock das funções do Firebase
    (db.collection as jest.Mock).mockReturnValue({
      add: mockAddDoc,
      doc: jest.fn().mockReturnValue({
        update: mockUpdateDoc,
        delete: mockDeleteDoc,
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockPrato
        })
      }),
      get: mockGetDocs,
      onSnapshot: mockOnSnapshot,
      where: mockWhere
    });

    (db.doc as jest.Mock).mockReturnValue({
      update: mockUpdateDoc,
      delete: mockDeleteDoc
    });

    // Mock das funções do Firebase importadas no serviço
    jest.spyOn(global, 'require').mockImplementation((module) => {
      if (module === 'firebase/firestore') {
        return {
          collection: jest.fn().mockReturnValue({}),
          onSnapshot: mockOnSnapshot,
          deleteDoc: mockDeleteDoc,
          doc: jest.fn().mockReturnValue({}),
          updateDoc: mockUpdateDoc,
          addDoc: mockAddDoc,
          getDocs: mockGetDocs,
          query: mockQuery,
          where: mockWhere,
          writeBatch: mockWriteBatch
        };
      }
      return jest.requireActual(module);
    });
  });

  describe('listenPratos', () => {
    it('deve escutar por mudanças nos pratos ativos', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'prato-1',
              data: () => ({ nome: 'Prato 1', preco: 25.90, ativo: true })
            },
            {
              id: 'prato-2',
              data: () => ({ nome: 'Prato 2', preco: 29.90, ativo: true })
            }
          ]
        };
        
        callback(mockSnapshot);
        return mockUnsubscribe;
      });
      
      const unsubscribe = pratoService.listenPratos(mockCallback);
      
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith(DOCUMENT_FIELDS.ATIVO, '==', true);
      expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'prato-1', nome: 'Prato 1' }),
        expect.objectContaining({ id: 'prato-2', nome: 'Prato 2' })
      ]));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
    
    it('deve tratar erros ao escutar por mudanças', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        errorCallback({ code: 'permission-denied', message: 'Sem permissão' });
        return mockUnsubscribe;
      });
      
      const unsubscribe = pratoService.listenPratos(mockCallback);
      
      expect(mockCallback).toHaveBeenCalledWith([]);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
    
    it('deve retornar função vazia caso ocorra erro ao configurar listener', () => {
      const mockCallback = jest.fn();
      mockQuery.mockImplementation(() => {
        throw new Error('Erro ao configurar query');
      });
      
      const unsubscribe = pratoService.listenPratos(mockCallback);
      
      expect(typeof unsubscribe).toBe('function');
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
  
  describe('listenPratosLixeira', () => {
    it('deve escutar por mudanças nos pratos na lixeira', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      mockOnSnapshot.mockImplementation((query, callback, errorCallback) => {
        const mockSnapshot = {
          docs: [
            {
              id: 'prato-3',
              data: () => ({ nome: 'Prato 3', preco: 32.90, ativo: false })
            }
          ]
        };
        
        callback(mockSnapshot);
        return mockUnsubscribe;
      });
      
      const unsubscribe = pratoService.listenPratosLixeira(mockCallback);
      
      expect(mockQuery).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith(DOCUMENT_FIELDS.ATIVO, '==', false);
      expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'prato-3', nome: 'Prato 3', ativo: false })
      ]));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
  
  describe('moverParaLixeiraPrato', () => {
    it('deve mover um prato para a lixeira', async () => {
      await pratoService.moverParaLixeiraPrato('prato-id');
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { [DOCUMENT_FIELDS.ATIVO]: false }
      );
    });
    
    it('deve lançar erro se falhar ao mover para lixeira', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Erro no Firebase'));
      
      await expect(pratoService.moverParaLixeiraPrato('prato-id'))
        .rejects.toThrow(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
    });
  });
  
  describe('restaurarPrato', () => {
    it('deve restaurar um prato da lixeira', async () => {
      await pratoService.restaurarPrato('prato-id');
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { [DOCUMENT_FIELDS.ATIVO]: true }
      );
    });
    
    it('deve lançar erro se falhar ao restaurar', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Erro no Firebase'));
      
      await expect(pratoService.restaurarPrato('prato-id'))
        .rejects.toThrow('Não foi possível restaurar o prato');
    });
  });
  
  describe('esvaziarLixeiraPratos', () => {
    it('deve esvaziar a lixeira de pratos', async () => {
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      
      mockWriteBatch.mockReturnValue(mockBatch);
      
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        forEach: (callback: Function) => {
          callback({ ref: 'doc-ref-1' });
          callback({ ref: 'doc-ref-2' });
        }
      });
      
      await pratoService.esvaziarLixeiraPratos();
      
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });
    
    it('não deve fazer nada se a lixeira estiver vazia', async () => {
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn()
      };
      
      mockWriteBatch.mockReturnValue(mockBatch);
      
      mockGetDocs.mockResolvedValueOnce({
        empty: true,
        forEach: jest.fn()
      });
      
      await pratoService.esvaziarLixeiraPratos();
      
      expect(mockBatch.delete).not.toHaveBeenCalled();
      expect(mockBatch.commit).not.toHaveBeenCalled();
    });
    
    it('deve lançar erro se falhar ao esvaziar lixeira', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Erro no Firebase'));
      
      await expect(pratoService.esvaziarLixeiraPratos())
        .rejects.toThrow('Não foi possível esvaziar a lixeira');
    });
  });
  
  describe('updatePrato', () => {
    it('deve atualizar os dados de um prato', async () => {
      await pratoService.updatePrato(mockPrato);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        {
          [DOCUMENT_FIELDS.NOME]: mockPrato.nome,
          [DOCUMENT_FIELDS.PRECO]: mockPrato.preco,
          [DOCUMENT_FIELDS.CATEGORIA]: mockPrato.categoria,
          [DOCUMENT_FIELDS.DESCRICAO]: mockPrato.descricao
        }
      );
    });
    
    it('deve lançar erro se falhar ao atualizar prato', async () => {
      mockUpdateDoc.mockRejectedValueOnce(new Error('Erro no Firebase'));
      
      await expect(pratoService.updatePrato(mockPrato))
        .rejects.toThrow(ERROR_MESSAGES.ERRO_EDITAR_PRATO);
    });
  });
  
  describe('removePrato', () => {
    it('deve remover permanentemente um prato', async () => {
      await pratoService.removePrato('prato-id');
      
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
    
    it('deve lançar erro se falhar ao remover prato', async () => {
      mockDeleteDoc.mockRejectedValueOnce(new Error('Erro no Firebase'));
      
      await expect(pratoService.removePrato('prato-id'))
        .rejects.toThrow(ERROR_MESSAGES.ERRO_EXCLUIR_PRATO);
    });
  });
  
  describe('addPrato', () => {
    it('deve adicionar um novo prato', async () => {
      await pratoService.addPrato(mockPratoSemId);
      
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...mockPratoSemId,
          [DOCUMENT_FIELDS.ATIVO]: true
        })
      );
    });
    
    it('deve lançar erro se falhar ao adicionar prato', async () => {
      mockAddDoc.mockRejectedValueOnce(new Error('Erro no Firebase'));
      
      await expect(pratoService.addPrato(mockPratoSemId))
        .rejects.toThrow(ERROR_MESSAGES.ERRO_ADICIONAR_PRATO);
    });
  });
});

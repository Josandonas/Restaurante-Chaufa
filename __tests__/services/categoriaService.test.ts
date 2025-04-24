import { 
  listenCategorias, 
  listenCategoriasLixeira, 
  addCategoria, 
  moverParaLixeiraCategoria, 
  restaurarCategoria, 
  esvaziarLixeiraCategorias 
} from '@/services/categoriaService';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  getDocs, 
  writeBatch, 
  doc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS, DOCUMENT_FIELDS } from '@/lib/constants';

// Mock do Firebase Firestore
jest.mock('firebase/firestore');
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

describe('categoriaService', () => {
  // Dados de mock para testes
  const mockCategorias = [
    { id: '1', nome: 'Categoria 1', ativo: true, criado_em: new Date() },
    { id: '2', nome: 'Categoria 2', ativo: true, criado_em: new Date() }
  ];
  
  const mockCategoriasLixeira = [
    { id: '3', nome: 'Categoria 3', ativo: false, criado_em: new Date() }
  ];
  
  // Configuração inicial antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listenCategorias', () => {
    test('configura o listener e retorna unsubscribe', () => {
      // Mock da função onSnapshot
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);
      (query as jest.Mock).mockReturnValue('queryMock');
      (where as jest.Mock).mockReturnValue('whereMock');
      (collection as jest.Mock).mockReturnValue('collectionMock');
      
      const callback = jest.fn();
      
      // Executar a função
      const unsubscribe = listenCategorias(callback);
      
      // Verificar se foi configurado corretamente
      expect(collection).toHaveBeenCalledWith(db, COLLECTIONS.CATEGORIAS);
      expect(where).toHaveBeenCalledWith(DOCUMENT_FIELDS.ATIVO, '==', true);
      expect(query).toHaveBeenCalledWith('collectionMock', 'whereMock');
      expect(onSnapshot).toHaveBeenCalledTimes(1);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
    
    test('trata erros ao configurar o listener', () => {
      // Simular um erro na configuração
      (query as jest.Mock).mockImplementation(() => {
        throw new Error('Erro ao configurar query');
      });
      
      const callback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Executar a função
      const unsubscribe = listenCategorias(callback);
      
      // Verificar tratamento de erro
      expect(consoleSpy).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      // Limpar mock
      consoleSpy.mockRestore();
    });
  });

  describe('listenCategoriasLixeira', () => {
    test('configura o listener para categorias na lixeira', () => {
      // Mock da função onSnapshot
      const mockUnsubscribe = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(mockUnsubscribe);
      (query as jest.Mock).mockReturnValue('queryMock');
      (where as jest.Mock).mockReturnValue('whereMock');
      (collection as jest.Mock).mockReturnValue('collectionMock');
      
      const callback = jest.fn();
      
      // Executar a função
      const unsubscribe = listenCategoriasLixeira(callback);
      
      // Verificar se foi configurado corretamente
      expect(collection).toHaveBeenCalledWith(db, COLLECTIONS.CATEGORIAS);
      expect(where).toHaveBeenCalledWith(DOCUMENT_FIELDS.ATIVO, '==', false);
      expect(query).toHaveBeenCalledWith('collectionMock', 'whereMock');
      expect(onSnapshot).toHaveBeenCalledTimes(1);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('addCategoria', () => {
    test('adiciona uma nova categoria com sucesso', async () => {
      // Mock da função addDoc para retornar sucesso
      (addDoc as jest.Mock).mockResolvedValue({ id: 'nova-categoria' });
      (collection as jest.Mock).mockReturnValue('collectionMock');
      
      const novaCategoria = {
        nome: 'Nova Categoria',
        criado_em: new Date(),
        ativo: true
      };
      
      // Executar a função
      await addCategoria(novaCategoria);
      
      // Verificar chamadas
      expect(collection).toHaveBeenCalledWith(db, COLLECTIONS.CATEGORIAS);
      expect(addDoc).toHaveBeenCalledWith('collectionMock', novaCategoria);
    });
    
    test('lança erro quando falha ao adicionar categoria', async () => {
      // Mock para simular erro
      const mockError = new Error('Erro ao adicionar documento');
      (addDoc as jest.Mock).mockRejectedValue(mockError);
      (collection as jest.Mock).mockReturnValue('collectionMock');
      
      const novaCategoria = {
        nome: 'Categoria com Erro',
        criado_em: new Date(),
        ativo: true
      };
      
      // Verificar se lança erro
      await expect(addCategoria(novaCategoria)).rejects.toThrow();
    });
  });

  describe('moverParaLixeiraCategoria', () => {
    test('move categoria para lixeira com sucesso', async () => {
      // Mocks
      (doc as jest.Mock).mockReturnValue('docRef');
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      
      // Executar a função
      await moverParaLixeiraCategoria('1');
      
      // Verificar chamadas
      expect(doc).toHaveBeenCalledWith(db, COLLECTIONS.CATEGORIAS, '1');
      expect(updateDoc).toHaveBeenCalledWith('docRef', { [DOCUMENT_FIELDS.ATIVO]: false });
    });
    
    test('lança erro quando falha ao mover para lixeira', async () => {
      // Mock para simular erro
      const mockError = new Error('Erro ao atualizar documento');
      (doc as jest.Mock).mockReturnValue('docRef');
      (updateDoc as jest.Mock).mockRejectedValue(mockError);
      
      // Verificar se lança erro
      await expect(moverParaLixeiraCategoria('1')).rejects.toThrow();
    });
  });

  describe('restaurarCategoria', () => {
    test('restaura categoria da lixeira com sucesso', async () => {
      // Mocks
      (doc as jest.Mock).mockReturnValue('docRef');
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      
      // Executar a função
      await restaurarCategoria('3');
      
      // Verificar chamadas
      expect(doc).toHaveBeenCalledWith(db, COLLECTIONS.CATEGORIAS, '3');
      expect(updateDoc).toHaveBeenCalledWith('docRef', { [DOCUMENT_FIELDS.ATIVO]: true });
    });
  });

  describe('esvaziarLixeiraCategorias', () => {
    test('esvazia a lixeira de categorias com sucesso', async () => {
      // Mock para simular documentos na lixeira
      const mockSnapshot = {
        empty: false,
        forEach: jest.fn(callback => {
          // Simula iterar sobre documentos
          mockCategoriasLixeira.forEach(cat => {
            callback({ ref: `docRef-${cat.id}` });
          });
        })
      };
      
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };
      
      // Configurar mocks
      (query as jest.Mock).mockReturnValue('queryMock');
      (where as jest.Mock).mockReturnValue('whereMock');
      (collection as jest.Mock).mockReturnValue('collectionMock');
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      (writeBatch as jest.Mock).mockReturnValue(mockBatch);
      
      // Executar a função
      await esvaziarLixeiraCategorias();
      
      // Verificar chamadas
      expect(collection).toHaveBeenCalledWith(db, COLLECTIONS.CATEGORIAS);
      expect(where).toHaveBeenCalledWith(DOCUMENT_FIELDS.ATIVO, '==', false);
      expect(query).toHaveBeenCalledWith('collectionMock', 'whereMock');
      expect(getDocs).toHaveBeenCalledWith('queryMock');
      expect(writeBatch).toHaveBeenCalledWith(db);
      expect(mockBatch.delete).toHaveBeenCalledTimes(mockCategoriasLixeira.length);
      expect(mockBatch.commit).toHaveBeenCalledTimes(1);
    });
    
    test('não faz nada quando a lixeira está vazia', async () => {
      // Mock para simular lixeira vazia
      const mockSnapshot = {
        empty: true,
        forEach: jest.fn()
      };
      
      // Configurar mocks
      (query as jest.Mock).mockReturnValue('queryMock');
      (where as jest.Mock).mockReturnValue('whereMock');
      (collection as jest.Mock).mockReturnValue('collectionMock');
      (getDocs as jest.Mock).mockResolvedValue(mockSnapshot);
      
      // Executar a função
      await esvaziarLixeiraCategorias();
      
      // Verificar que não tentou criar um batch
      expect(writeBatch).not.toHaveBeenCalled();
      expect(mockSnapshot.forEach).not.toHaveBeenCalled();
    });
  });
});

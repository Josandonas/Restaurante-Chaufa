-- ============================================
-- Procedure: Atualizar Preços BRL baseado na Taxa de Câmbio
-- ============================================
-- Esta procedure atualiza todos os preços em BRL (preco_brl) 
-- baseando-se nos preços em BOB (preco_bob) e na taxa de câmbio configurada.
-- A conversão é feita centavo por centavo para máxima precisão.
-- ============================================

USE cardapio_db;

DROP PROCEDURE IF EXISTS atualizar_precos_brl;

CREATE PROCEDURE atualizar_precos_brl()
BEGIN
    DECLARE taxa_cambio DECIMAL(10, 6);
    DECLARE registros_atualizados INT DEFAULT 0;
    
    -- Buscar a taxa de câmbio atual
    SELECT CAST(valor AS DECIMAL(10, 6)) INTO taxa_cambio
    FROM configuracoes
    WHERE chave = 'taxa_cambio_bob_brl'
    LIMIT 1;
    
    -- Verificar se a taxa foi encontrada
    IF taxa_cambio IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Taxa de câmbio não encontrada na tabela configuracoes';
    END IF;
    
    -- Atualizar todos os preços BRL baseado nos preços BOB
    -- Divide o preço BOB pela taxa de câmbio (quantos reais custam 1 boliviano)
    -- ROUND garante precisão de 2 casas decimais (centavos)
    UPDATE pratos
    SET preco_brl = ROUND(preco_bob / taxa_cambio, 2),
        atualizado_em = CURRENT_TIMESTAMP;
    
    -- Contar registros atualizados
    SET registros_atualizados = ROW_COUNT();
    
    -- Retornar mensagem de sucesso
    SELECT 
        registros_atualizados AS pratos_atualizados,
        taxa_cambio AS taxa_aplicada,
        CONCAT('Preços atualizados com sucesso! Taxa: 1 BOB = ', taxa_cambio, ' BRL') AS mensagem;
        
END;

-- ============================================
-- Procedure: Atualizar Taxa de Câmbio
-- ============================================
-- Esta procedure atualiza a taxa de câmbio e opcionalmente
-- recalcula todos os preços em BRL automaticamente
-- ============================================

DROP PROCEDURE IF EXISTS atualizar_taxa_cambio;

CREATE PROCEDURE atualizar_taxa_cambio(
    IN nova_taxa DECIMAL(10, 6),
    IN recalcular_precos BOOLEAN
)
BEGIN
    DECLARE taxa_antiga DECIMAL(10, 6);
    
    -- Validar que a taxa é positiva
    IF nova_taxa <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Taxa de câmbio deve ser maior que zero';
    END IF;
    
    -- Buscar taxa antiga
    SELECT CAST(valor AS DECIMAL(10, 6)) INTO taxa_antiga
    FROM configuracoes
    WHERE chave = 'taxa_cambio_bob_brl';
    
    -- Atualizar a taxa de câmbio
    UPDATE configuracoes
    SET valor = CAST(nova_taxa AS CHAR),
        atualizado_em = CURRENT_TIMESTAMP
    WHERE chave = 'taxa_cambio_bob_brl';
    
    -- Se solicitado, recalcular todos os preços
    IF recalcular_precos = TRUE THEN
        CALL atualizar_precos_brl();
    END IF;
    
    -- Retornar resultado
    SELECT 
        taxa_antiga AS taxa_anterior,
        nova_taxa AS taxa_nova,
        recalcular_precos AS precos_recalculados,
        'Taxa de câmbio atualizada com sucesso!' AS mensagem;
        
END;

-- ============================================
-- Procedure: Obter Taxa de Câmbio Atual
-- ============================================

DROP PROCEDURE IF EXISTS obter_taxa_cambio;

CREATE PROCEDURE obter_taxa_cambio()
BEGIN
    SELECT 
        CAST(valor AS DECIMAL(10, 6)) AS taxa_cambio,
        atualizado_em AS ultima_atualizacao
    FROM configuracoes
    WHERE chave = 'taxa_cambio_bob_brl'
    LIMIT 1;
END;

-- ============================================
-- Exemplos de uso:
-- ============================================
-- 
-- 1. Obter taxa atual:
--    CALL obter_taxa_cambio();
--
-- 2. Atualizar taxa sem recalcular preços:
--    CALL atualizar_taxa_cambio(0.75, FALSE);
--
-- 3. Atualizar taxa E recalcular todos os preços:
--    CALL atualizar_taxa_cambio(0.75, TRUE);
--
-- 4. Recalcular preços com a taxa atual:
--    CALL atualizar_precos_brl();
-- ============================================

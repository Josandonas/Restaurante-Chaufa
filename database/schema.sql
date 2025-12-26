-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS cardapio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cardapio_db;

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    foto_perfil VARCHAR(500),
    remember_token VARCHAR(255),
    token_expira_em TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_remember_token (remember_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_pt VARCHAR(100) NOT NULL,
    nome_es VARCHAR(100) NOT NULL,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categorias_ativo (ativo),
    INDEX idx_categorias_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de pratos
CREATE TABLE IF NOT EXISTS pratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_pt VARCHAR(255) NOT NULL,
    nome_es VARCHAR(255) NOT NULL,
    descricao_pt TEXT,
    descricao_es TEXT,
    preco_brl DECIMAL(10, 2) NOT NULL,
    preco_bob DECIMAL(10, 2) NOT NULL,
    categoria_id INT DEFAULT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    destaque BOOLEAN DEFAULT FALSE,
    imagem_url VARCHAR(500),
    ordem INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo),
    INDEX idx_destaque (destaque),
    INDEX idx_ordem (ordem),
    INDEX idx_pratos_categoria (categoria_id),
    CONSTRAINT fk_pratos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

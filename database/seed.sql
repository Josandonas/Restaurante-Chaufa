-- Dados de exemplo para testes
USE cardapio_db;

-- Categorias padrão
INSERT INTO categorias (nome_pt, nome_es, ordem, ativo) VALUES
('Chaufas (Arroz Chaufa)', 'Chaufas', 1, TRUE),
('Aeroportos', 'Aeropuertos', 2, TRUE),
('Macarrão (Tallarines)', 'Tallarines', 3, TRUE),
('Verduras', 'Verduras', 4, TRUE),
('Combinados', 'Combinados', 5, TRUE),
('Pratos Especiais Salgados e Doces', 'Platos Especiales Salados y Dulces', 6, TRUE),
('Sopas', 'Sopas', 7, TRUE),
('Wantán frito', 'Wantán frito', 8, TRUE),
('Pratos Caseiros', 'Platos Criollos', 9, TRUE),
('Tortilhas', 'Tortillas', 10, TRUE),
('Bebidas', 'Bebidas', 11, TRUE);

-- Pratos de lista (sem destaque)
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Arroz Chaufa de Frango', 'Arroz Chaufa de Pollo', 'Arroz frito com frango, legumes e molho especial', 'Arroz frito con pollo, verduras y salsa especial', 32.00, 45.00, 1, FALSE, TRUE),
('Arroz Chaufa de Carne', 'Arroz Chaufa de Carne', 'Arroz frito com carne bovina, legumes e molho especial', 'Arroz frito con carne de res, verduras y salsa especial', 35.00, 50.00, 1, FALSE, TRUE),
('Arroz Chaufa Misto', 'Arroz Chaufa Mixto', 'Arroz frito com frango, carne e camarão', 'Arroz frito con pollo, carne y camarones', 42.00, 60.00, 1, FALSE, TRUE),
('Tallarín Saltado de Frango', 'Tallarín Saltado de Pollo', 'Macarrão salteado com frango e legumes', 'Fideos salteados con pollo y verduras', 30.00, 42.00, 3, FALSE, TRUE),
('Tallarín Saltado de Carne', 'Tallarín Saltado de Carne', 'Macarrão salteado com carne bovina e legumes', 'Fideos salteados con carne de res y verduras', 33.00, 47.00, 3, FALSE, TRUE),
('Lomo Saltado', 'Lomo Saltado', 'Carne bovina salteada com cebola, tomate e batatas fritas', 'Carne de res salteada con cebolla, tomate y papas fritas', 45.00, 65.00, 5, FALSE, TRUE),
('Aeropuerto', 'Aeropuerto', 'Combinação de arroz chaufa e tallarín saltado', 'Combinación de arroz chaufa y tallarín saltado', 38.00, 55.00, 2, FALSE, TRUE),
('Wantan Frito', 'Wantan Frito', 'Pastel chinês frito recheado', 'Pastel chino frito relleno', 25.00, 35.00, 8, FALSE, TRUE);

-- Pratos em destaque (com imagem - você precisará adicionar as imagens depois)
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo, ordem, imagem_url) VALUES
('Chaufa Especial da Casa', 'Chaufa Especial de la Casa', 'Nosso arroz chaufa premium com frutos do mar', 'Nuestro arroz chaufa premium con mariscos', 55.00, 80.00, 1, TRUE, TRUE, 1, '/uploads/chaufa-especial.jpg'),
('Combinado Executivo', 'Combinado Ejecutivo', 'Arroz chaufa + tallarín + lomo saltado', 'Arroz chaufa + tallarín + lomo saltado', 48.00, 70.00, 5, TRUE, TRUE, 2, '/uploads/combinado.jpg');

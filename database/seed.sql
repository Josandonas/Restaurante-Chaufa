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

-- *** CHAUSFAS (Categoria ID: 1) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Chaufa com frango', 'Chaufa c/. pollo', '', '', 30.00, 40.00, 1, FALSE, TRUE),
('Chaufa com porco', 'Chaufa c/. chancho', '', '', 30.00, 40.00, 1, FALSE, TRUE),
('Chaufa com carne bovina', 'Chaufa c/. carne de res', '', '', 30.00, 40.00, 1, FALSE, TRUE),
('Chaufa com camarões', 'Chaufa c/. langostinos', '', '', 48.75, 65.00, 1, FALSE, TRUE),
('Chaufa com frango + tortillas', 'Chaufa c/. pollo + tortillas', '', '', 37.50, 50.00, 1, FALSE, TRUE),
('Chaufa com porco + tortillas', 'Chaufa c/. chancho + tortillas', '', '', 37.50, 50.00, 1, FALSE, TRUE),
('Chaufa Com frango ao estilo pobre com banana frita + ovo', 'Chaufa c/. pollo alo pobre, platano frito + huevo', '', '', 37.50, 50.00, 1, FALSE, TRUE),
('Chaufa Com porco ao estilo pobre com banana frita + ovo', 'Chaufa c/. chancho alo pobre, platano frito + huevo', '', '', 37.50, 50.00, 1, FALSE, TRUE),
('Chaufa misto (porco e frango)', 'Chaufa mixto chancho y pollo', '', '', 45.00, 60.00, 1, FALSE, TRUE),
('Chaufa especial (frango, porco, camarões)', 'Chaufa especial pollo, chancho, langostinos', '', '', 52.50, 70.00, 1, FALSE, TRUE),
('Chaufa com asinhas', 'Chaufa c/. alitas', '', '', 37.50, 50.00, 1, FALSE, TRUE),
('Chaufa na brasa', 'Chaufa a la brasa', '', '', 45.00, 60.00, 1, FALSE, TRUE),
('Chaufa na brasa', 'Chaufa a la brasa', '', '', 52.50, 70.00, 1, FALSE, TRUE),
('Chaufa com lombo salteado', 'Chaufa con lomo salteado', '', '', 52.50, 70.00, 1, FALSE, TRUE),
('Arroz chaufa (frango / carne / peixe) - Pequeno', 'Arroz chaufa pollo / carne / pescado', '', '', 30.00, 40.00, 1, FALSE, TRUE),
('Arroz chaufa (frango / carne / peixe) - Grande', 'Arroz chaufa pollo / carne / pescado', '', '', 45.00, 60.00, 1, FALSE, TRUE);



-- *** AEROPUERTOS (Categoria ID: 2) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Aeroporto com frango', 'Aeropuerto c/. pollo', '', '', 37.50, 50.00, 2, FALSE, TRUE),
('Aeroporto com porco', 'Aeropuerto c/. chancho', '', '', 45.00, 60.00, 2, FALSE, TRUE),
('Aeroporto com carne bovina', 'Aeropuerto c/. carne de res', '', '', 45.00, 60.00, 2, FALSE, TRUE),
('Aeroporto misto (porco e frango)', 'Aeropuerto mixto chancho y pollo', '', '', 52.50, 70.00, 2, FALSE, TRUE),
('Aeroporto especial (porco, frango, camarões)', 'Aeropuerto especial chancho, pollo, langostinos', '', '', 60.00, 80.00, 2, FALSE, TRUE);

-- *** TALLARINES (Macarrão) (Categoria ID: 3) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Tallarim com frango', 'Tallarin c/. pollo', '', '', 37.50, 50.00, 3, FALSE, TRUE),
('Tallarim com porco', 'Tallarin c/. chancho', '', '', 37.50, 50.00, 3, FALSE, TRUE),
('Tallarim com carne bovina', 'Tallarin c/. carne de res', '', '', 37.50, 50.00, 3, FALSE, TRUE),
('Tallarim com camarões', 'Tallarin c/. langostinos', '', '', 45.00, 60.00, 3, FALSE, TRUE),
('Tallarim misto (frango e porco)', 'Tallarin mixto pollo y chancho', '', '', 45.00, 60.00, 3, FALSE, TRUE),
('Tallarim especial (frango, porco, camarões)', 'Tallarin especial pollo, chancho, langostinos', '', '', 60.00, 80.00, 3, FALSE, TRUE),
('Tallarim salteado (frango / carne)', 'Tallarin salteado pollo / carne', '', '', 30.00, 40.00, 3, FALSE, TRUE);

-- *** VERDURAS (Vegetais) (Categoria ID: 4) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Frango com vegetais', 'Pollo c/. verduras', '', '', 37.50, 50.00, 4, FALSE, TRUE),
('Porco com vegetais', 'Chacho c/. verduras', '', '', 37.50, 50.00, 4, FALSE, TRUE),
('Carne bovina com vegetais', 'Carne de res c/. verduras', '', '', 37.50, 50.00, 4, FALSE, TRUE),
('Camarões com vegetais', 'Langostinos c/. verduras', '', '', 45.00, 60.00, 4, FALSE, TRUE),
('Misto com vegetais, frango e porco', 'Mixto c/. verduras, pollo, chancho', '', '', 45.00, 60.00, 4, FALSE, TRUE),
('Especial com vegetais, frango, porco, camarões', 'Especial c/. verduras, pollo, chancho, langostinos', '', '', 60.00, 80.00, 4, FALSE, TRUE);

-- *** COMBINADOS (Categoria ID: 5) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Combinado com frango', 'Combinado c/. pollo', '', '', 52.50, 70.00, 5, FALSE, TRUE),
('Combinado com porco', 'Combinado c/. chancho', '', '', 52.50, 70.00, 5, FALSE, TRUE),
('Combinado com carne bovina', 'Combinado c/. carne de res', '', '', 52.50, 70.00, 5, FALSE, TRUE),
('Combinado com camarões', 'Combinado c/. langostinos', '', '', 60.00, 80.00, 5, FALSE, TRUE),
('Combinado misto (frango e porco)', 'Combinado c/. mixto pollo y choncho', '', '', 60.00, 80.00, 5, FALSE, TRUE);

-- *** PLATOS ESPECIAIS SALGADOS E DOCES (Categoria ID: 6) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Frango enrolado + chaufa', 'Pollo enrrollado + chaufa', '', '', 52.50, 70.00, 6, FALSE, TRUE),
('Chijaukay + chaufa', 'Chijaukay + chaufa', '', '', 52.50, 70.00, 6, FALSE, TRUE),
('Tipakay + chaufa doce', 'Tipakay + chaufa dulce', '', '', 60.00, 80.00, 6, FALSE, TRUE),
('Porco com tamarindo + chaufa doce', 'Chancho c/. tamarindo + chaufa dulce', '', '', 60.00, 80.00, 6, FALSE, TRUE),
('Frango com abacaxi + chaufa doce', 'Pollo c/. piña + chaufa dulce', '', '', 60.00, 80.00, 6, FALSE, TRUE),
('Kamlu wantan + chaufa doce', 'Kamlu wantan + chaufa dulce', '', '', 60.00, 80.00, 6, FALSE, TRUE),
('Kameli-wantarn & chaufa doce', 'Kameli-wantarn & chaufa dulce', '', '', 60.00, 80.00, 6, FALSE, TRUE),
('Porco com abacaxi + chaufa doce', 'Chancho c/. piña + chaufa dulce', '', '', 60.00, 80.00, 6, FALSE, TRUE);

-- *** SOPAS (Categoria ID: 7) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Sopa de wantan especial', 'Sopa de wantan especial', '', '', 30.00, 40.00, 7, FALSE, TRUE),
('Sopa fuchifu', 'Sopa fuchifu', '', '', 30.00, 40.00, 7, FALSE, TRUE),
('Sopa de Gengibre', 'Sopa de kion', '', '', 30.00, 40.00, 7, FALSE, TRUE),
('Sopa de frango', 'Sopa de pollo', '', '', 30.00, 40.00, 7, FALSE, TRUE),
('Sopa de pato', 'Sopa de pato', '', '', 37.50, 50.00, 7, FALSE, TRUE);

-- *** WATAN FRITO (Wantán frito) (Categoria ID: 8) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('12 wantan fritos especiais', '12 wantan fritos especiales', '', '', 22.50, 30.00, 8, FALSE, TRUE),
('6 wantan fritos especiais', '6 wantan fritos especiales', '', '', 15.00, 20.00, 8, FALSE, TRUE),
('12 wantan fritos simples', '12 wantan fritos simples', '', '', 15.00, 20.00, 8, FALSE, TRUE),
('6 wantan fritos simples', '6 wantan frios simples', '', '', 11.25, 15.00, 8, FALSE, TRUE);

-- *** PLATOS CRIOLLOS / OUTROS PRATOS PRINCIPAIS (Pratos Caseiros) (Categoria ID: 9) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Lombo salteado de carne bovina', 'Lomo saltado de res', '', '', 33.75, 45.00, 9, FALSE, TRUE),
('Frango salteado', 'Pollo saltado', '', '', 33.75, 45.00, 9, FALSE, TRUE),
('Macarrão salteado de carne bovina', 'Tallarin saltado de res', '', '', 33.75, 45.00, 9, FALSE, TRUE),
('Macarrão salteado de frango', 'Tallarin saltado de pollo', '', '', 33.75, 45.00, 9, FALSE, TRUE),
('Peito de frango na chapa', 'Pechuga ala plancha', '', '', 41.25, 55.00, 9, FALSE, TRUE),
('Chicharrón de frango + batatas fritas', 'Chicharron de pollo + papas fritas', '', '', 41.25, 55.00, 9, FALSE, TRUE),
('Lombo salteado ao estilo pobre com banana frita + ovo', 'Lomo saltado alo pobre, platano frito + huevo', '', '', 48.75, 65.00, 9, FALSE, TRUE),
('Frango salteado ao estilo pobre com banana frita + ovo', 'Pollo saltado alo pobre, platano frito + huevo', '', '', 48.75, 65.00, 9, FALSE, TRUE),
('Lombo salteado', 'Lomo salteado', '', '', 30.00, 40.00, 9, FALSE, TRUE),
('Chicharrón de camarão', 'Chicharron de camarones', '', '', 112.50, 150.00, 9, FALSE, TRUE),
('Parihuela (sopa) de peixe / mista', 'Parihuela de pescado / mixto', '', '', 75.00, 100.00, 9, FALSE, TRUE),
('Papa a la huancaina (Batata ao molho de queijo)', 'Papa a la huancaina', '', '', 30.00, 40.00, 9, FALSE, TRUE),
('Frango na brasa', 'Pollo a la brassa', '', '', 22.50, 30.00, 9, FALSE, TRUE),
('Leite de tigre', 'Leche de tigre', '', '', 52.50, 70.00, 9, FALSE, TRUE),
('Arroz com frutos do mar', 'Arroz c/n mariscos', '', '', 67.50, 90.00, 9, FALSE, TRUE),
('Ceviche de peixe', 'Ceviche de pescado', '', '', 60.00, 80.00, 9, FALSE, TRUE),
('Ceviche misto', 'Ceviche mixto', '', '', 67.50, 90.00, 9, FALSE, TRUE),
('Chicharrón de peixe', 'Chicharrón de pescado', '', '', 60.00, 80.00, 9, FALSE, TRUE);

-- *** TORTILLAS (Categoria ID: 10) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Tortilla com frango', 'Tortilla c/. pollo', '', '', 15.00, 20.00, 10, FALSE, TRUE),
('Tortilla com porco', 'Tortilla c/. chancho', '', '', 18.75, 25.00, 10, FALSE, TRUE),
('Tortilla com camarões', 'Tortilla c/. langostinos', '', '', 26.25, 35.00, 10, FALSE, TRUE),
('Tortilla com vegetais', 'Tortilla c/. verduras', '', '', 15.00, 20.00, 10, FALSE, TRUE);

-- *** BEBIDAS (Categoria ID: 11) ***
INSERT INTO pratos (nome_pt, nome_es, descricao_pt, descricao_es, preco_brl, preco_bob, categoria_id, destaque, ativo) VALUES
('Sucos', 'Refrescos', '', '', 0.00, 0.00, 11, FALSE, TRUE),
('Refrigerantes', 'Sodas', '', '', 0.00, 0.00, 11, FALSE, TRUE),
('Cerveja', 'Cerveza', '', '', 0.00, 0.00, 11, FALSE, TRUE);

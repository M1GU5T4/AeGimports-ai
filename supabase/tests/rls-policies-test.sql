-- Script para testar as políticas RLS implementadas

-- Configuração inicial
-- Primeiro, vamos criar dois usuários de teste

-- Usuário 1 (usuário normal)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid, 
  'usuario1@teste.com',
  '{"full_name": "Usuário de Teste 1", "phone": "+5511999999991"}'::jsonb
);

-- Usuário 2 (usuário normal)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid, 
  'usuario2@teste.com',
  '{"full_name": "Usuário de Teste 2", "phone": "+5511999999992"}'::jsonb
);

-- Usuário 3 (administrador)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  '33333333-3333-3333-3333-333333333333'::uuid, 
  'admin@teste.com',
  '{"full_name": "Administrador de Teste", "phone": "+5511999999993"}'::jsonb
);

-- Adicionar o usuário 3 como administrador
INSERT INTO public.admin_users (user_id)
VALUES ('33333333-3333-3333-3333-333333333333'::uuid);

-- Criar alguns produtos para teste
INSERT INTO public.products (id, name, price, team, season, is_special_edition, is_active, league_id, nationality_id)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Camisa Time A', 199.90, 'Time A', '2023', false, true, 
 (SELECT id FROM public.leagues LIMIT 1), 
 (SELECT id FROM public.nationalities LIMIT 1)),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Camisa Time B', 249.90, 'Time B', '2023', true, true, 
 (SELECT id FROM public.leagues LIMIT 1 OFFSET 1), 
 (SELECT id FROM public.nationalities LIMIT 1 OFFSET 1)),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'Camisa Time C', 179.90, 'Time C', '2023', false, false, 
 (SELECT id FROM public.leagues LIMIT 1 OFFSET 2), 
 (SELECT id FROM public.nationalities LIMIT 1 OFFSET 2));

-- Adicionar tamanhos aos produtos
INSERT INTO public.product_sizes (product_id, size_id, stock_quantity)
VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, (SELECT id FROM public.sizes WHERE name = 'M'), 10),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, (SELECT id FROM public.sizes WHERE name = 'L'), 5),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, (SELECT id FROM public.sizes WHERE name = 'S'), 8),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, (SELECT id FROM public.sizes WHERE name = 'M'), 12),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, (SELECT id FROM public.sizes WHERE name = 'XL'), 3);

-- Adicionar notas aos produtos
INSERT INTO public.product_notes (user_id, product_id, note)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'Nota do usuário 1 para o produto A'),
('22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'Nota do usuário 2 para o produto B');

-- Adicionar itens ao carrinho
INSERT INTO public.cart_items (user_id, product_id, size_id, quantity)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 
 (SELECT id FROM public.sizes WHERE name = 'M'), 1),
('22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 
 (SELECT id FROM public.sizes WHERE name = 'S'), 2);

-- Criar pedidos
INSERT INTO public.orders (id, user_id, status, total_amount, shipping_address)
VALUES 
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'delivered', 199.90, 'Endereço de Entrega 1'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'pending', 249.90, 'Endereço de Entrega 2');

-- Adicionar itens aos pedidos
INSERT INTO public.order_items (order_id, product_id, size_id, quantity, unit_price)
VALUES 
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 
 (SELECT id FROM public.sizes WHERE name = 'M'), 1, 199.90),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 
 (SELECT id FROM public.sizes WHERE name = 'S'), 1, 249.90);

-- Adicionar avaliações
INSERT INTO public.product_reviews (user_id, product_id, rating, comment)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 5, 'Ótimo produto!'),
('22222222-2222-2222-2222-222222222222'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 4, 'Bom produto, mas poderia ser melhor');

-- Adicionar favoritos
INSERT INTO public.favorites (user_id, product_id)
VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid),
('22222222-2222-2222-2222-222222222222'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid);

-- Agora vamos testar as políticas RLS

-- 1. Teste como usuário 1

-- Definir o usuário atual como usuário 1
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" TO '11111111-1111-1111-1111-111111111111';

-- Teste de visualização de perfil
SELECT * FROM public.profiles;
-- Deve retornar apenas o perfil do usuário 1

-- Teste de visualização de produtos
SELECT * FROM public.products;
-- Deve retornar apenas produtos ativos (A e B, não C)

-- Teste de visualização de notas
SELECT * FROM public.product_notes;
-- Deve retornar apenas as notas do usuário 1

-- Teste de visualização de carrinho
SELECT * FROM public.cart_items;
-- Deve retornar apenas os itens do carrinho do usuário 1

-- Teste de visualização de pedidos
SELECT * FROM public.orders;
-- Deve retornar apenas os pedidos do usuário 1

-- Teste de visualização de itens de pedido
SELECT * FROM public.order_items;
-- Deve retornar apenas os itens dos pedidos do usuário 1

-- Teste de visualização de avaliações
SELECT * FROM public.product_reviews;
-- Deve retornar todas as avaliações (política permite visualização por todos)

-- Teste de visualização de favoritos
SELECT * FROM public.favorites;
-- Deve retornar apenas os favoritos do usuário 1

-- Teste de visualização de administradores
SELECT * FROM public.admin_users;
-- Não deve retornar nada (usuário 1 não é admin)

-- 2. Teste como usuário 2

-- Definir o usuário atual como usuário 2
SET LOCAL "request.jwt.claim.sub" TO '22222222-2222-2222-2222-222222222222';

-- Teste de visualização de perfil
SELECT * FROM public.profiles;
-- Deve retornar apenas o perfil do usuário 2

-- Teste de visualização de notas
SELECT * FROM public.product_notes;
-- Deve retornar apenas as notas do usuário 2

-- 3. Teste como administrador

-- Definir o usuário atual como administrador
SET LOCAL "request.jwt.claim.sub" TO '33333333-3333-3333-3333-333333333333';

-- Teste de visualização de perfis
SELECT * FROM public.profiles;
-- Deve retornar todos os perfis

-- Teste de visualização de produtos
SELECT * FROM public.products;
-- Deve retornar todos os produtos, incluindo inativos

-- Teste de visualização de notas
SELECT * FROM public.product_notes;
-- Deve retornar todas as notas

-- Teste de visualização de carrinho
SELECT * FROM public.cart_items;
-- Deve retornar todos os itens de carrinho

-- Teste de visualização de pedidos
SELECT * FROM public.orders;
-- Deve retornar todos os pedidos

-- Teste de visualização de administradores
SELECT * FROM public.admin_users;
-- Deve retornar todos os administradores

-- Limpar os dados de teste
-- Comentado para permitir verificação manual dos resultados
/*
DELETE FROM public.favorites WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.product_reviews WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.order_items WHERE order_id IN ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');
DELETE FROM public.orders WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.cart_items WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.product_notes WHERE user_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
DELETE FROM public.product_sizes WHERE product_id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc');
DELETE FROM public.products WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc');
DELETE FROM public.admin_users WHERE user_id = '33333333-3333-3333-3333-333333333333';
DELETE FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333');
*/
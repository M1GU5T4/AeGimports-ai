# Migrações do Banco de Dados JerseyForge AI

## Visão Geral

Este diretório contém as migrações do banco de dados para o sistema JerseyForge AI. As migrações são aplicadas automaticamente pelo Supabase quando o projeto é implantado ou quando são executadas manualmente.

## Novas Políticas RLS Implementadas

Foram implementadas as seguintes políticas de Row Level Security (RLS):

### 1. Políticas para Administradores (20250730000000-implement-admin-rls-policies.sql)

- Criação da tabela `admin_users` para gerenciar administradores
- Função `is_admin()` para verificar se um usuário é administrador
- Políticas RLS para permitir que administradores gerenciem todas as tabelas do sistema
- Função `add_first_admin()` para adicionar o primeiro administrador

### 2. Políticas para Pedidos e Carrinho (20250730000001-implement-orders-rls-policies.sql)

- Criação das tabelas `cart_items`, `orders` e `order_items`
- Políticas RLS para permitir que usuários gerenciem seus próprios carrinhos e pedidos
- Políticas para administradores visualizarem e gerenciarem todos os pedidos
- Funções para calcular totais de pedidos e criar pedidos a partir do carrinho

### 3. Políticas para Avaliações de Produtos (20250730000002-implement-reviews-rls-policies.sql)

- Criação da tabela `product_reviews`
- Políticas RLS para permitir que usuários avaliem produtos que compraram
- Função para calcular e atualizar a classificação média dos produtos
- Políticas para administradores gerenciarem todas as avaliações

### 4. Políticas para Favoritos (20250730000003-implement-favorites-rls-policies.sql)

- Criação da tabela `favorites`
- Políticas RLS para permitir que usuários gerenciem seus próprios favoritos
- Funções para adicionar/remover favoritos e verificar status
- Atualização automática da contagem de favoritos por produto

## Como Aplicar as Migrações

As migrações são aplicadas automaticamente pelo Supabase quando o projeto é implantado. No entanto, você pode aplicá-las manualmente usando o CLI do Supabase:

```bash
supabase db push
```

## Configurando o Primeiro Administrador

Após aplicar as migrações, você precisa configurar o primeiro administrador. Isso pode ser feito executando a função `add_first_admin` no SQL Editor do Supabase:

```sql
SELECT add_first_admin('email_do_administrador@exemplo.com');
```

Substitua `'email_do_administrador@exemplo.com'` pelo email do usuário que você deseja tornar administrador. Este usuário já deve estar registrado no sistema.

## Verificando as Políticas RLS

Você pode verificar se as políticas RLS estão funcionando corretamente usando o SQL Editor do Supabase para executar as seguintes consultas:

```sql
-- Verificar políticas RLS em uma tabela específica
SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';

-- Verificar todas as políticas RLS no esquema public
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

## Segurança

Todas as funções que interagem com o banco de dados foram implementadas com `SECURITY DEFINER` e `SET search_path = public` para evitar ataques de injeção SQL e garantir que as funções sejam executadas com as permissões corretas.

## Troubleshooting

Se você encontrar problemas ao aplicar as migrações, verifique os logs do Supabase para obter mais informações sobre os erros. Você também pode executar as migrações manualmente no SQL Editor do Supabase, uma por uma, para identificar qual migração está causando o problema.
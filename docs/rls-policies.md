# Políticas de Row Level Security (RLS) no JerseyForge AI

## Introdução

Este documento descreve as políticas de Row Level Security (RLS) implementadas no banco de dados do JerseyForge AI. O RLS é um recurso de segurança do PostgreSQL que permite controlar quais linhas de uma tabela podem ser acessadas por quais usuários, garantindo que os dados sejam protegidos e que cada usuário só possa acessar os dados aos quais tem permissão.

## Conceitos Básicos

### O que é RLS?

Row Level Security (RLS) é um mecanismo de segurança que permite definir políticas de acesso a nível de linha em tabelas do banco de dados. Isso significa que, dependendo do usuário que está fazendo a consulta, diferentes linhas da mesma tabela podem ser visíveis ou não.

### Como o RLS funciona no Supabase?

No Supabase, o RLS é implementado usando políticas do PostgreSQL. Cada política define uma condição que deve ser satisfeita para que um usuário possa realizar uma operação específica (SELECT, INSERT, UPDATE, DELETE) em uma tabela.

O Supabase utiliza a função `auth.uid()` para obter o ID do usuário autenticado, permitindo criar políticas baseadas na identidade do usuário.

## Políticas RLS Implementadas

### 1. Políticas para Tabelas Básicas

#### Profiles

- **Visualização**: Usuários podem ver apenas seu próprio perfil
- **Inserção**: Usuários podem inserir apenas seu próprio perfil
- **Atualização**: Usuários podem atualizar apenas seu próprio perfil
- **Administradores**: Podem ver todos os perfis

#### Leagues, Nationalities, Sizes

- **Visualização**: Todos os usuários podem ver
- **Inserção/Atualização/Exclusão**: Apenas administradores

#### Products

- **Visualização**: Todos os usuários podem ver produtos ativos
- **Inserção/Atualização/Exclusão**: Apenas administradores
- **Administradores**: Podem ver todos os produtos (ativos e inativos)

#### Product_Sizes

- **Visualização**: Todos os usuários podem ver
- **Inserção/Atualização/Exclusão**: Apenas administradores

#### Product_Notes

- **Visualização**: Usuários podem ver apenas suas próprias notas
- **Inserção/Atualização/Exclusão**: Usuários podem gerenciar apenas suas próprias notas
- **Administradores**: Podem ver todas as notas

### 2. Políticas para Administradores

#### Admin_Users

- **Visualização/Inserção/Exclusão**: Apenas administradores

### 3. Políticas para Pedidos e Carrinho

#### Cart_Items

- **Visualização/Inserção/Atualização/Exclusão**: Usuários podem gerenciar apenas seus próprios itens do carrinho
- **Administradores**: Podem ver todos os itens de carrinho

#### Orders

- **Visualização**: Usuários podem ver apenas seus próprios pedidos
- **Inserção**: Usuários podem criar apenas seus próprios pedidos
- **Atualização**: Usuários podem atualizar apenas seus próprios pedidos pendentes
- **Administradores**: Podem ver e atualizar todos os pedidos

#### Order_Items

- **Visualização**: Usuários podem ver apenas itens de seus próprios pedidos
- **Inserção**: Usuários podem inserir itens apenas em seus próprios pedidos pendentes
- **Administradores**: Podem ver todos os itens de pedidos

### 4. Políticas para Avaliações de Produtos

#### Product_Reviews

- **Visualização**: Todos os usuários podem ver todas as avaliações
- **Inserção**: Usuários podem avaliar apenas produtos que compraram
- **Atualização/Exclusão**: Usuários podem gerenciar apenas suas próprias avaliações
- **Administradores**: Podem gerenciar todas as avaliações

### 5. Políticas para Favoritos

#### Favorites

- **Visualização/Inserção/Exclusão**: Usuários podem gerenciar apenas seus próprios favoritos
- **Administradores**: Podem ver todos os favoritos

## Funções de Segurança

### is_admin()

Verifica se o usuário atual é um administrador.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### user_purchased_product()

Verifica se o usuário comprou um determinado produto.

```sql
CREATE OR REPLACE FUNCTION public.user_purchased_product(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id
    AND oi.product_id = p_product_id
    AND o.status IN ('shipped', 'delivered')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

## Boas Práticas de Segurança

### SECURITY DEFINER

Todas as funções que interagem com o banco de dados foram implementadas com `SECURITY DEFINER` para garantir que sejam executadas com as permissões do usuário que as criou, não do usuário que as está chamando.

### SET search_path = public

Todas as funções definem explicitamente o `search_path` como `public` para evitar ataques de injeção SQL que poderiam manipular o `search_path`.

## Como Testar as Políticas RLS

### Testando como Usuário Normal

1. Faça login na aplicação com uma conta de usuário normal
2. Tente acessar seus próprios dados (perfil, pedidos, notas, favoritos)
3. Tente acessar dados de outros usuários (não deve ser possível)

### Testando como Administrador

1. Adicione um usuário como administrador usando a função `add_first_admin`
2. Faça login na aplicação com a conta de administrador
3. Verifique se você pode acessar dados de todos os usuários

## Solução de Problemas

### Verificando Políticas Ativas

Você pode verificar quais políticas estão ativas para uma tabela específica usando a seguinte consulta SQL:

```sql
SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';
```

### Logs de Acesso

Se você estiver enfrentando problemas com as políticas RLS, pode ser útil habilitar os logs de acesso no PostgreSQL para ver quais consultas estão sendo bloqueadas:

```sql
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
```

## Conclusão

As políticas RLS implementadas no JerseyForge AI garantem que os dados dos usuários sejam protegidos e que cada usuário só possa acessar os dados aos quais tem permissão. Os administradores têm acesso completo a todos os dados, permitindo que gerenciem o sistema de forma eficiente.
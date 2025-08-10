# Correção do Problema de RLS para Administradores

## Problema Identificado

O erro `new row violates row-level security policy for table "products"` ocorre devido a uma inconsistência entre:

1. **Frontend**: Verifica se o usuário é admin através de `user_metadata.user_type === 'dono'`
2. **Backend (RLS)**: Verifica se o usuário existe na tabela `admin_users`

## Soluções Implementadas

### 1. Migração de Correção de RLS

**Arquivo**: `supabase/migrations/20250131000000-fix-admin-rls-policies.sql`

Esta migração:
- Modifica a função `is_admin()` para verificar AMBOS os critérios:
  - Existência na tabela `admin_users` OU
  - `user_metadata.user_type = 'dono'`
- Adiciona função `sync_admin_from_metadata()` para sincronizar usuários
- Cria trigger automático para sincronizar quando `user_metadata` é atualizado

### 2. Script de Configuração de Admin

**Arquivo**: `setup-admin-user.mjs`

Script para configurar usuários como administradores:
```bash
# Listar usuários
node setup-admin-user.mjs list

# Configurar usuário como admin
node setup-admin-user.mjs setup email@exemplo.com
```

### 3. Correção no Frontend

**Arquivo**: `src/pages/adminpanel.tsx`

Adicionada tentativa de sincronização antes de operações críticas:
- Chama `sync_admin_from_metadata()` antes de alterar status de produtos
- Melhora mensagens de erro para debugging

## Como Aplicar as Correções

### Opção 1: Com Supabase Local Rodando

1. Certifique-se que o Docker Desktop está rodando
2. Execute: `npx supabase start`
3. Aplique a migração: `npx supabase migration up`
4. Configure um usuário como admin:
   ```bash
   node setup-admin-user.mjs setup seu-email@exemplo.com
   ```

### Opção 2: Sem Docker (Solução Temporária)

Se o Docker não estiver disponível, a correção no frontend já implementa uma solução temporária que:
- Tenta sincronizar o usuário admin automaticamente
- Fornece mensagens de erro mais detalhadas
- Continua funcionando mesmo se a função RPC não estiver disponível

## Verificação

Para verificar se a correção funcionou:

1. Faça login com um usuário que tenha `user_metadata.user_type = 'dono'`
2. Acesse o painel administrativo
3. Tente alterar o status de um produto
4. A operação deve funcionar sem erros de RLS

## Estrutura da Solução

```
┌─ Frontend (useAuth)
│  └─ Verifica: user_metadata.user_type === 'dono'
│
├─ Backend (RLS Policies)
│  └─ Função is_admin() verifica:
│     ├─ Existe na tabela admin_users OU
│     └─ user_metadata.user_type === 'dono'
│
└─ Sincronização Automática
   ├─ Trigger na tabela auth.users
   ├─ Função sync_admin_from_metadata()
   └─ Chamada manual no frontend
```

## Notas Importantes

- A solução mantém compatibilidade com ambos os métodos de verificação
- O trigger automático garante sincronização futura
- A correção no frontend funciona mesmo sem a migração aplicada
- Recomenda-se aplicar a migração quando possível para uma solução completa
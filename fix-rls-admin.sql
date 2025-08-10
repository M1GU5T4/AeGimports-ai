-- Script para investigar e corrigir o problema de RLS
-- Verificar se existem usuários na tabela admin_users
SELECT 'Usuários admin existentes:' as info;
SELECT * FROM public.admin_users;

-- Verificar se a função is_admin() está funcionando
SELECT 'Testando função is_admin():' as info;
SELECT public.is_admin() as is_current_user_admin;

-- Verificar o usuário atual
SELECT 'Usuário atual:' as info;
SELECT auth.uid() as current_user_id;

-- Verificar políticas RLS na tabela products
SELECT 'Políticas RLS para tabela products:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Adicionar o usuário atual como admin (se não existir)
INSERT INTO public.admin_users (user_id, created_at)
SELECT auth.uid(), NOW()
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
);

-- Verificar novamente se o usuário foi adicionado
SELECT 'Verificação final - usuário atual é admin:' as info;
SELECT public.is_admin() as is_admin_now;

-- Mostrar todos os usuários admin após a inserção
SELECT 'Todos os usuários admin após inserção:' as info;
SELECT * FROM public.admin_users;
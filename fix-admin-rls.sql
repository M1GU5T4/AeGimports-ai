-- Script para corrigir o problema de RLS de administradores
-- O problema é que o frontend verifica user_metadata.user_type === 'dono'
-- mas as políticas RLS verificam a tabela admin_users

-- Vamos modificar a função is_admin() para verificar ambos os critérios
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o usuário está na tabela admin_users OU se tem user_type = 'dono'
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  ) OR (
    SELECT COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'dono',
      false
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para adicionar usuário atual como admin baseado no user_metadata
CREATE OR REPLACE FUNCTION public.sync_admin_from_metadata()
RETURNS VOID AS $$
BEGIN
  -- Se o usuário atual tem user_type = 'dono' mas não está na tabela admin_users, adicionar
  IF (
    SELECT COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'dono',
      false
    )
  ) AND NOT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  ) THEN
    INSERT INTO public.admin_users (user_id) VALUES (auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Comentários explicativos
COMMENT ON FUNCTION public.is_admin IS 'Função que verifica se o usuário é admin através da tabela admin_users OU user_metadata.user_type = dono';
COMMENT ON FUNCTION public.sync_admin_from_metadata IS 'Função para sincronizar usuários admin baseado no user_metadata';
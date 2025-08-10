-- Migração para corrigir políticas RLS de administradores
-- Problema: inconsistência entre verificação frontend (user_metadata.user_type === 'dono') 
-- e backend (tabela admin_users)

-- Modificar a função is_admin() para verificar ambos os critérios
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

-- Função para sincronizar usuários admin baseado no user_metadata
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

-- Trigger para sincronizar automaticamente quando um usuário faz login
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Sincronizar admin baseado no user_metadata quando o usuário é atualizado
  IF NEW.raw_user_meta_data ->> 'user_type' = 'dono' 
     AND NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = NEW.id) THEN
    INSERT INTO public.admin_users (user_id) VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger na tabela auth.users (se não existir)
DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

-- Comentários explicativos
COMMENT ON FUNCTION public.is_admin IS 'Função que verifica se o usuário é admin através da tabela admin_users OU user_metadata.user_type = dono';
COMMENT ON FUNCTION public.sync_admin_from_metadata IS 'Função para sincronizar usuários admin baseado no user_metadata';
COMMENT ON FUNCTION public.handle_auth_user_sync IS 'Trigger function para sincronizar automaticamente usuários admin quando user_metadata é atualizado';
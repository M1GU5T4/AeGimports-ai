-- Implementação de políticas RLS adicionais para administradores

-- Primeiro, vamos criar uma tabela para armazenar os administradores
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de administradores
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Função para verificar se um usuário é administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Políticas para a tabela admin_users
CREATE POLICY "Admins can view admin users" 
ON public.admin_users 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (is_admin());

-- Políticas para administradores nas tabelas existentes

-- Leagues - Admins podem gerenciar ligas
CREATE POLICY "Admins can insert leagues" 
ON public.leagues 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update leagues" 
ON public.leagues 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete leagues" 
ON public.leagues 
FOR DELETE 
USING (is_admin());

-- Nationalities - Admins podem gerenciar nacionalidades
CREATE POLICY "Admins can insert nationalities" 
ON public.nationalities 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update nationalities" 
ON public.nationalities 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete nationalities" 
ON public.nationalities 
FOR DELETE 
USING (is_admin());

-- Sizes - Admins podem gerenciar tamanhos
CREATE POLICY "Admins can insert sizes" 
ON public.sizes 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update sizes" 
ON public.sizes 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete sizes" 
ON public.sizes 
FOR DELETE 
USING (is_admin());

-- Products - Admins podem gerenciar produtos
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update products" 
ON public.products 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete products" 
ON public.products 
FOR DELETE 
USING (is_admin());

-- Product_sizes - Admins podem gerenciar tamanhos de produtos
CREATE POLICY "Admins can insert product sizes" 
ON public.product_sizes 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update product sizes" 
ON public.product_sizes 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete product sizes" 
ON public.product_sizes 
FOR DELETE 
USING (is_admin());

-- Product_notes - Admins podem ver todas as notas
CREATE POLICY "Admins can view all notes" 
ON public.product_notes 
FOR SELECT 
USING (is_admin());

-- Profiles - Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

-- Função para adicionar o primeiro administrador (deve ser executada manualmente)
CREATE OR REPLACE FUNCTION public.add_first_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = admin_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', admin_email;
  END IF;
  
  INSERT INTO public.admin_users (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Comentário explicativo
COMMENT ON FUNCTION public.add_first_admin IS 'Função para adicionar o primeiro administrador. Deve ser executada pelo superusuário do banco de dados.';
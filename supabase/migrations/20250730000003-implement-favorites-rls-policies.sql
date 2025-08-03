-- Implementação de tabelas e políticas RLS para produtos favoritos

-- Tabela de produtos favoritos
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT favorites_user_product_unique UNIQUE (user_id, product_id)
);

-- Habilitar RLS na tabela de favoritos
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para favoritos

-- Usuários podem ver seus próprios favoritos
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

-- Usuários podem adicionar produtos aos favoritos
CREATE POLICY "Users can insert their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Usuários podem remover produtos dos favoritos
CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para administradores
CREATE POLICY "Admins can view all favorites" 
ON public.favorites 
FOR SELECT 
USING (is_admin());

-- Função para verificar se um produto está nos favoritos do usuário
CREATE OR REPLACE FUNCTION public.is_product_favorite(p_product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.favorites
    WHERE user_id = auth.uid()
    AND product_id = p_product_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para adicionar um produto aos favoritos
CREATE OR REPLACE FUNCTION public.add_to_favorites(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.favorites (user_id, product_id)
  VALUES (auth.uid(), p_product_id)
  ON CONFLICT (user_id, product_id) DO NOTHING;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para remover um produto dos favoritos
CREATE OR REPLACE FUNCTION public.remove_from_favorites(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.favorites
  WHERE user_id = auth.uid()
  AND product_id = p_product_id;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para obter os produtos favoritos de um usuário
CREATE OR REPLACE FUNCTION public.get_user_favorites()
RETURNS TABLE (
  id UUID,
  name TEXT,
  price DECIMAL(10,2),
  team TEXT,
  season TEXT,
  is_special_edition BOOLEAN,
  image_url TEXT,
  league_id UUID,
  nationality_id UUID,
  average_rating NUMERIC(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.team,
    p.season,
    p.is_special_edition,
    p.image_url,
    p.league_id,
    p.nationality_id,
    p.average_rating
  FROM public.products p
  JOIN public.favorites f ON p.id = f.product_id
  WHERE f.user_id = auth.uid()
  AND p.is_active = true
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para contar o número de usuários que favoritaram um produto
CREATE OR REPLACE FUNCTION public.count_product_favorites(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  favorite_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO favorite_count
  FROM public.favorites
  WHERE product_id = p_product_id;
  
  RETURN favorite_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Adicionar coluna para contar favoritos à tabela de produtos
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- Função para atualizar a contagem de favoritos de um produto
CREATE OR REPLACE FUNCTION public.update_product_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Se um favorito foi adicionado ou removido
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.products
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.product_id;
    
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.products
    SET favorite_count = GREATEST(0, favorite_count - 1)
    WHERE id = OLD.product_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar a contagem de favoritos quando um favorito é adicionado ou removido
CREATE TRIGGER update_product_favorite_count
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_favorite_count();

-- Atualizar a contagem de favoritos para produtos existentes
UPDATE public.products p
SET favorite_count = (
  SELECT COUNT(*)
  FROM public.favorites f
  WHERE f.product_id = p.id
);
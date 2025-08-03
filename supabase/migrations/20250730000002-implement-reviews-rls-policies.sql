-- Implementação de tabelas e políticas RLS para avaliações de produtos

-- Tabela de avaliações de produtos
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT product_reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT product_reviews_user_product_unique UNIQUE (user_id, product_id)
);

-- Habilitar RLS na tabela de avaliações
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Trigger para atualização automática de timestamps
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar se um usuário comprou um produto
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

-- Políticas RLS para avaliações de produtos

-- Todos podem ver as avaliações
CREATE POLICY "Anyone can view product reviews" 
ON public.product_reviews 
FOR SELECT 
USING (true);

-- Usuários só podem adicionar avaliações para produtos que compraram
CREATE POLICY "Users can insert reviews for purchased products" 
ON public.product_reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  user_purchased_product(auth.uid(), product_id)
);

-- Usuários só podem atualizar suas próprias avaliações
CREATE POLICY "Users can update their own reviews" 
ON public.product_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Usuários só podem excluir suas próprias avaliações
CREATE POLICY "Users can delete their own reviews" 
ON public.product_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para administradores
CREATE POLICY "Admins can insert any review" 
ON public.product_reviews 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update any review" 
ON public.product_reviews 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete any review" 
ON public.product_reviews 
FOR DELETE 
USING (is_admin());

-- Função para calcular a classificação média de um produto
CREATE OR REPLACE FUNCTION public.calculate_product_average_rating(p_product_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC(3,2);
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM public.product_reviews
  WHERE product_id = p_product_id;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Adicionar coluna de classificação média à tabela de produtos
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;

-- Função para atualizar a classificação média de um produto
CREATE OR REPLACE FUNCTION public.update_product_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Se uma avaliação foi inserida ou atualizada
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE public.products
    SET average_rating = calculate_product_average_rating(NEW.product_id)
    WHERE id = NEW.product_id;
    
    RETURN NEW;
  -- Se uma avaliação foi excluída
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.products
    SET average_rating = calculate_product_average_rating(OLD.product_id)
    WHERE id = OLD.product_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar a classificação média do produto quando uma avaliação é modificada
CREATE TRIGGER update_product_rating_on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_average_rating();

-- Função para obter as avaliações mais recentes
CREATE OR REPLACE FUNCTION public.get_recent_product_reviews(limit_count INTEGER DEFAULT 10)
RETURNS SETOF public.product_reviews AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.product_reviews
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
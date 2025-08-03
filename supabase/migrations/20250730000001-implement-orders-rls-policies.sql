-- Implementação de tabelas e políticas RLS para pedidos e carrinho de compras

-- Tabela de carrinho de compras
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.sizes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_quantity_check CHECK (quantity > 0)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Tabela de itens de pedido
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES public.sizes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Triggers para atualização automática de timestamps
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Políticas RLS para carrinho de compras
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para pedidos
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending');

-- Políticas RLS para itens de pedido
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = NEW.order_id
    AND orders.user_id = auth.uid()
    AND orders.status = 'pending'
  )
);

-- Políticas para administradores
CREATE POLICY "Admins can view all cart items" 
ON public.cart_items 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update any order" 
ON public.orders 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (is_admin());

-- Função para calcular o total do pedido
CREATE OR REPLACE FUNCTION public.calculate_order_total(order_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL(10,2);
BEGIN
  SELECT COALESCE(SUM(quantity * unit_price), 0) INTO total
  FROM public.order_items
  WHERE order_id = calculate_order_total.order_id;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Função para criar um pedido a partir do carrinho
CREATE OR REPLACE FUNCTION public.create_order_from_cart(shipping_address TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_order_id UUID;
  v_total DECIMAL(10,2) := 0;
  v_cart_item RECORD;
BEGIN
  -- Obter o ID do usuário atual
  v_user_id := auth.uid();
  
  -- Verificar se o carrinho está vazio
  IF NOT EXISTS (SELECT 1 FROM public.cart_items WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Carrinho vazio';
  END IF;
  
  -- Criar o pedido
  INSERT INTO public.orders (user_id, total_amount, shipping_address, status)
  VALUES (v_user_id, 0, shipping_address, 'pending')
  RETURNING id INTO v_order_id;
  
  -- Adicionar itens do carrinho ao pedido
  FOR v_cart_item IN (
    SELECT 
      ci.product_id, 
      ci.size_id, 
      ci.quantity, 
      p.price as unit_price
    FROM public.cart_items ci
    JOIN public.products p ON ci.product_id = p.id
    WHERE ci.user_id = v_user_id
  ) LOOP
    INSERT INTO public.order_items (
      order_id, 
      product_id, 
      size_id, 
      quantity, 
      unit_price
    ) VALUES (
      v_order_id,
      v_cart_item.product_id,
      v_cart_item.size_id,
      v_cart_item.quantity,
      v_cart_item.unit_price
    );
    
    -- Atualizar o total
    v_total := v_total + (v_cart_item.quantity * v_cart_item.unit_price);
  END LOOP;
  
  -- Atualizar o total do pedido
  UPDATE public.orders
  SET total_amount = v_total
  WHERE id = v_order_id;
  
  -- Limpar o carrinho
  DELETE FROM public.cart_items
  WHERE user_id = v_user_id;
  
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Create store_settings table for storing application configuration
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on store_settings
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active settings
CREATE POLICY "Allow public read access to active store settings" 
ON public.store_settings 
FOR SELECT 
USING (is_active = true);

-- Create policy to allow authenticated users to manage settings (admin only)
CREATE POLICY "Allow admin users to manage store settings" 
ON public.store_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.user_type = 'admin'
  )
);

-- Insert default store settings
INSERT INTO public.store_settings (key, value, description) VALUES
('store_name', 'A&G Imports', 'Nome da loja'),
('logo_url', 'https://bhhifpcihjpjfmhgxlmz.supabase.co/storage/v1/object/public/product-images/logo/Captura%20de%20tela%202025-08-17%20194111-Photoroom.png', 'URL da logo da loja'),
('store_description', 'Sua loja de camisas de futebol premium', 'Descrição da loja'),
('contact_email', 'contato@agimports.com', 'Email de contato'),
('contact_phone', '+55 11 99999-9999', 'Telefone de contato');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_store_settings_updated_at 
    BEFORE UPDATE ON public.store_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
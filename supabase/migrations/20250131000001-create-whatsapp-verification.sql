-- Criar tabela para códigos de verificação via WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por número de telefone
CREATE INDEX IF NOT EXISTS idx_whatsapp_verification_phone ON whatsapp_verification(phone_number);

-- Índice para busca por código e telefone
CREATE INDEX IF NOT EXISTS idx_whatsapp_verification_code_phone ON whatsapp_verification(phone_number, verification_code);

-- Função para limpar códigos expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_verification 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_verification_updated_at
  BEFORE UPDATE ON whatsapp_verification
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE whatsapp_verification ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos códigos
CREATE POLICY "Allow insert verification codes" ON whatsapp_verification
  FOR INSERT WITH CHECK (true);

-- Política para permitir leitura apenas do próprio código
CREATE POLICY "Allow read own verification codes" ON whatsapp_verification
  FOR SELECT USING (true);

-- Política para permitir atualização apenas do próprio código
CREATE POLICY "Allow update own verification codes" ON whatsapp_verification
  FOR UPDATE USING (true);

-- Política para permitir exclusão de códigos expirados
CREATE POLICY "Allow delete expired codes" ON whatsapp_verification
  FOR DELETE USING (expires_at < NOW());

-- Comentários para documentação
COMMENT ON TABLE whatsapp_verification IS 'Tabela para armazenar códigos de verificação via WhatsApp';
COMMENT ON COLUMN whatsapp_verification.phone_number IS 'Número de telefone no formato internacional (+5511999999999)';
COMMENT ON COLUMN whatsapp_verification.verification_code IS 'Código de 6 dígitos enviado via WhatsApp';
COMMENT ON COLUMN whatsapp_verification.expires_at IS 'Data e hora de expiração do código (5 minutos após criação)';
import { supabase } from '@/integrations/supabase/client';
import { storeConfigService } from './supabase';

interface WhatsAppVerification {
  id: string;
  phone_number: string;
  verification_code: string;
  is_verified: boolean;
  expires_at: string;
  created_at: string;
}

class WhatsAppAuthService {
  // Gerar código de verificação de 6 dígitos
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Formatar número de telefone para padrão internacional
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const digits = phone.replace(/\D/g, '');
    
    // Se já tem código do país, retorna como está
    if (digits.startsWith('55') && digits.length >= 12) {
      return `+${digits}`;
    }
    
    // Se é número brasileiro sem código do país, adiciona +55
    if (digits.length === 10 || digits.length === 11) {
      return `+55${digits}`;
    }
    
    // Para outros casos, assume que já está no formato correto
    return `+${digits}`;
  }

  // Sanitizar número para WhatsApp (apenas dígitos)
  private sanitizePhoneForWhatsApp(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  // Enviar código via WhatsApp
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message: string; verificationId?: string }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      // Limpar códigos anteriores para este número
      await supabase
        .from('whatsapp_verification')
        .delete()
        .eq('phone_number', formattedPhone);

      // Inserir novo código
      const { data, error } = await supabase
        .from('whatsapp_verification')
        .insert({
          phone_number: formattedPhone,
          verification_code: code,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar código de verificação:', error);
        return { success: false, message: 'Erro interno do servidor' };
      }

      // Enviar mensagem via WhatsApp
      const whatsappSent = await this.sendWhatsAppMessage(formattedPhone, code);
      
      if (!whatsappSent.success) {
        // Se falhou ao enviar, remove o código do banco
        await supabase
          .from('whatsapp_verification')
          .delete()
          .eq('id', data.id);
        
        return { success: false, message: whatsappSent.message };
      }

      return {
        success: true,
        message: 'Código de verificação enviado via WhatsApp',
        verificationId: data.id
      };
    } catch (error) {
      console.error('Erro ao enviar código de verificação:', error);
      return { success: false, message: 'Erro ao enviar código de verificação' };
    }
  }

  // Enviar mensagem via WhatsApp usando a API
  private async sendWhatsAppMessage(phoneNumber: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Obter configurações da loja
      const config = await storeConfigService.getConfig();
      const whatsappPhone = config?.contact_phone;

      if (!whatsappPhone) {
        return { success: false, message: 'Número do WhatsApp não configurado' };
      }

      const sanitizedPhone = this.sanitizePhoneForWhatsApp(phoneNumber);
      const sanitizedWhatsAppPhone = this.sanitizePhoneForWhatsApp(whatsappPhone);

      // Mensagem de verificação
      const message = `🔐 *Código de Verificação*\n\nSeu código de verificação é: *${code}*\n\nEste código expira em 5 minutos.\n\n⚠️ Não compartilhe este código com ninguém.`;

      // Para desenvolvimento, vamos simular o envio
      // Em produção, aqui você integraria com uma API real do WhatsApp como:
      // - WhatsApp Business API
      // - Twilio WhatsApp API
      // - Evolution API
      // - Baileys (biblioteca não oficial)
      
      console.log(`📱 Simulando envio de WhatsApp para ${phoneNumber}:`);
      console.log(`Código: ${code}`);
      console.log(`Mensagem: ${message}`);

      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Para desenvolvimento, sempre retorna sucesso
      // Em produção, você verificaria a resposta da API real
      return { success: true, message: 'Mensagem enviada com sucesso' };

      // Exemplo de integração com API real (descomente e configure conforme sua API):
      /*
      const response = await fetch('https://api.whatsapp.com/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`
        },
        body: JSON.stringify({
          to: sanitizedPhone,
          type: 'text',
          text: { body: message }
        })
      });

      if (response.ok) {
        return { success: true, message: 'Mensagem enviada com sucesso' };
      } else {
        return { success: false, message: 'Falha ao enviar mensagem' };
      }
      */
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return { success: false, message: 'Erro ao enviar mensagem via WhatsApp' };
    }
  }

  // Verificar código de confirmação
  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message: string; isValid?: boolean }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Buscar código válido
      const { data, error } = await supabase
        .from('whatsapp_verification')
        .select('*')
        .eq('phone_number', formattedPhone)
        .eq('verification_code', code)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return { 
          success: false, 
          message: 'Código inválido ou expirado',
          isValid: false 
        };
      }

      // Marcar como verificado
      const { error: updateError } = await supabase
        .from('whatsapp_verification')
        .update({ is_verified: true })
        .eq('id', data.id);

      if (updateError) {
        console.error('Erro ao marcar código como verificado:', updateError);
        return { success: false, message: 'Erro interno do servidor' };
      }

      return {
        success: true,
        message: 'Código verificado com sucesso',
        isValid: true
      };
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return { success: false, message: 'Erro ao verificar código' };
    }
  }

  // Limpar códigos expirados
  async cleanupExpiredCodes(): Promise<void> {
    try {
      await supabase
        .from('whatsapp_verification')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Erro ao limpar códigos expirados:', error);
    }
  }

  // Verificar se número já foi verificado recentemente
  async isPhoneRecentlyVerified(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('whatsapp_verification')
        .select('id')
        .eq('phone_number', formattedPhone)
        .eq('is_verified', true)
        .gt('created_at', oneHourAgo.toISOString())
        .limit(1);

      return !error && data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar verificação recente:', error);
      return false;
    }
  }
}

export const whatsappAuthService = new WhatsAppAuthService();
export default whatsappAuthService;
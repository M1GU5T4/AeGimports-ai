import type { NextApiRequest, NextApiResponse } from 'next';
import { whatsappAuthService } from '@/lib/whatsappAuthService';

interface SendCodeRequest {
  phoneNumber: string;
}

interface SendCodeResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendCodeResponse>
) {
  // Apenas métodos POST são permitidos
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    });
  }

  try {
    const { phoneNumber }: SendCodeRequest = req.body;

    // Validar entrada
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone é obrigatório'
      });
    }

    // Validar formato do número
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone inválido'
      });
    }

    // Verificar se o número foi verificado recentemente (evitar spam)
    const recentlyVerified = await whatsappAuthService.isPhoneRecentlyVerified(phoneNumber);
    if (recentlyVerified) {
      return res.status(429).json({
        success: false,
        message: 'Código já enviado recentemente. Aguarde antes de solicitar novamente.'
      });
    }

    // Limpar códigos expirados antes de criar um novo
    await whatsappAuthService.cleanupExpiredCodes();

    // Enviar código de verificação
    const result = await whatsappAuthService.sendVerificationCode(phoneNumber);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        verificationId: result.verificationId
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Erro na API de envio de código WhatsApp:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
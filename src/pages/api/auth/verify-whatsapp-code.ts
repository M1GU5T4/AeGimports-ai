import type { NextApiRequest, NextApiResponse } from 'next';
import { whatsappAuthService } from '@/lib/whatsappAuthService';

interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

interface VerifyCodeResponse {
  success: boolean;
  message: string;
  isValid?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyCodeResponse>
) {
  // Apenas métodos POST são permitidos
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido'
    });
  }

  try {
    const { phoneNumber, code }: VerifyCodeRequest = req.body;

    // Validar entrada
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone e código são obrigatórios'
      });
    }

    // Validar formato do código (6 dígitos)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Código deve conter exatamente 6 dígitos',
        isValid: false
      });
    }

    // Validar formato do número
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone inválido'
      });
    }

    // Verificar código
    const result = await whatsappAuthService.verifyCode(phoneNumber, code);

    if (result.success && result.isValid) {
      return res.status(200).json({
        success: true,
        message: result.message,
        isValid: true
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
        isValid: false
      });
    }
  } catch (error) {
    console.error('Erro na API de verificação de código WhatsApp:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}
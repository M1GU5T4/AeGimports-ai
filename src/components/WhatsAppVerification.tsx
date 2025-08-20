import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppVerificationProps {
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onCancel?: () => void;
}

const WhatsAppVerification: React.FC<WhatsAppVerificationProps> = ({
  phoneNumber,
  onVerificationSuccess,
  onCancel
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [canResend, setCanResend] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Formatar tempo restante
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enviar código via WhatsApp
  const sendCode = async () => {
    setIsSending(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/send-whatsapp-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Código enviado via WhatsApp!');
        setTimeLeft(300); // Reset timer
        setCanResend(false);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      const errorMessage = 'Erro ao enviar código. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  // Verificar código
  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-whatsapp-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await response.json();

      if (data.success && data.isValid) {
        setSuccess(true);
        toast.success('Número verificado com sucesso!');
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setError(data.message);
        setCode(''); // Limpar código inválido
      }
    } catch (error) {
      setError('Erro ao verificar código. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar código automaticamente quando o componente é montado
  useEffect(() => {
    sendCode();
  }, []);

  // Formatar número para exibição
  const formatPhoneForDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length >= 12) {
      const countryCode = digits.slice(0, 2);
      const areaCode = digits.slice(2, 4);
      const number = digits.slice(4);
      return `+${countryCode} (${areaCode}) ${number.slice(0, -4)}-${number.slice(-4)}`;
    }
    return phone;
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Verificação Concluída!
            </h3>
            <p className="text-gray-600">
              Seu número foi verificado com sucesso.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <MessageCircle className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle>Verificação via WhatsApp</CardTitle>
        <CardDescription>
          Enviamos um código de 6 dígitos para:
          <br />
          <strong>{formatPhoneForDisplay(phoneNumber)}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="verification-code">Código de Verificação</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setCode(value);
              setError('');
            }}
            maxLength={6}
            className="text-center text-lg tracking-widest"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={verifyCode}
            disabled={isLoading || code.length !== 6}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar Código'
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            {timeLeft > 0 ? (
              <p>Código expira em: <strong>{formatTime(timeLeft)}</strong></p>
            ) : (
              <p className="text-red-600">Código expirado</p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={sendCode}
            disabled={isSending || (!canResend && timeLeft > 0)}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Reenviar Código'
            )}
          </Button>

          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full"
              disabled={isLoading || isSending}
            >
              Cancelar
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>Não recebeu o código?</p>
          <p>Verifique se o WhatsApp está funcionando e tente reenviar.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppVerification;
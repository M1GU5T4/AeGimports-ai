import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import WhatsAppVerification from "@/components/WhatsAppVerification";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showWhatsAppVerification, setShowWhatsAppVerification] = useState(false);
  const [pendingSignUpData, setPendingSignUpData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar dados antes de prosseguir
      if (!fullName || !phone || !email || !password) {
        toast.error("Todos os campos são obrigatórios");
        return;
      }

      // Validar formato do telefone
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        toast.error("Número de telefone inválido");
        return;
      }

      // Armazenar dados para usar após verificação do WhatsApp
      setPendingSignUpData({
        email,
        password,
        fullName,
        phone
      });

      // Mostrar tela de verificação do WhatsApp
      setShowWhatsAppVerification(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar cadastro";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppVerificationSuccess = async () => {
    if (!pendingSignUpData) return;

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: pendingSignUpData.email,
        password: pendingSignUpData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: pendingSignUpData.fullName,
            phone: pendingSignUpData.phone,
            phone_verified: true // Marcar como verificado
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
        setShowWhatsAppVerification(false);
        setPendingSignUpData(null);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWhatsAppVerification = () => {
    setShowWhatsAppVerification(false);
    setPendingSignUpData(null);
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Se está mostrando verificação do WhatsApp, renderizar apenas esse componente
  if (showWhatsAppVerification && pendingSignUpData) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-dark p-4">
        <WhatsAppVerification
          phoneNumber={pendingSignUpData.phone}
          onVerificationSuccess={handleWhatsAppVerificationSuccess}
          onCancel={handleCancelWhatsAppVerification}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-dark p-4">
      <Card className="w-full max-w-md shadow-elegant border-2 border-primary/30 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center gradient-primary rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-accent-foreground animate-glow-pulse">
            A&GImports
          </CardTitle>
          <CardDescription className="text-accent-foreground/80 font-medium">
            Entre ou crie sua conta para continuar
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <CardContent className="p-8">
            <TabsList className="grid w-full grid-cols-2 bg-accent/20 p-1">
              <TabsTrigger value="signin" className="font-semibold data-[state=active]:gradient-primary data-[state=active]:text-accent-foreground">
                🔑 Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="font-semibold data-[state=active]:gradient-primary data-[state=active]:text-accent-foreground">
                ✨ Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signin-email" className="text-sm font-semibold">📧 Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-primary/30 focus:border-primary transition-smooth h-12"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signin-password" className="text-sm font-semibold">🔒 Senha</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-primary/30 focus:border-primary transition-smooth h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                  {loading ? "⏳ Entrando..." : "🚀 Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-5 mt-6">
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-semibold">👤 Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-primary/30 focus:border-primary transition-smooth h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone" className="text-sm font-semibold">📱 Telefone</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="border-primary/30 focus:border-primary transition-smooth h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-semibold">📧 Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-primary/30 focus:border-primary transition-smooth h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm font-semibold">🔒 Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="border-primary/30 focus:border-primary transition-smooth h-11 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                  {loading ? "⏳ Criando conta..." : "✨ Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
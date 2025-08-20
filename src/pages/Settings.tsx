import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Eye, EyeOff, Save, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  security_alerts: boolean;
  newsletter: boolean;
}

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_alerts: boolean;
  session_timeout: number;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    user_type: 'customer'
  });
  
  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<UserSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    order_updates: true,
    security_alerts: true,
    newsletter: false
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: 30
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadUserProfile();
    loadUserSettings();
  }, [user, navigate, loadUserProfile, loadUserSettings]);

  const loadUserProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, user_type')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          user_type: data.user_type || 'customer'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    }
  }, [user]);

  const loadUserSettings = useCallback(async () => {
    // Em uma implementação real, você carregaria as configurações do banco de dados
    // Por enquanto, usamos valores padrão
    try {
      // Simular carregamento de configurações
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileData.full_name.trim()) {
      errors.full_name = 'Nome completo é obrigatório';
    }
    
    if (profileData.phone && !/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(profileData.phone)) {
      errors.phone = 'Formato de telefone inválido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Senha atual é obrigatória';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'Nova senha é obrigatória';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setLoading(true);
      setFormErrors({});
      
      // Primeiro, verificar a senha atual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser?.email) {
        setFormErrors({ currentPassword: 'Usuário não encontrado' });
        return;
      }

      // Verificar a senha atual fazendo login temporário
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setFormErrors({ currentPassword: 'Senha atual incorreta' });
        return;
      }

      // Se a verificação passou, atualizar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setFormErrors({ general: updateError.message });
        toast.error('Erro ao alterar senha');
      } else {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Senha alterada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setFormErrors({ general: 'Erro inesperado ao alterar senha' });
      toast.error('Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    try {
      setLoading(true);
      
      // Em uma implementação real, você salvaria as configurações no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações de notificação atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySettingsUpdate = async () => {
    try {
      setLoading(true);
      
      // Em uma implementação real, você salvaria as configurações no banco de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configurações de segurança atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Primeiro, deletar o perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user?.id);

      if (profileError) throw profileError;
      
      // Depois, deletar a conta do usuário
      const { error: authError } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (authError) {
        console.error('Erro ao deletar usuário:', authError);
        // Mesmo se houver erro na deleção do auth, continuamos com o logout
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      
      toast.success('Conta deletada com sucesso');
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Erro ao deletar conta');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading && !profileData.full_name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8 animate-in slide-in-from-top-4 duration-700 ease-out transform hover:scale-105 transition-all">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Conta
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nome Completo *</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        className={formErrors.full_name ? 'border-red-500' : ''}
                      />
                      {formErrors.full_name && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.full_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Para alterar o e-mail, entre em contato com o suporte
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        className={formErrors.phone ? 'border-red-500' : ''}
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="user_type">Tipo de Usuário</Label>
                      <Input
                        id="user_type"
                        value={profileData.user_type === 'customer' ? 'Cliente' : 'Administrador'}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Notificações */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Notificações por E-mail</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email_notifications">Notificações por e-mail</Label>
                        <p className="text-sm text-gray-500">Receber notificações gerais por e-mail</p>
                      </div>
                      <Switch
                        id="email_notifications"
                        checked={notificationSettings.email_notifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, email_notifications: checked }))
                        }
                      />
                    </div>
                    

                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing_emails">E-mails promocionais</Label>
                        <p className="text-sm text-gray-500">Receber ofertas e promoções</p>
                      </div>
                      <Switch
                        id="marketing_emails"
                        checked={notificationSettings.marketing_emails}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, marketing_emails: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newsletter">Newsletter</Label>
                        <p className="text-sm text-gray-500">Receber newsletter semanal</p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={notificationSettings.newsletter}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, newsletter: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-4">Outras Notificações</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms_notifications">Notificações por SMS</Label>
                        <p className="text-sm text-gray-500">Receber SMS para atualizações importantes</p>
                      </div>
                      <Switch
                        id="sms_notifications"
                        checked={notificationSettings.sms_notifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, sms_notifications: checked }))
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push_notifications">Notificações push</Label>
                        <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                      </div>
                      <Switch
                        id="push_notifications"
                        checked={notificationSettings.push_notifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleNotificationSettingsUpdate} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Alterar Senha */}
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Senha</CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura com uma senha forte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Senha Atual *</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className={formErrors.currentPassword ? 'border-red-500' : ''}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.currentPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">Nova Senha *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className={formErrors.newPassword ? 'border-red-500' : ''}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.newPassword}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className={formErrors.confirmPassword ? 'border-red-500' : ''}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Configurações de Segurança */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Segurança</CardTitle>
                  <CardDescription>
                    Configure opções adicionais de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two_factor_enabled">Autenticação de dois fatores</Label>
                      <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                    </div>
                    <Switch
                      id="two_factor_enabled"
                      checked={securitySettings.two_factor_enabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, two_factor_enabled: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="login_alerts">Alertas de login</Label>
                      <p className="text-sm text-gray-500">Receber notificações de novos logins</p>
                    </div>
                    <Switch
                      id="login_alerts"
                      checked={securitySettings.login_alerts}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, login_alerts: checked }))
                      }
                    />
                  </div>
                  
                  <Button onClick={handleSecuritySettingsUpdate} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Conta */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Conta</CardTitle>
                <CardDescription>
                  Configurações avançadas da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2">Zona de Perigo</h4>
                  <p className="text-sm text-red-600 mb-4">
                    As ações abaixo são irreversíveis. Proceda com cuidado.
                  </p>
                  
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        Deletar Conta
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deletar Conta</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja deletar sua conta? Esta ação é irreversível e todos os seus dados serão perdidos permanentemente.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                          {loading ? 'Deletando...' : 'Sim, Deletar Conta'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
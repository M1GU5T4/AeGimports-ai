import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Calendar, Edit, Save, X, Eye, EyeOff, Settings, LogOut, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { profileService, SupabaseProfile, supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    darkMode: false
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth"); // Redireciona para a autenticação se não houver usuário
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Buscar perfil usando SQL direto via MCP
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          phone,
          user_type,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar o perfil");
        return;
      }
      
      if (data) {
        setProfile(data);
         setFormData({
           full_name: data.full_name || "",
           phone: data.phone || "",
           email: user.email || ""
         });
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || "",
            phone: "",
            user_type: "customer"
          })
          .select()
          .single();
          
        if (createError) {
          console.error("Erro ao criar perfil:", createError);
          toast.error("Erro ao criar o perfil");
          return;
        }
        
        setProfile(newProfile);
         setFormData({
           full_name: newProfile?.full_name || "",
           phone: newProfile?.phone || "",
           email: user.email || ""
         });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erro ao carregar o perfil");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.id || !profile) return;
    
    try {
        setSaving(true);
        const { data, error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            updated_at: new Date().toISOString()
          })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error("Erro ao salvar perfil:", error);
        toast.error("Erro ao salvar o perfil");
        return;
      }
      
      if (data) {
        setProfile(data);
        setIsEditing(false);
        toast.success("Perfil atualizado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar o perfil");
    } finally {
        setSaving(false);
      }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    try {
      // Primeiro deletar o perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);
      
      if (profileError) {
        console.error("Erro ao deletar perfil:", profileError);
        toast.error("Erro ao excluir o perfil");
        return;
      }
      
      // Fazer logout do usuário
      await supabase.auth.signOut();
      
      toast.success("Conta excluída com sucesso");
      navigate("/");
    } catch (error) {
      console.error("Erro ao deletar conta:", error);
      toast.error("Erro ao excluir a conta");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 4;
    
    if (profile.full_name) completed++;
    if (user?.email) completed++;
    if (profile.phone) completed++;
    if (profile.user_type) completed++;
    
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Erro ao carregar o perfil</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/30">
      {/* Header */}
      <div className="bg-black dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.full_name || "Nome não informado"}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={profile.user_type === "admin" ? "default" : "secondary"}>
                      {profile.user_type === "admin" ? "Administrador" : "Cliente"}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Membro desde {profile.created_at ? formatDate(profile.created_at) : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Perfil Completo</div>
                <div className="text-2xl font-bold text-primary">{getProfileCompletionPercentage()}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Gerencie suas informações pessoais e de contato
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            full_name: profile.full_name || "",
                            phone: profile.phone || "",
                            email: user.email || ""
                          });
                        }}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Digite seu nome completo"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{profile.full_name || "Não informado"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{formData.email || "Não informado"}</span>
                      <Badge variant="secondary" className="ml-auto">Verificado</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Digite seu telefone"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{profile.phone || "Não informado"}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Cadastro</Label>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{profile.created_at ? formatDate(profile.created_at) : "Não informado"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação e conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Notificações por Email</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Notificações Gerais</Label>
                      <p className="text-sm text-gray-500">Receber atualizações importantes da conta</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>



                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="promotional-emails">E-mails Promocionais</Label>
                      <p className="text-sm text-gray-500">Receber ofertas especiais e promoções</p>
                    </div>
                    <Switch
                      id="promotional-emails"
                      checked={preferences.promotionalEmails}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, promotionalEmails: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Aparência</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dark-mode">Modo Escuro</Label>
                      <p className="text-sm text-gray-500">Usar tema escuro na interface</p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, darkMode: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Zona de Perigo</h4>
                  
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-red-700 dark:text-red-400">Excluir conta</Label>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                        </p>
                      </div>
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirmar exclusão da conta</DialogTitle>
                            <DialogDescription>
                              Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteAccount}>
                              Sim, excluir conta
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
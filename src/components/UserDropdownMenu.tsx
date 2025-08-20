import React from "react";
import { 
  User, 
  LogOut, 
  HelpCircle, 
  Package, 
  Plus, 
  Users, 
  BarChart3, 
  Download, 
  Globe,
  ShoppingBag,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { storeConfigService } from "@/lib/supabase";

interface UserDropdownMenuProps {
  userType?: string | null;
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ userType }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button 
        onClick={() => navigate("/auth")}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Entrar
      </Button>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const sanitizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("55")) return digits;
    if (digits.length === 10 || digits.length === 11) return `55${digits}`;
    return digits;
  };

  const openWhatsAppSupport = async () => {
    try {
      const config = await storeConfigService.getConfig();
      const rawPhone = config?.contact_phone as string | undefined;

      if (!rawPhone) {
        toast.error("Número de WhatsApp não configurado. Configure em Admin > Configurações da Loja.");
        return;
      }

      const phone = sanitizePhone(rawPhone);
      if (!/^\d{10,15}$/.test(phone)) {
        toast.error("Número de WhatsApp inválido. Verifique o telefone em Configurações da Loja.");
        return;
      }

      const text = "Olá! Preciso de suporte. Motivo: ";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Não foi possível abrir o WhatsApp. Tente novamente.");
    }
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case "profile":
        navigate("/profile");
        break;
      case "favorites":
        navigate("/favorites");
        break;
      case "help":
        openWhatsAppSupport();
        break;
      case "settings":
        navigate("/profile");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "admin-products":
        navigate("/admin#products");
        break;
      case "admin-add-product":
        navigate("/admin#add-product");
        break;
      case "admin-settings":
        navigate("/admin#settings");
        break;
      case "admin-clients":
        navigate("/admin#clients");
        break;
      case "admin-reports":
        navigate("/admin#reports");
        break;
      case "admin-export":
        navigate("/admin#export");
        break;
      default:
        break;
    }
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user?.email || "Usuário"} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {user?.email ? getUserInitials(user.email) : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={user?.email || "Usuário"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg">
                  {user?.email ? getUserInitials(user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {user?.user_metadata?.full_name || "Usuário"}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  {user?.email}
                </p>
                {userType === "admin" && (
                  <Badge variant="secondary" className="mt-1 w-fit text-xs">
                    👑 Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMenuClick("profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          
          {userType !== "admin" && (
            <>
              <DropdownMenuItem onClick={() => handleMenuClick("favorites")}>
                <Heart className="mr-2 h-4 w-4" />
                <span>Favoritos</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {userType === "admin" && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span>Painel Admin</span>
                <Badge variant="secondary" className="ml-auto text-xs">👑</Badge>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-72">
                <DropdownMenuItem onClick={() => handleMenuClick("admin")}> 
                  <Globe className="mr-2 h-4 w-4" /> Visão Geral
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick("admin-products")}>
                  <Package className="mr-2 h-4 w-4" /> Gerenciar Produtos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick("admin-add-product")}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Produto
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick("admin-settings")}>
                  Configurações da Loja
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick("admin-clients")}>
                  <Users className="mr-2 h-4 w-4" /> Clientes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick("admin-reports")}>
                  <BarChart3 className="mr-2 h-4 w-4" /> Relatórios e Vendas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick("admin-export")}>
                  <Download className="mr-2 h-4 w-4" /> Exportar Dados
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => handleMenuClick("help")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Ajuda & Suporte</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdownMenu;
import React from "react";
import { 
  User, 
  Settings, 
  LogOut, 
  HelpCircle, 
  Package, 
  Plus, 
  Users, 
  BarChart3, 
  Download, 
  Globe
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

interface UserDropdownMenuProps {
  userType?: string | null;
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({ userType }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/auth");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case "profile":
        navigate("/admin");
        break;
      case "orders":
        if (userType !== "admin") {
          toast.info("Pedidos em desenvolvimento");
        }
        break;
      case "favorites":
        if (userType !== "admin") {
          toast.info("Favoritos em desenvolvimento");
        }
        break;
      case "notifications":
        if (userType !== "admin") {
          toast.info("Notificações em desenvolvimento");
        }
        break;
      case "payment":
        if (userType !== "admin") {
          toast.info("Métodos de pagamento em desenvolvimento");
        }
        break;
      case "address":
        if (userType !== "admin") {
          toast.info("Endereços em desenvolvimento");
        }
        break;
      case "help":
        toast.info("Ajuda em desenvolvimento");
        break;
      case "settings":
        toast.info("Configurações em desenvolvimento");
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

  // Função para obter as iniciais do usuário
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
        {/* Cabeçalho do usuário */}
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
        
        {/* Grupo de opções da conta */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMenuClick("profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Grupo de configurações */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleMenuClick("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Opções especiais */}
        {userType === "admin" && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Settings className="mr-2 h-4 w-4" />
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
                  <Settings className="mr-2 h-4 w-4" /> Configurações da Loja
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
        
        {/* Logout */}
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
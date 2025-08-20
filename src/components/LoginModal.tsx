import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Sparkles } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actionType?: "cart" | "checkout" | "general";
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actionType = "general"
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth");
    onClose();
  };

  const getIcon = () => {
    switch (actionType) {
      case "cart":
        return <ShoppingCart className="h-12 w-12 text-amber-500" />;
      case "checkout":
        return <ShoppingCart className="h-12 w-12 text-green-500" />;
      default:
        return <User className="h-12 w-12 text-blue-500" />;
    }
  };

  const getDefaultTitle = () => {
    switch (actionType) {
      case "cart":
        return "Faça login para adicionar ao carrinho";
      case "checkout":
        return "Faça login para finalizar sua compra";
      default:
        return "Faça login para continuar";
    }
  };

  const getDefaultDescription = () => {
    switch (actionType) {
      case "cart":
        return "Para adicionar produtos ao seu carrinho e ter uma experiência personalizada, você precisa estar logado. É rápido e fácil!";
      case "checkout":
        return "Para finalizar sua compra com segurança e acompanhar seu pedido, você precisa estar logado. Seus dados estarão protegidos!";
      default:
        return "Para acessar esta funcionalidade, você precisa estar logado. Crie sua conta ou faça login para continuar.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {getIcon()}
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold gradient-text">
            {title || getDefaultTitle()}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            {description || getDefaultDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleLogin}
            className="w-full gradient-primary hover:shadow-elegant transition-all duration-300 font-semibold h-12"
            size="lg"
          >
            🚀 Fazer Login
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full border-gray-200 hover:bg-gray-50 transition-all duration-300"
            size="lg"
          >
            Continuar Navegando
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            ✨ <strong>Navegação livre:</strong> Explore nossos produtos sem login!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            🔒 Seus dados estão seguros conosco
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
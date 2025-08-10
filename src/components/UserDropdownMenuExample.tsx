import React from "react";
import { UserDropdownMenu } from "./UserDropdownMenu";
import { useAuth } from "@/hooks/useAuth";

/**
 * Exemplo de implementação do UserDropdownMenu
 * 
 * Este componente demonstra como usar o UserDropdownMenu em uma aplicação.
 * Ele pode ser facilmente integrado em qualquer header ou navbar.
 */
export const UserDropdownMenuExample: React.FC = () => {
  const { user } = useAuth();
  
  // Simular tipo de usuário (normalmente viria do banco de dados)
  const userType = user?.user_metadata?.user_type || "user";

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">⚽ FutebolShirts</h1>
        <nav className="hidden md:flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-gray-900">Produtos</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Categorias</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Ofertas</a>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Outros elementos do header como carrinho, busca, etc. */}
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-sm text-gray-600">Bem-vindo,</span>
          <span className="text-sm font-medium text-gray-800">
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
          </span>
        </div>
        
        {/* Componente UserDropdownMenu */}
        <UserDropdownMenu userType={userType} />
      </div>
    </div>
  );
};

/**
 * Exemplo de como integrar no componente principal (Index.tsx)
 * 
 * Para usar este componente no seu arquivo index.tsx, você pode:
 * 
 * 1. Importar o componente:
 *    import { UserDropdownMenu } from "@/components/UserDropdownMenu";
 * 
 * 2. Substituir os botões atuais de Admin e Sair por:
 *    <UserDropdownMenu userType={userType} />
 * 
 * 3. Exemplo de integração no header:
 * 
 * ```tsx
 * <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
 *   <div className="container flex h-16 items-center justify-between">
 *     <div className="flex items-center space-x-4">
 *       <h1 className="text-2xl font-bold gradient-text">⚽ FutebolShirts</h1>
 *       // ... outros elementos
 *     </div>
 *     
 *     <div className="flex items-center space-x-4">
 *       // ... carrinho de compras
 *       
 *       // Substituir os botões individuais pelo dropdown
 *       <UserDropdownMenu userType={userType} />
 *     </div>
 *   </div>
 * </header>
 * ```
 * 
 * Funcionalidades incluídas no UserDropdownMenu:
 * - Avatar do usuário com iniciais
 * - Badge de notificações
 * - Informações do usuário (nome, email, tipo)
 * - Menu com opções:
 *   - Meu Perfil
 *   - Meus Pedidos (com contador)
 *   - Favoritos (com contador)
 *   - Notificações (com contador)
 *   - Métodos de Pagamento
 *   - Endereços
 *   - Configurações
 *   - Painel Admin (apenas para admins)
 *   - Ajuda & Suporte
 *   - Sair
 * - Atalhos de teclado
 * - Feedback visual com toasts
 * - Responsivo e acessível
 */

export default UserDropdownMenuExample;
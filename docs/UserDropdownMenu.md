# UserDropdownMenu - Componente de Menu de Usuário

Este documento descreve como implementar e usar o componente `UserDropdownMenu`, que fornece um botão com ícone de usuário que exibe um menu dropdown com várias opções quando clicado.

## 📋 Visão Geral

O `UserDropdownMenu` é um componente React que oferece:

- **Avatar do usuário** com iniciais personalizadas
- **Badge de notificações** com contador
- **Menu dropdown** com múltiplas opções organizadas
- **Suporte a diferentes tipos de usuário** (admin, usuário comum)
- **Atalhos de teclado** para ações rápidas
- **Feedback visual** com toasts
- **Design responsivo** e acessível

## 🚀 Como Usar

### 1. Importação Básica

```tsx
import { UserDropdownMenu } from "@/components/UserDropdownMenu";
```

### 2. Uso Simples

```tsx
function Header() {
  const userType = "admin"; // ou "user"
  
  return (
    <header className="flex items-center justify-between p-4">
      <h1>Minha Aplicação</h1>
      <UserDropdownMenu userType={userType} />
    </header>
  );
}
```

### 3. Integração no Index.tsx

Para substituir os botões atuais de Admin e Sair:

```tsx
// Antes (código atual)
{userType === "admin" && (
  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
    <Settings className="h-4 w-4 mr-2" />
    Admin
  </Button>
)}

<Button variant="outline" size="sm" onClick={() => signOut()}>
  <LogOut className="h-4 w-4 mr-2" />
  Sair
</Button>

// Depois (com UserDropdownMenu)
<UserDropdownMenu userType={userType} />
```

## 🎨 Funcionalidades

### Avatar e Informações do Usuário

- **Avatar circular** com iniciais do usuário
- **Imagem de perfil** (quando disponível)
- **Nome completo** e email do usuário
- **Badge de tipo** (Admin, quando aplicável)
- **Badge de notificações** com contador

### Opções do Menu

#### 👤 Conta do Usuário
- **Meu Perfil** - Gerenciar informações pessoais
- **Meus Pedidos** - Histórico de compras (com contador)
- **Favoritos** - Produtos salvos (com contador)
- **Notificações** - Alertas e mensagens (com contador)

#### ⚙️ Configurações
- **Métodos de Pagamento** - Gerenciar cartões e formas de pagamento
- **Endereços** - Endereços de entrega salvos
- **Configurações** - Preferências da conta

#### 🔧 Administrativo (apenas para admins)
- **Painel Admin** - Acesso ao painel administrativo

#### 📞 Suporte
- **Ajuda & Suporte** - Central de ajuda
- **Sair** - Logout da aplicação

### Atalhos de Teclado

- `⇧⌘P` - Meu Perfil
- `⌘,` - Configurações
- `⇧⌘Q` - Sair

## 🛠️ Dependências

O componente utiliza:

- `@radix-ui/react-dropdown-menu` - Menu dropdown
- `@radix-ui/react-avatar` - Avatar do usuário
- `lucide-react` - Ícones
- `sonner` - Notificações toast
- `react-router-dom` - Navegação

## 📱 Responsividade

O componente é totalmente responsivo:

- **Desktop**: Menu dropdown completo
- **Mobile**: Menu adaptado para toque
- **Tablet**: Layout otimizado

## 🎯 Personalização

### Props Disponíveis

```tsx
interface UserDropdownMenuProps {
  userType?: string | null; // "admin" | "user" | null
}
```

### Customização de Estilos

O componente usa classes Tailwind CSS que podem ser personalizadas:

```tsx
// Avatar personalizado
<Avatar className="h-12 w-12 border-2 border-primary">
  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600">
    {initials}
  </AvatarFallback>
</Avatar>

// Menu personalizado
<DropdownMenuContent className="w-80 shadow-lg border-primary/20">
  {/* conteúdo */}
</DropdownMenuContent>
```

## 🔧 Configuração Avançada

### Adicionando Novas Opções

Para adicionar novas opções ao menu:

```tsx
// No handleMenuClick
case "nova-opcao":
  toast.info("Nova opção clicada");
  // Lógica personalizada
  break;

// No JSX
<DropdownMenuItem onClick={() => handleMenuClick("nova-opcao")}>
  <NovoIcone className="mr-2 h-4 w-4" />
  <span>Nova Opção</span>
</DropdownMenuItem>
```

### Integrando com Estado Global

```tsx
// Com Context API
const { notifications, orders, favorites } = useAppContext();

// Com Redux
const notifications = useSelector(state => state.notifications.count);
```

## 🧪 Exemplo Completo

Veja o arquivo `UserDropdownMenuExample.tsx` para um exemplo completo de implementação.

## 📝 Notas de Desenvolvimento

1. **Autenticação**: O componente usa o hook `useAuth()` para obter informações do usuário
2. **Navegação**: Integrado com React Router para navegação
3. **Feedback**: Usa toasts para feedback das ações
4. **Acessibilidade**: Suporte completo a navegação por teclado
5. **Performance**: Componente otimizado com React.memo quando necessário

## 🐛 Troubleshooting

### Problemas Comuns

1. **Avatar não aparece**: Verifique se o componente Avatar está importado corretamente
2. **Menu não abre**: Verifique se o DropdownMenu está envolvendo corretamente o trigger
3. **Estilos não aplicados**: Confirme se o Tailwind CSS está configurado
4. **Navegação não funciona**: Verifique se o React Router está configurado

### Logs de Debug

```tsx
// Adicione logs para debug
console.log('User:', user);
console.log('UserType:', userType);
```

## 📚 Recursos Adicionais

- [Documentação do Radix UI](https://www.radix-ui.com/)
- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Sonner Toasts](https://sonner.emilkowal.ski/)

---

**Desenvolvido para o projeto FutebolShirts** ⚽

*Este componente segue as melhores práticas de UX/UI e acessibilidade.*
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu, Settings, Plus, Minus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductNotes } from "@/components/ProductNotes";
import { HeroSection } from "@/components/HeroSection";
import { ModernProductCard } from "@/components/ModernProductCard";
import { ModernProductFilters } from "@/components/ModernProductFilters";
import { ModernProductGrid } from "@/components/ModernProductGrid";
import { UserDropdownMenu } from "@/components/UserDropdownMenu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  team_name: string;
  season?: string;
  is_special_edition: boolean;
  special_edition_notes?: string;
  image_url?: string;
  leagues?: { name: string; country: string };
  nationalities?: { name: string };
}

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    league: "",
    nationality: "",
    season: "",
    specialEdition: false,
    priceRange: null as [number, number] | null
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hiddenProducts, setHiddenProducts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hiddenProducts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Sincronizar produtos ocultos com localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('hiddenProducts');
      setHiddenProducts(saved ? new Set(JSON.parse(saved)) : new Set());
    };

    const handleHiddenProductsChange = (event: CustomEvent) => {
      setHiddenProducts(new Set(event.detail));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('hiddenProductsChanged', handleHiddenProductsChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('hiddenProductsChanged', handleHiddenProductsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (user) {
      checkUserType();
      loadProducts();
    } else {
      navigate("/auth");
    }
  }, [user, navigate]);

  const checkUserType = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();
      
      setUserType(profile?.user_type || null);
    } catch (error) {
      console.error("Error checking user type:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          leagues(name, country),
          nationalities(name)
        `);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Item removido do carrinho!");
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }
    
    // Criar mensagem para WhatsApp
    let message = "🛒 *Pedido JerseyForge* 🛒\n\n";
    message += "📋 *Itens do pedido:*\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   👕 Time: ${item.team_name}\n`;
      message += `   💰 Preço: R$ ${item.price.toFixed(2)}\n`;
      message += `   📦 Quantidade: ${item.quantity}\n`;
      message += `   💵 Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    message += `💳 *Total do pedido: R$ ${getTotalPrice().toFixed(2)}*\n\n`;
    message += "📞 Gostaria de finalizar este pedido!";
    
    // Número do WhatsApp (substitua pelo número desejado)
    const phoneNumber = "5531983364110"; // Formato: código do país + DDD + número
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    
    toast.success("Redirecionando para o WhatsApp...");
    
    // Limpar carrinho após redirecionar
    setCartItems([]);
    setIsCartOpen(false);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product.id);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const filteredProducts = products.filter((product) => {
    // Filtrar produtos ocultos
    if (hiddenProducts.has(product.id)) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchLower) ||
        product.team_name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    if (filters.league && product.leagues?.name !== filters.league) {
      return false;
    }

    if (filters.nationality && product.nationalities?.name !== filters.nationality) {
      return false;
    }

    if (filters.season && product.season !== filters.season) {
      return false;
    }

    if (filters.specialEdition && !product.is_special_edition) {
      return false;
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                JerseyForge
              </h1>
            </div>
            
            <div className="flex-1 max-w-lg mx-4 sm:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar camisas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs gradient-primary">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 flex flex-col">
                  <SheetHeader className="flex-shrink-0">
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                      Carrinho de Compras
                    </SheetTitle>
                    <SheetDescription className="text-amber-700">
                      {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no seu carrinho
                    </SheetDescription>
                  </SheetHeader>
                  
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center">
                      <ShoppingCart className="h-16 w-16 text-amber-400 mb-4" />
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">Seu carrinho está vazio</h3>
                      <p className="text-amber-600">Adicione alguns produtos incríveis!</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto py-6 min-h-0 space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg">
                            <div className="flex items-start space-x-4">
                              {item.image_url && (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-amber-900 truncate">{item.name}</h4>
                                <p className="text-sm text-amber-700">{item.team_name}</p>
                                <p className="text-lg font-bold text-amber-800">R$ {item.price.toFixed(2)}</p>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex-shrink-0 border-t border-amber-200 pt-4 space-y-4 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
                        <Separator className="bg-amber-200" />
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-amber-800">Total:</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                            R$ {getTotalPrice().toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          onClick={handleCheckout}
                          className="w-full gradient-primary hover:shadow-elegant transition-all duration-300 font-semibold"
                          size="lg"
                        >
                          Finalizar Compra
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>
              
              <div className="hidden md:flex">
                <UserDropdownMenu userType={userType} />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-8">
                    <UserDropdownMenu userType={userType} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <HeroSection onExploreClick={() => {}} />
        
        <div className="mt-8">
          <div className="flex flex-col xl:flex-row gap-6">
            <aside className="xl:w-72 xl:flex-shrink-0">
              <ModernProductFilters
                onFiltersChange={handleFiltersChange}
              />
            </aside>
            
            <div className="flex-1 min-w-0">
              <ModernProductGrid
                products={filteredProducts}
                loading={loading}
                onProductClick={handleViewDetails}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </main>

      {selectedProduct && (
        <ProductNotes
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Index;

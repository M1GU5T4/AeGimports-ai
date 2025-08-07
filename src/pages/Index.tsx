import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductNotes } from "@/components/ProductNotes";
import { HeroSection } from "@/components/HeroSection";
import { ModernProductCard } from "@/components/ModernProductCard";
import { ModernProductFilters } from "@/components/ModernProductFilters";
import { ModernProductGrid } from "@/components/ModernProductGrid";
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
  const [cartItems, setCartItems] = useState<Product[]>([]);

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
    setCartItems(prev => [...prev, product]);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product.id);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const filteredProducts = products.filter((product) => {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent">
                JerseyForge
              </h1>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
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
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
              
              {userType === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="hidden md:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="hidden md:flex"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-8">
                    {userType === "admin" && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/admin")}
                        className="justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => signOut()}
                      className="justify-start"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <HeroSection onExploreClick={() => {}} />
        
        <div className="mt-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-80">
              <ModernProductFilters
                onFiltersChange={handleFiltersChange}
              />
            </aside>
            
            <div className="flex-1">
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

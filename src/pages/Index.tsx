import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductNotes } from "@/components/ProductNotes";
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
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    loadProducts();
  }, [filters, searchTerm]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          leagues(name, country),
          nationalities(name)
        `)
        .eq("active", true);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,team_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply filters
      if (filters.league) {
        query = query.eq("league_id", filters.league);
      }
      if (filters.nationality) {
        query = query.eq("nationality_id", filters.nationality);
      }
      if (filters.season) {
        query = query.eq("season", filters.season);
      }
      if (filters.specialEdition) {
        query = query.eq("is_special_edition", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    toast.success("Produto adicionado ao carrinho!");
    // TODO: Implement cart functionality
  };

  const handleViewDetails = (productId: string) => {
    setSelectedProduct(productId);
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">⚽ FutebolShirts</h1>
            </div>

            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar camisas, times..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4" />
                <Badge variant="secondary" className="ml-2">0</Badge>
              </Button>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">{user.email}</span>
                  </Button>
                  <Button onClick={signOut} variant="outline" size="sm">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate("/auth")} size="sm">
                  Entrar
                </Button>
              )}
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar camisas, times..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Mobile */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Menu className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <ProductFilters onFiltersChange={setFilters} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <ProductFilters onFiltersChange={setFilters} />
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Camisas de Futebol</h2>
              <p className="text-muted-foreground">
                Encontradas {products.length} camisas
              </p>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                    <div className="aspect-square bg-muted rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma camisa encontrada com os filtros selecionados.
                </p>
                <Button onClick={() => setFilters({})}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Notes Modal/Sidebar */}
        {selectedProduct && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notas do Produto</h3>
                  <Button
                    onClick={() => setSelectedProduct(null)}
                    variant="ghost"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <ProductNotes productId={selectedProduct} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

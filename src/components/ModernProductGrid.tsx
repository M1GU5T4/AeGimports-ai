import { useState, useEffect, useCallback } from "react";
import { ModernProductCard } from "./ModernProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc, 
  Filter,
  Loader2,
  Package,
  Sparkles,
  TrendingUp,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { favoriteService } from "@/lib/customerServices";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  team?: string;
  league?: string;
  season?: string;
  special_edition?: boolean;
  rating?: number;
  discount_percentage?: number;
}

interface ModernProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

type ViewMode = "grid" | "list";
type SortOption = "name" | "price" | "rating" | "newest";
type SortDirection = "asc" | "desc";

export const ModernProductGrid = ({ 
  products, 
  loading = false, 
  onProductClick, 
  onAddToCart 
}: ModernProductGridProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);
  const [isAnimating, setIsAnimating] = useState(false);

  // Carregar favoritos do usuário
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const userFavorites = await favoriteService.getAll();
        const favoriteIds = new Set(userFavorites.map(fav => fav.product_id));
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    };

    loadFavorites();
  }, []);

  // Função para toggle de favoritos
  const handleToggleFavorite = async (productId: string) => {
    try {
      const isFavorite = favorites.has(productId);
      
      if (isFavorite) {
        await favoriteService.remove(productId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(productId);
          return newFavorites;
        });
      } else {
        await favoriteService.add(productId);
        setFavorites(prev => new Set([...prev, productId]));
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      toast.error('Erro ao alterar favorito');
    }
  };

  const sortProducts = useCallback(() => {
    setIsAnimating(true);
    
    setTimeout(() => {
      const sorted = [...products].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "price":
            comparison = a.price - b.price;
            break;
          case "rating":
            comparison = (a.rating || 0) - (b.rating || 0);
            break;
          case "newest":
            // Assuming newer products have higher IDs or use creation date
            comparison = a.id.localeCompare(b.id);
            break;
          default:
            comparison = 0;
        }
        
        return sortDirection === "asc" ? comparison : -comparison;
      });
      
      setDisplayedProducts(sorted.slice(0, itemsToShow));
      setIsAnimating(false);
    }, 300);
  }, [products, sortBy, sortDirection, itemsToShow]);

  useEffect(() => {
    sortProducts();
  }, [products, sortBy, sortDirection, sortProducts]);

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortDirection("desc");
    }
  };

  const loadMore = () => {
    setItemsToShow(prev => prev + 12);
  };

  const specialEditionProducts = products.filter(p => p.special_edition);
  const discountedProducts = products.filter(p => p.discount_percentage && p.discount_percentage > 0);
  const topRatedProducts = products.filter(p => p.rating && p.rating >= 4.5);

  const SortButton = ({ option, label, icon: Icon }: { 
    option: SortOption; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>; 
  }) => (
    <Button
      variant={sortBy === option ? "default" : "ghost"}
      size="sm"
      onClick={() => handleSortChange(option)}
      className={cn(
        "btn-premium transition-all duration-300 hover:scale-105 hover-gold-glow",
        "border border-gold/20 hover:border-gold/40",
        sortBy === option && "bg-gradient-gold text-black shadow-elegant animate-gold-glow"
      )}
    >
      <Icon className="w-4 h-4 mr-1" />
      {label}
      {sortBy === option && (
        sortDirection === "asc" ? 
          <SortAsc className="w-3 h-3 ml-1" /> : 
          <SortDesc className="w-3 h-3 ml-1" />
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Carregando produtos...</h3>
              <p className="text-muted-foreground">Preparando as melhores camisas para você</p>
            </div>
          </div>
        </div>
        
        {/* Loading Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="relative">
          <Package className="w-24 h-24 text-muted-foreground/50 mx-auto" />
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-muted-foreground">
            Nenhum produto encontrado
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Não encontramos produtos que correspondam aos seus filtros. 
            Tente ajustar os critérios de busca.
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="hover:scale-105 transition-transform"
        >
          <Filter className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 card-premium bg-gradient-dark rounded-lg border border-gold/20 hover-premium-lift">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium text-gold">Exibindo</span>
          <Badge variant="secondary" className="text-xs bg-gold/10 text-gold border-gold/30">
            {Math.min(displayedProducts.length, products.length)} de {products.length}
          </Badge>
          <span className="text-xs sm:text-sm text-gold/70 hidden sm:inline">produtos</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Sort Options */}
          <div className="flex items-center gap-1 flex-wrap">
            <SortButton option="newest" label="Mais Novos" icon={TrendingUp} />
            <SortButton option="price" label="Preço" icon={Package} />
            <SortButton option="name" label="Nome" icon={SortAsc} />
            <SortButton option="rating" label="Avaliação" icon={Star} />
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center border border-gold/20 rounded-md ml-auto sm:ml-0 bg-black/20">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-r-none px-2 sm:px-3 transition-all duration-300",
                viewMode === "grid" ? "bg-gradient-gold text-black" : "text-gold hover:text-black hover:bg-gold/20"
              )}
            >
              <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1">Grid</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-l-none px-2 sm:px-3 transition-all duration-300",
                viewMode === "list" ? "bg-gradient-gold text-black" : "text-gold hover:text-black hover:bg-gold/20"
              )}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline ml-1">Lista</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div 
        className={cn(
          "transition-all duration-500",
          isAnimating && "opacity-50 scale-95",
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 p-2 sm:p-4 md:p-6"
            : "space-y-3 sm:space-y-4 p-2 sm:p-4"
        )}
      >
        {displayedProducts.map((product, index) => (
          <ModernProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product)}
            onAddToCart={() => onAddToCart?.(product)}
            onToggleFavorite={() => handleToggleFavorite(product.id)}
            isFavorite={favorites.has(product.id)}
            viewMode={viewMode}
            className={cn(
              "transition-all duration-300 animate-card-entrance hover-premium-lift",
              "hover:scale-[1.02] hover:z-10 card-premium",
              `stagger-${Math.min(index % 5 + 1, 5)}`
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: isAnimating ? "none" : "fadeInUp 0.6s ease-out forwards"
            }}
          />
        ))}
      </div>

      {/* Load More */}
      {displayedProducts.length < products.length && (
        <div className="text-center pt-6 sm:pt-8">
          <Button
            onClick={loadMore}
            size="lg"
            className="btn-primary hover:scale-105 transition-all duration-300 bg-gradient-gold text-black hover-gold-glow animate-premium-shine px-4 sm:px-6 py-2 sm:py-3 shadow-elegant"
          >
            <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="text-sm sm:text-base font-semibold">Carregar Mais</span>
            <Badge variant="secondary" className="ml-2 text-xs sm:text-sm bg-black/20 text-gold border-gold/30">
              +{Math.min(12, products.length - displayedProducts.length)}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
};

// CSS Animation (add to your global CSS)
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
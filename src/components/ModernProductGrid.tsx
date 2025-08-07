import { useState, useEffect } from "react";
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
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [itemsToShow, setItemsToShow] = useState(12);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    sortProducts();
  }, [products, sortBy, sortDirection]);

  const sortProducts = () => {
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
  };

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
    icon: any; 
  }) => (
    <Button
      variant={sortBy === option ? "default" : "ghost"}
      size="sm"
      onClick={() => handleSortChange(option)}
      className={cn(
        "transition-all duration-300 hover:scale-105",
        sortBy === option && "bg-primary text-primary-foreground shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-3">
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-yellow-400/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Edições Especiais</p>
              <p className="text-2xl font-bold">{specialEditionProducts.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-400/10 to-emerald-500/10 border-green-400/20">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Em Promoção</p>
              <p className="text-2xl font-bold">{discountedProducts.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-400/10 to-purple-500/10 border-blue-400/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Star className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Bem Avaliados</p>
              <p className="text-2xl font-bold">{topRatedProducts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card/50 rounded-lg border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Exibindo</span>
          <Badge variant="secondary">
            {Math.min(displayedProducts.length, products.length)} de {products.length}
          </Badge>
          <span className="text-sm text-muted-foreground">produtos</span>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort Options */}
          <div className="flex items-center gap-1">
            <SortButton option="newest" label="Mais Novos" icon={TrendingUp} />
            <SortButton option="price" label="Preço" icon={Package} />
            <SortButton option="name" label="Nome" icon={SortAsc} />
            <SortButton option="rating" label="Avaliação" icon={Star} />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
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
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        )}
      >
        {displayedProducts.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              "transition-all duration-300",
              "hover:scale-[1.02] hover:z-10"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
              animation: isAnimating ? "none" : "fadeInUp 0.6s ease-out forwards"
            }}
          >
            <ModernProductCard
              product={product}
              onClick={() => onProductClick?.(product)}
              onAddToCart={() => onAddToCart?.(product)}
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {/* Load More */}
      {displayedProducts.length < products.length && (
        <div className="text-center pt-8">
          <Button
            onClick={loadMore}
            size="lg"
            className="hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Package className="w-4 h-4 mr-2" />
            Carregar Mais Produtos
            <Badge variant="secondary" className="ml-2">
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
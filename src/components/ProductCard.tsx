import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
}

export const ProductCard = ({ product, onAddToCart, onViewDetails }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden hover-lift shadow-card border border-transparent hover:border-primary/30 transition-smooth bg-card/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-smooth hover:scale-110"
            />
          ) : (
            <div className="text-primary text-4xl sm:text-5xl lg:text-6xl animate-glow-pulse">⚽</div>
          )}
          {product.is_special_edition && (
            <div className="absolute top-2 right-2">
              <Badge variant="premium" className="rotate-12 text-xs px-2 py-1">
                ESPECIAL
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm sm:text-base lg:text-lg font-bold line-clamp-2 text-foreground leading-tight">
              {product.name}
            </CardTitle>
          </div>
          
          <p className="text-sm sm:text-base font-semibold text-accent">{product.team_name}</p>
          
          {product.leagues && (
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              🏆 {product.leagues.name} • {product.leagues.country}
            </p>
          )}
          
          {product.season && (
            <Badge variant="outline" className="text-xs w-fit">
              📅 {product.season}
            </Badge>
          )}
          
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-primary/20 mt-auto">
            <span className="price-highlight text-lg sm:text-xl lg:text-2xl font-black">
              R$ {product.price.toFixed(2)}
            </span>
            {product.special_edition_notes && (
              <Badge variant="default" className="text-xs">
                ⭐ Exclusiva
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 sm:p-4 pt-0 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails?.(product.id)}
          className="w-full font-semibold text-xs sm:text-sm"
        >
          👁️ Ver Detalhes
        </Button>
        <Button 
          size="sm" 
          onClick={() => onAddToCart?.(product.id)}
          className="w-full font-bold text-xs sm:text-sm"
        >
          🛒 Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
};
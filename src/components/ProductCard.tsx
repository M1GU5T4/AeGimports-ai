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
    <Card className="overflow-hidden hover-lift shadow-card border-2 border-transparent hover:border-primary/30 transition-smooth bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-0 relative">
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-smooth hover:scale-110"
            />
          ) : (
            <div className="text-primary text-6xl animate-glow-pulse">⚽</div>
          )}
          {product.is_special_edition && (
            <div className="absolute top-3 right-3">
              <Badge variant="premium" className="rotate-12">
                ESPECIAL
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-bold line-clamp-2 text-foreground">
              {product.name}
            </CardTitle>
          </div>
          
          <p className="text-lg font-semibold text-accent">{product.team_name}</p>
          
          {product.leagues && (
            <p className="text-sm text-muted-foreground font-medium">
              🏆 {product.leagues.name} • {product.leagues.country}
            </p>
          )}
          
          {product.season && (
            <Badge variant="outline" className="text-xs">
              📅 Temporada {product.season}
            </Badge>
          )}
          
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-primary/20">
            <span className="price-highlight text-2xl font-black">
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
      
      <CardFooter className="p-6 pt-0 space-y-3">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => onViewDetails?.(product.id)}
          className="w-full font-semibold"
        >
          👁️ Ver Detalhes
        </Button>
        <Button 
          size="lg" 
          onClick={() => onAddToCart?.(product.id)}
          className="w-full font-bold text-lg"
        >
          🛒 Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};
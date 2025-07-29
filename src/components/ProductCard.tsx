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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="aspect-square bg-muted flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-4xl">⚽</div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            {product.is_special_edition && (
              <Badge variant="secondary" className="ml-2 shrink-0">
                Edição Especial
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">{product.team_name}</p>
          
          {product.leagues && (
            <p className="text-xs text-muted-foreground">
              {product.leagues.name} • {product.leagues.country}
            </p>
          )}
          
          {product.season && (
            <p className="text-xs text-muted-foreground">Temporada {product.season}</p>
          )}
          
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-lg font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails?.(product.id)}
          className="flex-1"
        >
          Ver Detalhes
        </Button>
        <Button 
          size="sm" 
          onClick={() => onAddToCart?.(product.id)}
          className="flex-1"
        >
          Adicionar ao Carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};
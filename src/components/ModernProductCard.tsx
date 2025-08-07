import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ModernProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  className?: string;
}

export const ModernProductCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onToggleFavorite,
  isFavorite = false,
  className 
}: ModernProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
        "hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 ease-out",
        "hover:-translate-y-2 hover:scale-[1.02]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Special Edition Glow */}
      {product.is_special_edition && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/10 to-red-500/20 animate-pulse" />
      )}

      <CardContent className="p-0 relative">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          
          {product.image_url ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <img
                src={product.image_url}
                alt={product.name}
                className={cn(
                  "w-full h-full object-cover transition-all duration-700 ease-out",
                  "group-hover:scale-110 group-hover:rotate-1",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl animate-bounce text-primary/60">⚽</div>
            </div>
          )}

          {/* Overlay Actions */}
          <div className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center gap-3",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            "backdrop-blur-sm"
          )}>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-black border-0 shadow-lg hover:scale-110 transition-all duration-200"
              onClick={() => onViewDetails?.(product.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "border-0 shadow-lg hover:scale-110 transition-all duration-200",
                isFavorite 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-white/90 hover:bg-white text-black"
              )}
              onClick={() => onToggleFavorite?.(product.id)}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_special_edition && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 shadow-lg animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                ESPECIAL
              </Badge>
            )}
            
            {product.leagues && (
              <Badge variant="secondary" className="bg-black/80 text-white border-0 backdrop-blur-sm">
                🏆 {product.leagues.name}
              </Badge>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-primary to-accent text-black border-0 shadow-lg font-bold text-lg px-3 py-1">
              R$ {product.price.toFixed(0)}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title and Team */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <p className="text-accent font-semibold">{product.team_name}</p>
              
              {product.season && (
                <Badge variant="outline" className="text-xs">
                  {product.season}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Special Edition Notes */}
          {product.special_edition_notes && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                ⭐ {product.special_edition_notes}
              </p>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={cn(
                  "w-4 h-4",
                  i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                )} 
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">(4.0)</span>
          </div>

          {/* Action Button */}
          <Button 
            className={cn(
              "w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90",
              "text-black font-semibold border-0 shadow-lg",
              "hover:scale-105 hover:shadow-xl transition-all duration-300",
              "group-hover:animate-pulse"
            )}
            onClick={() => onAddToCart?.(product.id)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </CardContent>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-xl -z-10"
      )} />
    </Card>
  );
};
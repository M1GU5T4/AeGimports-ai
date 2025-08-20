import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Heart, ShoppingCart, Eye, Star, Zap, MapPin, Calendar, Trophy, Globe } from "lucide-react";
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
  onClick?: () => void;
  isFavorite?: boolean;
  className?: string;
  style?: React.CSSProperties;
  viewMode?: "grid" | "list";
}

export const ModernProductCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  onToggleFavorite,
  onClick,
  isFavorite = false,
  className,
  style,
  viewMode = "grid"
}: ModernProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500 ease-out card-premium",
        "hover:shadow-elegant hover:-translate-y-2 hover-premium-lift",
        "bg-gradient-dark border-2 border-gold/20 hover:border-gold/40",
        "backdrop-blur-sm animate-card-entrance hover-gold-glow",
        "before:absolute before:inset-0 before:rounded-lg before:p-[2px]",
        "before:bg-gradient-gold before:opacity-0 hover:before:opacity-30",
        "before:transition-opacity before:duration-500 animate-border-gold",
        "after:absolute after:inset-[2px] after:rounded-lg after:bg-gradient-dark after:z-[-1]",
        className
      )}
      style={style}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/60 rounded-full animate-luxury-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 200}ms`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>
      
      {/* Animated border glow */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gold/30 via-gold/10 to-gold/30 blur-sm animate-gold-glow" />
      </div>
      
      {/* Special Edition Glow */}
      {product.is_special_edition && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/30 via-gold/10 to-gold/20 animate-gold-glow" />
      )}

      <CardContent className="p-0 relative">
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-black/50 to-gold/5" />
          
          {/* Animated glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-premium-shine" />
          
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
                  "group-hover:brightness-110 group-hover:contrast-110",
                  "filter group-hover:saturate-110",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-dark">
              <div className="text-6xl animate-luxury-float text-gold/60">⚽</div>
            </div>
          )}

          {/* Overlay Actions */}
          <div className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center gap-3",
            "opacity-0 group-hover:opacity-100 transition-all duration-300",
            "backdrop-blur-md"
          )}>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "h-10 w-10 p-0 relative overflow-hidden btn-premium",
                "bg-white/95 backdrop-blur-md border border-gold/50",
                "shadow-elegant hover:shadow-elegant text-gray-800",
                "hover:bg-gradient-gold hover:text-black",
                "hover:scale-110 transition-all duration-300 hover-gold-glow",
                "before:absolute before:inset-0 before:bg-gradient-gold",
                "before:opacity-0 hover:before:opacity-100",
                "before:transition-opacity before:duration-300"
              )}
              onClick={() => {
                setIsDialogOpen(true);
                onViewDetails?.(product.id);
              }}
            >
              <Eye className="w-4 h-4 relative z-10" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "h-10 w-10 p-0 relative overflow-hidden btn-premium",
                "backdrop-blur-md border border-gold/50",
                "shadow-elegant hover:shadow-elegant hover:scale-110 transition-all duration-300",
                "before:absolute before:inset-0 before:bg-gradient-gold",
                "before:opacity-0 hover:before:opacity-100",
                "before:transition-opacity before:duration-300 hover-gold-glow",
                isFavorite 
                  ? "bg-red-500/95 hover:bg-red-600 text-white animate-gold-glow" 
                  : "bg-white/95 hover:bg-gradient-gold hover:text-black text-gray-800"
              )}
              onClick={() => onToggleFavorite?.(product.id)}
            >
              <Heart className={cn("w-4 h-4 relative z-10", isFavorite && "fill-current")} />
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_special_edition && (
              <Badge className="bg-gradient-gold text-black border-0 shadow-elegant animate-gold-glow font-bold">
                <Zap className="w-3 h-3 mr-1" />
                ESPECIAL
              </Badge>
            )}
            
            {product.leagues && (
              <Badge variant="secondary" className="bg-black/80 text-gold border border-gold/30 backdrop-blur-sm">
                🏆 {product.leagues.name}
              </Badge>
            )}
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={cn(
              "relative overflow-hidden",
              "bg-gradient-gold text-black border-0 shadow-elegant font-bold text-lg px-3 py-1",
              "hover:shadow-elegant hover:scale-105 transition-all duration-300 hover-gold-glow",
              "before:absolute before:inset-0 before:bg-gradient-to-r",
              "before:from-transparent before:via-white/30 before:to-transparent",
              "before:-translate-x-full group-hover:before:translate-x-full",
              "before:transition-transform before:duration-1000 before:ease-out"
            )}>
              <span className="relative z-10">R$ {product.price.toFixed(0)}</span>
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title and Team */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gold group-hover:text-gold/80 transition-colors duration-300 heading-premium">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between">
              <p className="text-gold/80 font-semibold">{product.team_name}</p>
              
              {product.season && (
                <Badge variant="outline" className="text-xs border-gold/30 text-gold">
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
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 p-3 rounded-lg border border-gold/30">
              <p className="text-xs text-gold font-medium">
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
                  "w-4 h-4 transition-all duration-300",
                  "hover:scale-125 hover:rotate-12",
                  i < 4 
                    ? "text-gold fill-current drop-shadow-sm hover:drop-shadow-md" 
                    : "text-gray-300 hover:text-gold/50"
                )}
                style={{
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2 font-medium">(4.0)</span>
          </div>

          {/* Action Button */}
          <Button 
            className={cn(
              "w-full relative overflow-hidden btn-primary",
              "bg-gradient-gold hover:bg-gradient-gold/90",
              "text-black font-semibold border-0 shadow-elegant",
              "hover:scale-105 hover:shadow-elegant transition-all duration-300",
              "hover-gold-glow",
              "before:absolute before:inset-0 before:bg-gradient-to-r",
              "before:from-transparent before:via-white/20 before:to-transparent",
              "before:-translate-x-full hover:before:translate-x-full",
              "before:transition-transform before:duration-700 before:ease-out"
            )}
            onClick={() => onAddToCart?.(product.id)}
          >
            <ShoppingCart className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">Adicionar ao Carrinho</span>
          </Button>
        </div>
      </CardContent>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-r from-gold/20 via-transparent to-gold/20 blur-xl -z-10"
      )} />

      {/* Product Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg border">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="text-6xl text-muted-foreground">⚽</div>
                  </div>
                )}
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {product.is_special_edition && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                    <Zap className="w-3 h-3 mr-1" />
                    Edição Especial
                  </Badge>
                )}
                {product.leagues && (
                  <Badge variant="secondary">
                    <Trophy className="w-3 h-3 mr-1" />
                    {product.leagues.name}
                  </Badge>
                )}
                {product.season && (
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {product.season}
                  </Badge>
                )}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Price */}
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  R$ {product.price.toFixed(2)}
                </div>
                <div className="flex items-center justify-center gap-1">
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
              </div>

              <Separator />

              {/* Product Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">Time:</span>
                  <span>{product.team_name}</span>
                </div>

                {product.leagues && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Liga:</span>
                    <span>{product.leagues.name} ({product.leagues.country})</span>
                  </div>
                )}

                {product.nationalities && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Nacionalidade:</span>
                    <span>{product.nationalities.name}</span>
                  </div>
                )}

                {product.season && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Temporada:</span>
                    <span>{product.season}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              {product.description && (
                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Special Edition Notes */}
              {product.special_edition_notes && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    ⭐ Edição Especial
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {product.special_edition_notes}
                  </p>
                </div>
              )}

              {/* Action Button */}
               <div>
                 <Button 
                   className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-semibold"
                   onClick={() => {
                     onAddToCart?.(product.id);
                     setIsDialogOpen(false);
                   }}
                 >
                   <ShoppingCart className="w-4 h-4 mr-2" />
                   Adicionar ao Carrinho
                 </Button>
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
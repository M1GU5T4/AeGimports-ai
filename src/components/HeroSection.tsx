import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Sparkles, TrendingUp, Star, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  team_name: string;
  image_url: string;
  price: number;
}

interface HeroSectionProps {
  onExploreClick?: () => void;
  onAddToCart?: (product: Product) => void;
}

export const HeroSection = ({ onExploreClick, onAddToCart }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const heroSlides = [
    {
      title: "Camisas Autênticas",
      subtitle: "Premium Collection",
      description: "Descubra nossa coleção exclusiva de camisas de futebol autênticas dos maiores times do mundo.",
      highlight: "Edição Limitada",
      gradient: "from-yellow-400 via-orange-500 to-red-500"
    },
    {
      title: "Times Europeus",
      subtitle: "Champions League",
      description: "As camisas dos campeões europeus com qualidade premium e detalhes únicos.",
      highlight: "Novidades",
      gradient: "from-blue-400 via-purple-500 to-pink-500"
    },
    {
      title: "Seleções Nacionais",
      subtitle: "Copa do Mundo",
      description: "Represente seu país com as camisas oficiais das seleções mais icônicas.",
      highlight: "Exclusivo",
      gradient: "from-green-400 via-blue-500 to-purple-500"
    }
  ];

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, team_name, image_url, price')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .limit(3);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos em destaque:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 min-h-screen">
      {/* Dynamic Background with Mouse Tracking */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse transition-all duration-1000"
          style={{
            top: `${-160 + scrollY * 0.1}px`,
            right: `${-160 + mousePosition.x * 0.02}px`,
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse transition-all duration-1000"
          style={{
            bottom: `${-160 - scrollY * 0.05}px`,
            left: `${-160 + mousePosition.y * 0.01}px`,
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-spin transition-all duration-500"
          style={{
            animationDuration: '20s',
            transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0005})`,
          }}
        ></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary/30 rotate-45 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-accent/40 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-primary/50 animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 h-screen max-h-[800px]">
          
          {/* Main Title Card - Takes up large space */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 row-span-2 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 flex flex-col justify-center space-y-6 animate-fade-in hover:scale-[1.02] transition-all duration-500 group">
            {/* Badge */}
            <div className="flex items-center space-x-3">
              <Badge 
                variant="outline" 
                className={`bg-gradient-to-r ${currentHero.gradient} text-white border-0 px-4 py-2 text-sm font-semibold animate-bounce hover:scale-110 transition-transform`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {currentHero.highlight}
              </Badge>
              <div className="flex space-x-1">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                      index === currentSlide ? 'bg-primary w-8' : 'bg-primary/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black leading-tight group-hover:scale-105 transition-transform duration-500">
                <span className="block text-foreground animate-slide-up">
                  {currentHero.title}
                </span>
                <span className={`block bg-gradient-to-r ${currentHero.gradient} bg-clip-text text-transparent animate-slide-up`} style={{ animationDelay: '0.2s' }}>
                  {currentHero.subtitle}
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed animate-slide-up opacity-80 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.4s' }}>
                {currentHero.description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <Button 
                size="lg" 
                className={`bg-gradient-to-r ${currentHero.gradient} hover:scale-105 transition-all duration-300 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl group-hover:shadow-3xl`}
                onClick={onExploreClick}
              >
                Explorar Coleção
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-primary/30 hover:border-primary hover:bg-primary/10 px-8 py-6 text-lg font-semibold transition-all duration-300"
              >
                <TrendingUp className="mr-2 w-5 h-5" />
                Ver Tendências
              </Button>
            </div>
          </div>

          {/* Stats Card 1 - Products */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 rounded-3xl p-6 flex flex-col justify-center items-center space-y-3 animate-fade-in hover:scale-105 transition-all duration-500 cursor-pointer group" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl font-black text-primary group-hover:scale-110 transition-transform">500+</div>
            <div className="text-sm text-muted-foreground font-medium">Produtos</div>
            <div className="w-full h-1 bg-gradient-to-r from-primary/20 to-primary rounded-full group-hover:from-primary/40 group-hover:to-primary/60 transition-all duration-500"></div>
          </div>

          {/* Stats Card 2 - Teams */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1 bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-xl border border-accent/20 rounded-3xl p-6 flex flex-col justify-center items-center space-y-3 animate-fade-in hover:scale-105 transition-all duration-500 cursor-pointer group" style={{ animationDelay: '0.4s' }}>
            <div className="text-4xl font-black text-accent group-hover:scale-110 transition-transform">50+</div>
            <div className="text-sm text-muted-foreground font-medium">Times</div>
            <div className="w-full h-1 bg-gradient-to-r from-accent/20 to-accent rounded-full group-hover:from-accent/40 group-hover:to-accent/60 transition-all duration-500"></div>
          </div>

          {/* Rating Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-6 flex flex-col justify-center items-center space-y-4 animate-fade-in hover:scale-105 transition-all duration-500 cursor-pointer group" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500 group-hover:scale-110 transition-transform" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <div className="text-3xl font-black text-yellow-600 group-hover:scale-110 transition-transform">4.9</div>
            <div className="text-sm text-muted-foreground font-medium text-center">Avaliação dos Clientes</div>
            <div className="text-xs text-muted-foreground/70">+1.2k avaliações</div>
          </div>

          {/* Featured Product Card */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 xl:col-span-6 row-span-1 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-primary/20 rounded-3xl p-8 flex items-center justify-center space-x-8 animate-fade-in hover:scale-[1.02] transition-all duration-500 group" style={{ animationDelay: '0.8s' }}>
            
            {/* Product Image */}
            <div className="relative">
              <div className={`w-48 h-48 bg-gradient-to-br ${currentHero.gradient} rounded-3xl flex items-center justify-center shadow-2xl animate-float group-hover:shadow-3xl transition-all duration-500`}>
                <div className="w-40 h-40 bg-background/90 backdrop-blur-sm rounded-2xl flex items-center justify-center overflow-hidden">
                  {loading ? (
                    <div className="text-6xl animate-bounce">⚽</div>
                  ) : featuredProducts.length > 0 ? (
                    <img
                      src={featuredProducts[currentSlide % featuredProducts.length]?.image_url}
                      alt={featuredProducts[currentSlide % featuredProducts.length]?.name}
                      className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="text-6xl animate-bounce">⚽</div>
                  )}
                  <div className="text-6xl animate-bounce hidden">⚽</div>
                </div>
              </div>
              
              {/* Floating Interactive Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{ animationDelay: '2s' }}>
                <Star className="w-7 h-7 text-white fill-white" />
              </div>
            </div>

            {/* Product Info */}
            {!loading && featuredProducts.length > 0 && (
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {featuredProducts[currentSlide % featuredProducts.length]?.name}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {featuredProducts[currentSlide % featuredProducts.length]?.team_name}
                  </p>
                </div>
                <div className="text-3xl font-black text-primary">
                  R$ {featuredProducts[currentSlide % featuredProducts.length]?.price?.toFixed(2)}
                </div>
                <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-300 text-white"
                  onClick={() => {
                    const product = featuredProducts[currentSlide % featuredProducts.length];
                    if (product) {
                      onAddToCart?.(product);
                    }
                  }}
                  disabled={loading || featuredProducts.length === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
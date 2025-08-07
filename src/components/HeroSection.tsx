import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Sparkles, TrendingUp, Star } from "lucide-react";
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
}

export const HeroSection = ({ onExploreClick }: HeroSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  }, []);

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="flex items-center space-x-3">
              <Badge 
                variant="outline" 
                className={`bg-gradient-to-r ${currentHero.gradient} text-white border-0 px-4 py-2 text-sm font-semibold animate-bounce`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {currentHero.highlight}
              </Badge>
              <div className="flex space-x-1">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-primary w-8' : 'bg-primary/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="block text-foreground animate-slide-up">
                  {currentHero.title}
                </span>
                <span className={`block bg-gradient-to-r ${currentHero.gradient} bg-clip-text text-transparent animate-slide-up`} style={{ animationDelay: '0.2s' }}>
                  {currentHero.subtitle}
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
                {currentHero.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Times</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.9</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Star className="w-3 h-3 fill-primary text-primary mr-1" />
                  Avaliação
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <Button 
                size="lg" 
                className={`bg-gradient-to-r ${currentHero.gradient} hover:scale-105 transition-all duration-300 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl`}
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

          {/* Visual Element */}
          <div className="relative animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="relative">
              {/* Main Circle */}
              <div className={`w-96 h-96 mx-auto bg-gradient-to-br ${currentHero.gradient} rounded-full flex items-center justify-center shadow-2xl animate-float`}>
                <div className="w-80 h-80 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden">
                  {loading ? (
                    <div className="text-8xl animate-bounce">⚽</div>
                  ) : featuredProducts.length > 0 ? (
                    <img
                      src={featuredProducts[currentSlide % featuredProducts.length]?.image_url}
                      alt={featuredProducts[currentSlide % featuredProducts.length]?.name}
                      className="w-64 h-64 object-contain animate-pulse hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="text-8xl animate-bounce">⚽</div>
                  )}
                  {/* Fallback emoji (hidden by default) */}
                  <div className="text-8xl animate-bounce hidden">⚽</div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '2s' }}>
                <Star className="w-10 h-10 text-white fill-white" />
              </div>
              
              <div className="absolute top-1/2 -left-12 w-12 h-12 bg-gradient-to-br from-primary/80 to-accent/80 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
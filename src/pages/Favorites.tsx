import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { favoriteService, Favorite } from '@/lib/customerServices';
import { Product } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [itemToRemove, setItemToRemove] = useState<Favorite | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadFavorites();
  }, [user, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getAll();
      setFavorites(data);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast.error('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favorite: Favorite) => {
    try {
      await favoriteService.delete(favorite.id);
      setFavorites(prev => prev.filter(f => f.id !== favorite.id));
      toast.success('Item removido dos favoritos');
      setItemToRemove(null);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  const handleAddToCart = (product: Product) => {
    // Implementar lógica do carrinho aqui
    toast.success('Item adicionado ao carrinho!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  // Filtrar e ordenar favoritos
  const filteredAndSortedFavorites = favorites
    .filter(favorite => {
      const matchesSearch = favorite.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.products?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             favorite.products?.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return (a.products?.name || '').localeCompare(b.products?.name || '');
        case 'price_low':
          return (a.products?.price || 0) - (b.products?.price || 0);
        case 'price_high':
          return (b.products?.price || 0) - (a.products?.price || 0);
        default:
          return 0;
      }
    });

  // Obter categorias únicas
  const categories = Array.from(new Set(favorites.map(f => f.products?.categories?.name).filter(Boolean)));

  const FavoriteCard: React.FC<{ favorite: Favorite }> = ({ favorite }) => {
    const product = favorite.products;
    if (!product) return null;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative">
          <img 
            src={product.image_url || '/placeholder-product.jpg'} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-md"
              onClick={() => setItemToRemove(favorite)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          {product.discount_percentage && product.discount_percentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{product.discount_percentage}%
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {product.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {product.categories?.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
              )}
              {product.stock_quantity !== undefined && (
                <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                  {product.stock_quantity > 0 ? `${product.stock_quantity} em estoque` : 'Esgotado'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.original_price)}
                  </span>
                )}
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Adicionado em {formatDate(favorite.created_at)}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                className="flex-1" 
                onClick={() => handleAddToCart(product)}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/product/${product.id}`)}
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
            <p className="text-gray-600 mt-1">
              {favorites.length} {favorites.length === 1 ? 'item favoritado' : 'itens favoritados'}
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
              <p className="text-gray-500 mb-6">
                Explore nossos produtos e adicione seus favoritos aqui!
              </p>
              <Button onClick={() => navigate('/')}>
                Explorar Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filtros e Busca */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar nos favoritos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mais recentes</SelectItem>
                        <SelectItem value="oldest">Mais antigos</SelectItem>
                        <SelectItem value="name">Nome A-Z</SelectItem>
                        <SelectItem value="price_low">Menor preço</SelectItem>
                        <SelectItem value="price_high">Maior preço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de Favoritos */}
            {filteredAndSortedFavorites.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum resultado encontrado</h3>
                  <p className="text-gray-500 mb-6">
                    Tente ajustar os filtros ou termo de busca.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSortBy('newest');
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedFavorites.map((favorite) => (
                  <FavoriteCard key={favorite.id} favorite={favorite} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Dialog de Confirmação para Remover */}
        <Dialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover dos Favoritos</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover "{itemToRemove?.products?.name}" dos seus favoritos?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setItemToRemove(null)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => itemToRemove && handleRemoveFavorite(itemToRemove)}
              >
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Favorites;
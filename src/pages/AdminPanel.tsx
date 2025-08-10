import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, Users, Settings, Download, Loader2, Edit, Trash2, Eye, EyeOff, Search, Filter, BarChart3, TrendingUp, ShoppingCart, Star, FileText, Globe, Save, X, DollarSign, Package2, Image, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUpload } from "@/components/ImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface League {
  id: string;
  name: string;
  country: string;
}

interface Nationality {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  team_name: string;
  season?: string;
  league_id?: string;
  nationality_id?: string;
  is_special_edition: boolean;
  special_edition_notes?: string;
  image_url?: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  stock_quantity: number;
  active: boolean;
  sku?: string;
  category?: string;
  subcategory?: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  promotional_price: string;
  team_name: string;
  season: string;
  league_id: string;
  nationality_id: string;
  is_special_edition: boolean;
  special_edition_notes: string;
  image_url: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string;
  stock_quantity: string;
  sku: string;
  category: string;
  subcategory: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  material: string;
  care_instructions: string;
  weight: string;
  dimensions: string;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [hiddenProducts, setHiddenProducts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('hiddenProducts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Sincronizar produtos ocultos com localStorage
  useEffect(() => {
    localStorage.setItem('hiddenProducts', JSON.stringify(Array.from(hiddenProducts)));
    // Disparar evento customizado para sincronizar entre páginas
    window.dispatchEvent(new CustomEvent('hiddenProductsChanged', {
      detail: Array.from(hiddenProducts)
    }));
  }, [hiddenProducts]);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    promotional_price: "",
    team_name: "",
    season: "",
    league_id: "",
    nationality_id: "",
    is_special_edition: false,
    special_edition_notes: "",
    image_url: "",
    image_url_2: "",
    image_url_3: "",
    image_url_4: "",
    stock_quantity: "",
    sku: "",
    category: "",
    subcategory: "",
    is_featured: false,
    is_new_arrival: false,
    is_on_sale: false,
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    material: "",
    care_instructions: "",
    weight: "",
    dimensions: ""
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [productsRes, leaguesRes, nationalitiesRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('leagues').select('*').order('name'),
        supabase.from('nationalities').select('*').order('name'),
        supabase.from('categories').select('*').order('name')
      ]);

      if (productsRes.error) throw productsRes.error;
      if (leaguesRes.error) throw leaguesRes.error;
      if (nationalitiesRes.error) throw nationalitiesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setLeagues(leaguesRes.data || []);
      setNationalities(nationalitiesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-700 shadow-xl w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-400/30 text-amber-100 border-amber-400/30 backdrop-blur-sm transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-100 mb-1 sm:mb-2">Painel Administrativo</h1>
            <p className="text-amber-200 text-sm sm:text-base lg:text-lg">Gerencie sua loja de camisas de futebol</p>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue={window.location.hash ? window.location.hash.replace('#','') : "products"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-2 gap-1">
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Produtos</span>
              <span className="sm:hidden">Prod.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-product" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Adicionar Produto</span>
              <span className="lg:hidden">Adicionar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clientes</span>
              <span className="sm:hidden">Client.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Relat.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="export" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Exportar</span>
              <span className="sm:hidden">Export.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800">Lista de Produtos</CardTitle>
                <CardDescription className="text-amber-600">
                  Gerencie todos os produtos da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                      <Input
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48 border-amber-200">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 border-amber-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="featured">Em destaque</SelectItem>
                      <SelectItem value="sale">Em promoção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total de Produtos</p>
                          <p className="text-2xl font-bold">{products.length}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Produtos Ativos</p>
                          <p className="text-2xl font-bold">{products.filter(p => p.active).length}</p>
                        </div>
                        <Eye className="h-8 w-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm">Em Destaque</p>
                          <p className="text-2xl font-bold">{products.filter(p => p.is_featured).length}</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100 text-sm">Em Promoção</p>
                          <p className="text-2xl font-bold">{products.filter(p => p.is_on_sale).length}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-red-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-100 text-sm">Produtos Ocultos</p>
                          <p className="text-2xl font-bold">{hiddenProducts.size}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <EyeOff className="h-8 w-8 text-gray-200" />
                          {hiddenProducts.size > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setHiddenProducts(new Set());
                                toast.success('Todos os produtos foram exibidos novamente!');
                              }}
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                              Mostrar Todos
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela de Produtos */}
                <div className="border border-amber-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50">
                        <TableHead className="text-amber-800 font-semibold">Imagem</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Nome</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Time</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Preço</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Estoque</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Status</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products
                        .filter(product => {
                          const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              product.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                              (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
                          
                          const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
                          
                          const matchesStatus = filterStatus === 'all' ||
                                              (filterStatus === 'active' && product.active) ||
                                              (filterStatus === 'inactive' && !product.active) ||
                                              (filterStatus === 'featured' && product.is_featured) ||
                                              (filterStatus === 'sale' && product.is_on_sale);
                          
                          const isNotHidden = !hiddenProducts.has(product.id);
                          
                          return matchesSearch && matchesCategory && matchesStatus && isNotHidden;
                        })
                        .map((product) => (
                          <TableRow key={product.id} className="hover:bg-amber-50/50">
                            <TableCell>
                              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package2 className="h-8 w-8 text-amber-400" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-amber-900">{product.name}</p>
                                {product.sku && (
                                  <p className="text-sm text-amber-600">SKU: {product.sku}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-amber-800">{product.team_name}</TableCell>
                            <TableCell>
                              <div>
                                {product.promotional_price ? (
                                  <>
                                    <p className="font-bold text-green-600">R$ {product.promotional_price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500 line-through">R$ {product.price.toFixed(2)}</p>
                                  </>
                                ) : (
                                  <p className="font-bold text-amber-800">R$ {product.price.toFixed(2)}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={product.stock_quantity > 10 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"}
                                className={product.stock_quantity > 10 ? "bg-green-100 text-green-800" : product.stock_quantity > 0 ? "bg-yellow-100 text-yellow-800" : ""}
                              >
                                {product.stock_quantity} unidades
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={product.active ? "default" : "secondary"} className={product.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {product.active ? "Ativo" : "Inativo"}
                                </Badge>
                                {product.is_featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    Destaque
                                  </Badge>
                                )}
                                {product.is_on_sale && (
                                  <Badge className="bg-red-100 text-red-800">
                                    Promoção
                                  </Badge>
                                )}
                                {product.is_new_arrival && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Novo
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingProduct(product)}
                                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newHiddenProducts = new Set(hiddenProducts);
                                    if (hiddenProducts.has(product.id)) {
                                      newHiddenProducts.delete(product.id);
                                      toast.success('Produto exibido novamente!');
                                    } else {
                                      newHiddenProducts.add(product.id);
                                      toast.success('Produto ocultado da lista!');
                                    }
                                    setHiddenProducts(newHiddenProducts);
                                  }}
                                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                  title="Ocultar/Mostrar produto"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  
                  {products.length === 0 && (
                    <div className="p-8 text-center text-amber-600">
                      <Package className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                      <p className="text-lg font-medium">Nenhum produto encontrado</p>
                      <p className="text-sm">Adicione produtos para começar a gerenciar sua loja</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção de Produtos Ocultos */}
            {hiddenProducts.size > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <EyeOff className="h-5 w-5" />
                    Produtos Ocultos ({hiddenProducts.size})
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Produtos que foram ocultados da visualização principal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {products
                      .filter(product => hiddenProducts.has(product.id))
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package2 className="h-6 w-6 text-amber-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.team_name}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newHiddenProducts = new Set(hiddenProducts);
                              newHiddenProducts.delete(product.id);
                              setHiddenProducts(newHiddenProducts);
                              toast.success('Produto mostrado na interface');
                            }}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Mostrar
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="add-product" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800">Adicionar Produto</CardTitle>
                <CardDescription className="text-amber-600">
                  Adicione um novo produto ao catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">Formulário de produtos em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800">Configurações</CardTitle>
                <CardDescription className="text-amber-600">
                  Configure as opções da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">Funcionalidades de configuração em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800">Clientes</CardTitle>
                <CardDescription className="text-amber-600">
                  Gerencie os clientes e seu relacionamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">Área de clientes em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800">Relatórios e Vendas</CardTitle>
                <CardDescription className="text-amber-600">
                  Visualize insights e desempenho da loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">Relatórios em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800">Exportar Dados</CardTitle>
                <CardDescription className="text-amber-600">
                  Exporte seus dados para análises externas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-amber-700">Exportação em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Exclusão */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  if (!productToDelete) return;
                  
                  try {
                    const { error } = await supabase
                      .from('products')
                      .delete()
                      .eq('id', productToDelete.id);
                    
                    if (error) throw error;
                    
                    await fetchData();
                    toast.success('Produto excluído com sucesso!');
                    setDeleteDialogOpen(false);
                    setProductToDelete(null);
                  } catch (error) {
                    console.error('Erro ao excluir produto:', error);
                    toast.error('Erro ao excluir produto');
                  }
                }}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>
                Edite as informações do produto
              </DialogDescription>
            </DialogHeader>
            
            {editingProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Nome do Produto</Label>
                    <Input
                      id="edit-name"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="border-amber-200"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-team">Nome do Time</Label>
                    <Input
                      id="edit-team"
                      value={editingProduct.team_name}
                      onChange={(e) => setEditingProduct({...editingProduct, team_name: e.target.value})}
                      className="border-amber-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="edit-price">Preço (R$)</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                        className="border-amber-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-promo-price">Preço Promocional (R$)</Label>
                      <Input
                        id="edit-promo-price"
                        type="number"
                        step="0.01"
                        value={editingProduct.promotional_price || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, promotional_price: parseFloat(e.target.value) || undefined})}
                        className="border-amber-200"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="edit-stock">Estoque</Label>
                      <Input
                        id="edit-stock"
                        type="number"
                        value={editingProduct.stock_quantity}
                        onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: parseInt(e.target.value) || 0})}
                        className="border-amber-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-sku">SKU</Label>
                      <Input
                        id="edit-sku"
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                        className="border-amber-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="border-amber-200"
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Configurações e Status */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select 
                      value={editingProduct.category || ''} 
                      onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}
                    >
                      <SelectTrigger className="border-amber-200">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-season">Temporada</Label>
                    <Input
                      id="edit-season"
                      value={editingProduct.season || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, season: e.target.value})}
                      className="border-amber-200"
                      placeholder="Ex: 2023/24"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-image">URL da Imagem</Label>
                    <Input
                      id="edit-image"
                      value={editingProduct.image_url || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                      className="border-amber-200"
                      placeholder="https://..."
                    />
                  </div>
                  
                  {/* Switches */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-active">Produto Ativo</Label>
                      <Switch
                        id="edit-active"
                        checked={editingProduct.active}
                        onCheckedChange={(checked) => setEditingProduct({...editingProduct, active: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-featured">Produto em Destaque</Label>
                      <Switch
                        id="edit-featured"
                        checked={editingProduct.is_featured}
                        onCheckedChange={(checked) => setEditingProduct({...editingProduct, is_featured: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-sale">Em Promoção</Label>
                      <Switch
                        id="edit-sale"
                        checked={editingProduct.is_on_sale}
                        onCheckedChange={(checked) => setEditingProduct({...editingProduct, is_on_sale: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-new">Novo Produto</Label>
                      <Switch
                        id="edit-new"
                        checked={editingProduct.is_new_arrival}
                        onCheckedChange={(checked) => setEditingProduct({...editingProduct, is_new_arrival: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-special">Edição Especial</Label>
                      <Switch
                        id="edit-special"
                        checked={editingProduct.is_special_edition}
                        onCheckedChange={(checked) => setEditingProduct({...editingProduct, is_special_edition: checked})}
                      />
                    </div>
                  </div>
                  
                  {editingProduct.is_special_edition && (
                    <div>
                      <Label htmlFor="edit-special-notes">Notas da Edição Especial</Label>
                      <Textarea
                        id="edit-special-notes"
                        value={editingProduct.special_edition_notes || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, special_edition_notes: e.target.value})}
                        className="border-amber-200"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!editingProduct) return;
                  
                  try {
                    const { error } = await supabase
                      .from('products')
                      .update({
                        name: editingProduct.name,
                        team_name: editingProduct.team_name,
                        price: editingProduct.price,
                        promotional_price: editingProduct.promotional_price,
                        stock_quantity: editingProduct.stock_quantity,
                        sku: editingProduct.sku,
                        description: editingProduct.description,
                        category: editingProduct.category,
                        season: editingProduct.season,
                        image_url: editingProduct.image_url,
                        active: editingProduct.active,
                        is_featured: editingProduct.is_featured,
                        is_on_sale: editingProduct.is_on_sale,
                        is_new_arrival: editingProduct.is_new_arrival,
                        is_special_edition: editingProduct.is_special_edition,
                        special_edition_notes: editingProduct.special_edition_notes,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', editingProduct.id);
                    
                    if (error) throw error;
                    
                    await fetchData();
                    toast.success('Produto atualizado com sucesso!');
                    setEditingProduct(null);
                  } catch (error) {
                    console.error('Erro ao atualizar produto:', error);
                    toast.error('Erro ao atualizar produto');
                  }
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
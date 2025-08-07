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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      promotional_price: product.promotional_price?.toString() || "",
      team_name: product.team_name,
      season: product.season || "",
      league_id: product.league_id || "",
      nationality_id: product.nationality_id || "",
      is_special_edition: product.is_special_edition,
      special_edition_notes: product.special_edition_notes || "",
      image_url: product.image_url || "",
      image_url_2: product.image_url_2 || "",
      image_url_3: product.image_url_3 || "",
      image_url_4: product.image_url_4 || "",
      stock_quantity: product.stock_quantity.toString(),
      sku: product.sku || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      is_featured: product.is_featured,
      is_new_arrival: product.is_new_arrival,
      is_on_sale: product.is_on_sale,
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      seo_keywords: product.seo_keywords || "",
      material: "",
      care_instructions: "",
      weight: "",
      dimensions: ""
    });
    
    // Automatically switch to edit tab
    const editTab = document.querySelector('[value="add-product"]') as HTMLElement;
    if (editTab) {
      editTab.click();
    }
    
    // Scroll to form after tab switch
    setTimeout(() => {
      const formElement = document.querySelector('[data-state="active"] form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200);
  };

  const handleCancelEdit = () => {
    const hasChanges = Object.keys(formData).some(key => {
      if (!editingProduct) return false;
      const formValue = formData[key as keyof ProductFormData];
      const productValue = editingProduct[key as keyof Product];
      return formValue !== (productValue?.toString() || "");
    });

    if (hasChanges) {
      const confirmed = window.confirm("Você tem alterações não salvas. Deseja realmente cancelar?");
      if (!confirmed) return;
    }

    setEditingProduct(null);
    setFormData({
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Gerar SKU automaticamente se não fornecido
      const generateSKU = () => {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `SKU-${timestamp}-${random}`;
      };

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : null,
        team_name: formData.team_name,
        season: formData.season,
        league_id: formData.league_id || null,
        nationality_id: formData.nationality_id || null,
        is_special_edition: formData.is_special_edition,
        special_edition_notes: formData.special_edition_notes,
        image_url: formData.image_url,
        image_url_2: formData.image_url_2,
        image_url_3: formData.image_url_3,
        image_url_4: formData.image_url_4,
        stock_quantity: parseInt(formData.stock_quantity),
        sku: formData.sku || generateSKU(),
        category: formData.category,
        subcategory: formData.subcategory,
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        is_on_sale: formData.is_on_sale,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        seo_keywords: formData.seo_keywords,
        active: true
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
          .select();
      }

      if (result.error) throw result.error;

      toast.success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
      
      // Reset form
      setFormData({
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
      setEditingProduct(null);
      
      // Refresh products
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(`Produto ${!product.active ? 'ativado' : 'desativado'} com sucesso!`);
      fetchData();
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      toast.error('Erro ao alterar status do produto');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast.success('Produto excluído com sucesso!');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === "all" || !filterCategory || product.category === filterCategory;
    const matchesStatus = filterStatus === "all" || !filterStatus || product.active.toString() === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

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
      <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
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
                <h1 className="text-4xl font-bold text-amber-100 mb-2">Painel Administrativo</h1>
                <p className="text-amber-200 text-lg">Gerencie sua loja de camisas de futebol</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Stats Cards */}
              <div className="hidden md:flex gap-4">
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px] border border-amber-400/30">
                  <div className="text-2xl font-bold text-amber-100">{products.length}</div>
                  <div className="text-amber-200 text-sm">Produtos</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px] border border-amber-400/30">
                  <div className="text-2xl font-bold text-amber-100">{products.filter(p => p.active).length}</div>
                  <div className="text-amber-200 text-sm">Ativos</div>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-4 text-center min-w-[100px] border border-amber-400/30">
                  <div className="text-2xl font-bold text-amber-100">{products.filter(p => p.stock_quantity <= 5).length}</div>
                  <div className="text-amber-200 text-sm">Baixo Estoque</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-2">
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800"
            >
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger 
              value="add-product" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800"
            >
              <Plus className="h-4 w-4" />
              {editingProduct ? `Editando: ${editingProduct.name.substring(0, 20)}...` : 'Adicionar Produto'}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black data-[state=active]:font-bold rounded-lg transition-all duration-300 hover:bg-amber-50 text-amber-100 hover:text-amber-800"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-8">
            {/* Dashboard Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black/80 text-sm font-medium">Total de Produtos</p>
                      <p className="text-3xl font-bold">{products.length}</p>
                    </div>
                    <Package className="h-12 w-12 text-black/70" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black/80 text-sm font-medium">Produtos Ativos</p>
                      <p className="text-3xl font-bold">{products.filter(p => p.active).length}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-black/70" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black/80 text-sm font-medium">Baixo Estoque</p>
                      <p className="text-3xl font-bold">{products.filter(p => p.stock_quantity <= 5).length}</p>
                    </div>
                    <BarChart3 className="h-12 w-12 text-black/70" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-yellow-600 text-black border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-black/80 text-sm font-medium">Em Destaque</p>
                      <p className="text-3xl font-bold">{products.filter(p => p.is_featured).length}</p>
                    </div>
                    <Star className="h-12 w-12 text-black/70" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg border-b border-amber-200">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">Lista de Produtos</CardTitle>
                <CardDescription className="text-lg">
                  Gerencie todos os produtos da sua loja com facilidade
                </CardDescription>
                <div className="flex flex-col md:flex-row gap-4 mt-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar produtos, times ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/80 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                      />
                    </div>
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48 bg-white/80 border-gray-200 focus:border-blue-500 rounded-lg">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories
                        .filter(category => category.name && category.name.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-32 bg-white/80 border-gray-200 focus:border-blue-500 rounded-lg">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="true">Ativo</SelectItem>
                      <SelectItem value="false">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredProducts.length === 0 ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl font-medium text-gray-600 mb-2">Nenhum produto encontrado</p>
                      <p className="text-gray-400">Tente ajustar os filtros ou adicione novos produtos</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100">
                          <TableHead className="font-bold text-gray-700">Imagem</TableHead>
                          <TableHead className="font-bold text-gray-700">Nome</TableHead>
                          <TableHead className="font-bold text-gray-700">SKU</TableHead>
                          <TableHead className="font-bold text-gray-700">Time</TableHead>
                          <TableHead className="font-bold text-gray-700">Preço</TableHead>
                          <TableHead className="font-bold text-gray-700">Estoque</TableHead>
                          <TableHead className="font-bold text-gray-700">Status</TableHead>
                          <TableHead className="font-bold text-gray-700">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product, index) => (
                          <TableRow 
                            key={product.id} 
                            className={`hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100 ${
                              editingProduct?.id === product.id 
                                ? 'bg-blue-100/50 border-blue-200' 
                                : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                          >
                            <TableCell className="py-4">
                              {product.image_url ? (
                                <div className="relative group">
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-200"></div>
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-md">
                                  <Package className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold text-gray-800 py-4">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="font-bold">{product.name}</p>
                                  {editingProduct?.id === product.id && (
                                    <Badge variant="secondary" className="text-xs mt-1">✏️ Editando</Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="font-medium text-blue-600">{product.team_name}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex flex-col">
                                <span className={product.promotional_price ? 'line-through text-gray-500 text-sm' : 'font-bold text-lg text-green-600'}>
                                  R$ {product.price.toFixed(2)}
                                </span>
                                {product.promotional_price && (
                                  <span className="text-red-600 font-bold text-lg">
                                    R$ {product.promotional_price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-md ${
                                product.stock_quantity <= 5 
                                  ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' 
                                  : product.stock_quantity <= 10
                                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800'
                                  : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                              }`}>
                                {product.stock_quantity} un.
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex flex-wrap gap-1">
                                <Badge variant={product.active ? 'default' : 'secondary'} className="shadow-sm">
                                  {product.active ? '✓ Ativo' : '✗ Inativo'}
                                </Badge>
                                {product.is_featured && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">⭐ Destaque</Badge>}
                                {product.is_new_arrival && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🆕 Novo</Badge>}
                                {product.is_on_sale && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🔥 Promoção</Badge>}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(product)}
                                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 hover:shadow-md"
                                  title="Editar produto"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleProductStatus(product)}
                                  className={`transition-all duration-200 hover:shadow-md ${
                                    product.active 
                                      ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800'
                                      : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800'
                                  }`}
                                  title={product.active ? 'Desativar produto' : 'Ativar produto'}
                                >
                                  {product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setProductToDelete(product);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 hover:shadow-md transition-all duration-200"
                                  title="Excluir produto"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-8">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-t-lg border-b border-amber-200">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  {editingProduct ? `✏️ Editando: ${editingProduct.name}` : '➕ Adicionar Novo Produto'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {editingProduct ? 'Modifique as informações do produto selecionado' : 'Preencha as informações para criar um novo produto'}
                </CardDescription>
                {editingProduct && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Edit className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-800 text-lg">Modo de Edição Ativo</p>
                          <p className="text-sm text-blue-600">Produto: {editingProduct.name} (ID: {editingProduct.id})</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={editingProduct.active ? 'default' : 'secondary'} className="shadow-sm">
                              {editingProduct.active ? '✓ Ativo' : '✗ Inativo'}
                            </Badge>
                            {editingProduct.is_featured && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">⭐ Destaque</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="bg-white hover:bg-gray-50 border-gray-300 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          ❌ Cancelar Edição
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(editingProduct);
                            setDeleteDialogOpen(true);
                          }}
                          className="bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          🗑️ Excluir Produto
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Informações Básicas */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Informações Básicas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nome do Produto */}
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome do Produto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Camisa do Flamengo 2024"
                          required
                          className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                        />
                      </div>

                      {/* SKU */}
                      <div className="space-y-3">
                        <Label htmlFor="sku" className="text-sm font-semibold text-gray-700">SKU</Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="Ex: FLA-2024-HOME (auto-gerado se vazio)"
                          className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm font-mono"
                        />
                      </div>

                      {/* Time */}
                      <div className="space-y-3">
                        <Label htmlFor="team_name" className="text-sm font-semibold text-gray-700">Time *</Label>
                        <Input
                          id="team_name"
                          value={formData.team_name}
                          onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                          placeholder="Ex: Flamengo"
                          required
                          className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                        />
                      </div>

                      {/* Categoria */}
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Categoria</Label>
                        <Select value={formData.category || undefined} onValueChange={(value) => setFormData({ ...formData, category: value || "" })}>
                          <SelectTrigger className="bg-white/80 border-gray-300 focus:border-blue-500 rounded-lg shadow-sm">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories
                              .filter(category => category.name && category.name.trim() !== '')
                              .map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                  {category.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Temporada */}
                      <div className="space-y-3">
                        <Label htmlFor="season" className="text-sm font-semibold text-gray-700">Temporada</Label>
                        <Input
                          id="season"
                          value={formData.season}
                          onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                          placeholder="Ex: 2023/24"
                          className="bg-white/80 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preços e Estoque */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Preços e Estoque
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Preço */}
                      <div className="space-y-3">
                        <Label htmlFor="price" className="text-sm font-semibold text-gray-700">Preço (R$) *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">R$</span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="89.90"
                            required
                            className="pl-10 bg-white/80 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Preço Promocional */}
                      <div className="space-y-3">
                        <Label htmlFor="promotional_price" className="text-sm font-semibold text-gray-700">Preço Promocional (R$)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">R$</span>
                          <Input
                            id="promotional_price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.promotional_price}
                            onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
                            placeholder="69.90"
                            className="pl-10 bg-white/80 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Quantidade em Estoque */}
                      <div className="space-y-3">
                        <Label htmlFor="stock_quantity" className="text-sm font-semibold text-gray-700">Estoque *</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          min="0"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          placeholder="50"
                          required
                          className="bg-white/80 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status e Configurações */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Status e Configurações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="active"
                            checked={editingProduct ? editingProduct.active : true}
                            onCheckedChange={(checked) => {
                              if (editingProduct) {
                                toggleProductStatus(editingProduct);
                              }
                            }}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Label htmlFor="active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            ✅ Produto {editingProduct?.active ? 'Ativo' : 'Inativo'}
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-6">Produto visível na loja</p>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="is_featured"
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                            className="data-[state=checked]:bg-yellow-500"
                          />
                          <Label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            ⭐ Produto em Destaque
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-6">Aparece na página inicial</p>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="is_new_arrival"
                            checked={formData.is_new_arrival}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_new_arrival: checked })}
                            className="data-[state=checked]:bg-blue-500"
                          />
                          <Label htmlFor="is_new_arrival" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            🆕 Novo Lançamento
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-6">Marca como novidade</p>
                      </div>
                      
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="is_on_sale"
                            checked={formData.is_on_sale}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_on_sale: checked })}
                            className="data-[state=checked]:bg-red-500"
                          />
                          <Label htmlFor="is_on_sale" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            🔥 Em Promoção
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-6">Destaca preço promocional</p>
                      </div>
                    </div>
                  </div>

                  {/* Imagens do Produto */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                    <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Imagens do Produto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Imagem Principal *</Label>
                        <div className="bg-white/80 p-4 rounded-lg border border-gray-300 shadow-sm">
                          <ImageUpload
                            onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                            currentImageUrl={formData.image_url}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Imagem Secundária</Label>
                        <div className="bg-white/80 p-4 rounded-lg border border-gray-300 shadow-sm">
                          <ImageUpload
                            onImageUploaded={(url) => setFormData({ ...formData, image_url_2: url })}
                            currentImageUrl={formData.image_url_2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descrição do Produto
                    </h3>
                    <div className="space-y-3">
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Descrição Detalhada</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva as características, materiais, tecnologias e diferenciais do produto..."
                        rows={5}
                        className="bg-white/80 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg shadow-sm resize-none"
                      />
                      <p className="text-xs text-gray-500">💡 Dica: Uma boa descrição ajuda nas vendas e no SEO</p>
                    </div>
                  </div>

                  {/* Liga e Nacionalidade */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                    <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Liga e Nacionalidade
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="league_id" className="text-sm font-semibold text-gray-700">Liga</Label>
                        <Select value={formData.league_id} onValueChange={(value) => setFormData({ ...formData, league_id: value })}>
                          <SelectTrigger className="bg-white/80 border-gray-300 focus:border-teal-500 rounded-lg shadow-sm">
                            <SelectValue placeholder="Ex: Brasileirão, Premier League" />
                          </SelectTrigger>
                          <SelectContent>
                            {leagues
                              .filter(league => league.id && league.name && league.name.trim() !== '')
                              .map((league) => (
                                <SelectItem key={league.id} value={league.id}>
                                  {league.name} ({league.country})
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="nationality_id" className="text-sm font-semibold text-gray-700">Nacionalidade</Label>
                        <Select value={formData.nationality_id} onValueChange={(value) => setFormData({ ...formData, nationality_id: value })}>
                          <SelectTrigger className="bg-white/80 border-gray-300 focus:border-teal-500 rounded-lg shadow-sm">
                            <SelectValue placeholder="Ex: Brasil, Inglaterra" />
                          </SelectTrigger>
                          <SelectContent>
                            {nationalities
                              .filter(nationality => nationality.id && nationality.name && nationality.name.trim() !== '')
                              .map((nationality) => (
                                <SelectItem key={nationality.id} value={nationality.id}>
                                  {nationality.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Edição Especial */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Edição Especial
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white/80 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="is_special_edition"
                            checked={formData.is_special_edition}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_special_edition: checked })}
                            className="data-[state=checked]:bg-amber-500"
                          />
                          <Label htmlFor="is_special_edition" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            ⭐ Produto de Edição Especial
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-6">Marca como item exclusivo ou limitado</p>
                      </div>

                      {formData.is_special_edition && (
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                          <Label htmlFor="special_edition_notes" className="text-sm font-semibold text-gray-700">Notas da Edição Especial</Label>
                          <Textarea
                            id="special_edition_notes"
                            value={formData.special_edition_notes}
                            onChange={(e) => setFormData({ ...formData, special_edition_notes: e.target.value })}
                            placeholder="Ex: Edição limitada comemorativa dos 125 anos do clube, apenas 1000 unidades produzidas..."
                            rows={4}
                            className="bg-white/80 border-gray-300 focus:border-amber-500 focus:ring-amber-500 rounded-lg shadow-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {editingProduct ? 'Atualizando...' : 'Adicionando...'}
                          </>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            {editingProduct ? (
                              <>
                                <Edit className="h-4 w-4" />
                                <span>Salvar Alterações</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                <span>Adicionar Produto</span>
                              </>
                            )}
                          </div>
                        )}
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Cancelar Edição</span>
                          </div>
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        💡 {editingProduct ? 'Editando produto existente' : 'Criando novo produto'} - Verifique todos os campos antes de salvar
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configurações gerais da loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Funcionalidades de configuração serão implementadas em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{productToDelete?.name}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
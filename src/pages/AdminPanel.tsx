import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, Users, Settings, Download, Loader2, Edit, Trash2, Eye, EyeOff, Search, Filter, BarChart3, TrendingUp, ShoppingCart, Star, FileText, Globe, Save, X, DollarSign, Package2, Image, Zap, Store, Tag, Trophy, Cog, RotateCcw } from "lucide-react";
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
import { productService, leagueService, nationalityService, categoryService, profileService, storeConfigService, type Product as SupabaseProduct, type League as SupabaseLeague, type Nationality as SupabaseNationality, type Category as SupabaseCategory, type SupabaseProfile, type StoreConfig } from "@/lib/supabase";
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
  const [clients, setClients] = useState<SupabaseProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientFilterStatus, setClientFilterStatus] = useState("all");
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<SupabaseProfile | null>(null);
  const [deleteClientDialogOpen, setDeleteClientDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<SupabaseProfile | null>(null);
  const [editClientForm, setEditClientForm] = useState({
    full_name: "",
    phone: "",
    user_type: "user" as "user" | "admin"
  });

  // Estados para configurações
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLeagueName, setNewLeagueName] = useState("");
  const [newLeagueCountry, setNewLeagueCountry] = useState("");
  const [newNationalityName, setNewNationalityName] = useState("");
  const [storeConfig, setStoreConfig] = useState<StoreConfig>({
    id: "",
    store_name: "A&G Imports",
    store_description: "Camisas de futebol premium com qualidade excepcional",
    contact_email: "contato@agimports.com",
    contact_phone: "(11) 99999-9999",
    logo_url: "https://bhhifpcihjpjfmhgxlmz.supabase.co/storage/v1/object/public/product-images/logo/Captura%20de%20tela%202025-08-17%20194111-Photoroom.png",
    show_prices: true,
    show_stock: true,
    show_ratings: true,
    allow_presale: false,
    auto_approve_orders: true,
    minimum_order_value: 0.00,
    order_email_notifications: true,
    low_stock_alerts: true,
    low_stock_threshold: 10
  });
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
      const [products, leagues, nationalities, categories, clients] = await Promise.all([
        productService.getAll(),
        leagueService.getAll(),
        nationalityService.getAll(),
        categoryService.getAll(),
        profileService.getAllWithEmail()
      ]);

      setProducts(products || []);
      setLeagues(leagues || []);
      setNationalities(nationalities || []);
      setCategories(categories || []);
      setClients(clients || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validação básica
      if (!formData.name || !formData.team_name || !formData.price) {
        toast.error('Por favor, preencha os campos obrigatórios');
        return;
      }

      // Preparar dados para inserção
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : null,
        team_name: formData.team_name,
        season: formData.season || null,
        league_id: formData.league_id || null,
        nationality_id: formData.nationality_id || null,
        is_special_edition: formData.is_special_edition,
        special_edition_notes: formData.special_edition_notes || null,
        image_url: formData.image_url || null,
        image_url_2: formData.image_url_2 || null,
        image_url_3: formData.image_url_3 || null,
        image_url_4: formData.image_url_4 || null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        sku: formData.sku || null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        is_featured: formData.is_featured,
        is_new_arrival: formData.is_new_arrival,
        is_on_sale: formData.is_on_sale,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: formData.seo_keywords || null,
        material: formData.material || null,
        care_instructions: formData.care_instructions || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null,
        active: true,
        discount_percentage: formData.promotional_price && formData.price ? 
          Math.round(((parseFloat(formData.price) - parseFloat(formData.promotional_price)) / parseFloat(formData.price)) * 100) : null
      };

      const newProduct = await productService.create(productData);

      toast.success('Produto adicionado com sucesso!');
      resetForm();
      fetchData(); // Recarregar a lista de produtos
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro inesperado ao adicionar produto');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
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

  const handleEditClient = (client: SupabaseProfile) => {
    setClientToEdit(client);
    setEditClientForm({
      full_name: client.full_name || "",
      phone: client.phone || "",
      user_type: client.user_type as "user" | "admin"
    });
    setEditClientDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!clientToEdit) return;
    
    try {
      const updatedClient = await profileService.update(clientToEdit.id, editClientForm);
      setClients(clients.map(c => c.id === clientToEdit.id ? { ...c, ...updatedClient } : c));
      setEditClientDialogOpen(false);
      setClientToEdit(null);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      await profileService.delete(clientToDelete.id);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setDeleteClientDialogOpen(false);
      setClientToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  // Funções para gerenciar configurações
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }
    
    try {
      const newCategory = await categoryService.create({ name: newCategoryName.trim() });
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      toast.success("Categoria adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error("Erro ao adicionar categoria");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryService.delete(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      toast.success("Categoria removida com sucesso!");
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      toast.error("Erro ao remover categoria");
    }
  };

  const handleAddLeague = async () => {
    if (!newLeagueName.trim() || !newLeagueCountry.trim()) {
      toast.error("Nome da liga e país são obrigatórios");
      return;
    }
    
    try {
      const newLeague = await leagueService.create({ 
        name: newLeagueName.trim(),
        country: newLeagueCountry.trim()
      });
      setLeagues([...leagues, newLeague]);
      setNewLeagueName("");
      setNewLeagueCountry("");
      toast.success("Liga adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar liga:', error);
      toast.error("Erro ao adicionar liga");
    }
  };

  const handleDeleteLeague = async (leagueId: string) => {
    try {
      await leagueService.delete(leagueId);
      setLeagues(leagues.filter(l => l.id !== leagueId));
      toast.success("Liga removida com sucesso!");
    } catch (error) {
      console.error('Erro ao remover liga:', error);
      toast.error("Erro ao remover liga");
    }
  };

  const handleAddNationality = async () => {
    if (!newNationalityName.trim()) {
      toast.error("Nome da nacionalidade é obrigatório");
      return;
    }
    
    try {
      const newNationality = await nationalityService.create({ name: newNationalityName.trim() });
      setNationalities([...nationalities, newNationality]);
      setNewNationalityName("");
      toast.success("Nacionalidade adicionada com sucesso!");
    } catch (error) {
      console.error('Erro ao adicionar nacionalidade:', error);
      toast.error("Erro ao adicionar nacionalidade");
    }
  };

  const handleDeleteNationality = async (nationalityId: string) => {
    try {
      await nationalityService.delete(nationalityId);
      setNationalities(nationalities.filter(n => n.id !== nationalityId));
      toast.success("Nacionalidade removida com sucesso!");
    } catch (error) {
      console.error('Erro ao remover nacionalidade:', error);
      toast.error("Erro ao remover nacionalidade");
    }
  };

  const handlePhoneChange = async (phone: string) => {
    // Sanitizar o número removendo caracteres especiais
    const sanitizedPhone = phone.replace(/[^\d]/g, '');
    
    // Atualizar o estado local
    const updatedConfig = { ...storeConfig, contact_phone: phone };
    setStoreConfig(updatedConfig);
    
    // Salvar automaticamente no banco de dados
    try {
      await storeConfigService.updateConfig(updatedConfig);
      toast.success("Número de telefone atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar telefone:', error);
      toast.error("Erro ao salvar número de telefone");
    }
  };

  const handleSaveStoreConfig = async () => {
    try {
      await storeConfigService.updateConfig(storeConfig);
      toast.success("Configurações da loja salvas com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações");
    }
  };

  const loadStoreConfig = async () => {
    try {
      const config = await storeConfigService.getConfig();
      if (config) {
        setStoreConfig(config);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Carregar configurações da loja ao montar o componente
  useEffect(() => {
    loadStoreConfig();
  }, []);

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
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5 min-h-screen">
      {/* Dynamic Background Elements matching homepage */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-80 h-80 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl animate-pulse bottom-0 left-0" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-primary/30 rotate-45 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-accent/40 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-primary/50 animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modern Header with Homepage-style gradient */}
      <div className="relative bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-xl border-b border-primary/20 shadow-xl w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-background/50 hover:bg-primary/10 text-foreground border-primary/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground">
              Painel <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Administrativo</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Gerencie sua loja com estilo e eficiência</p>
          </div>
        </div>
      </div>

      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue={window.location.hash ? window.location.hash.replace('#','') : "products"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-background/80 backdrop-blur-xl border border-primary/20 shadow-lg rounded-2xl p-2 gap-1">
            <TabsTrigger 
              value="products" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:font-bold rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Produtos</span>
              <span className="sm:hidden">Prod.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="add-product" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:font-bold rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Adicionar Produto</span>
              <span className="lg:hidden">Adicionar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:font-bold rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config.</span>
            </TabsTrigger>

            <TabsTrigger 
              value="clients" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:font-bold rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xl:inline">Clientes</span>
              <span className="xl:hidden">Clientes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:font-bold rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xl:inline">Pedidos</span>
              <span className="xl:hidden">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:font-bold rounded-xl transition-all duration-300 hover:bg-primary/10 text-foreground hover:scale-105 text-xs sm:text-sm px-2 sm:px-3"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Analytics</span>
              <span className="lg:hidden">Análit.</span>
            </TabsTrigger>
          </TabsList>

          {/* Apply card shells with homepage style */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-black">Produtos</CardTitle>
                <CardDescription className="text-muted-foreground">Gerencie seus itens do catálogo</CardDescription>
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
                <form onSubmit={handleAddProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-amber-800">Informações Básicas</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-amber-700">Nome do Produto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Camisa do Flamengo 2024"
                          required
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-amber-700">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Descrição detalhada do produto..."
                          rows={4}
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="team_name" className="text-amber-700">Nome do Time *</Label>
                        <Input
                          id="team_name"
                          value={formData.team_name}
                          onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                          placeholder="Ex: Flamengo"
                          required
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-amber-700">Preço *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            required
                            className="border-amber-200 focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="promotional_price" className="text-amber-700">Preço Promocional</Label>
                          <Input
                            id="promotional_price"
                            type="number"
                            step="0.01"
                            value={formData.promotional_price}
                            onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
                            placeholder="0.00"
                            className="border-amber-200 focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Categorização */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-amber-800">Categorização</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="league_id" className="text-amber-700">Liga</Label>
                        <Select value={formData.league_id} onValueChange={(value) => setFormData({ ...formData, league_id: value })}>
                          <SelectTrigger className="border-amber-200 focus:border-amber-400">
                            <SelectValue placeholder="Selecione uma liga" />
                          </SelectTrigger>
                          <SelectContent>
                            {leagues.map((league) => (
                              <SelectItem key={league.id} value={league.id}>
                                {league.name} ({league.country})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nationality_id" className="text-amber-700">Nacionalidade</Label>
                        <Select value={formData.nationality_id} onValueChange={(value) => setFormData({ ...formData, nationality_id: value })}>
                          <SelectTrigger className="border-amber-200 focus:border-amber-400">
                            <SelectValue placeholder="Selecione uma nacionalidade" />
                          </SelectTrigger>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality.id} value={nationality.id}>
                                {nationality.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="season" className="text-amber-700">Temporada</Label>
                        <Input
                          id="season"
                          value={formData.season}
                          onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                          placeholder="Ex: 2024/2025"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-amber-700">Categoria</Label>
                          <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Ex: Camisas"
                            className="border-amber-200 focus:border-amber-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subcategory" className="text-amber-700">Subcategoria</Label>
                          <Input
                            id="subcategory"
                            value={formData.subcategory}
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                            placeholder="Ex: Titular"
                            className="border-amber-200 focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Imagens */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-800">Imagens do Produto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="image_url" className="text-amber-700">Imagem Principal</Label>
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="URL da imagem principal"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url_2" className="text-amber-700">Imagem 2</Label>
                        <Input
                          id="image_url_2"
                          value={formData.image_url_2}
                          onChange={(e) => setFormData({ ...formData, image_url_2: e.target.value })}
                          placeholder="URL da segunda imagem"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url_3" className="text-amber-700">Imagem 3</Label>
                        <Input
                          id="image_url_3"
                          value={formData.image_url_3}
                          onChange={(e) => setFormData({ ...formData, image_url_3: e.target.value })}
                          placeholder="URL da terceira imagem"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="image_url_4" className="text-amber-700">Imagem 4</Label>
                        <Input
                          id="image_url_4"
                          value={formData.image_url_4}
                          onChange={(e) => setFormData({ ...formData, image_url_4: e.target.value })}
                          placeholder="URL da quarta imagem"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Estoque e SKU */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity" className="text-amber-700">Quantidade em Estoque</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="0"
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku" className="text-amber-700">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Ex: FLA-2024-HOME"
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-amber-700">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="0.00"
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Características Especiais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-800">Características Especiais</h3>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_special_edition"
                          checked={formData.is_special_edition}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_special_edition: checked })}
                        />
                        <Label htmlFor="is_special_edition" className="text-amber-700">Edição Especial</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_featured"
                          checked={formData.is_featured}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                        />
                        <Label htmlFor="is_featured" className="text-amber-700">Produto em Destaque</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_new_arrival"
                          checked={formData.is_new_arrival}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_new_arrival: checked })}
                        />
                        <Label htmlFor="is_new_arrival" className="text-amber-700">Novo Lançamento</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_on_sale"
                          checked={formData.is_on_sale}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_on_sale: checked })}
                        />
                        <Label htmlFor="is_on_sale" className="text-amber-700">Em Promoção</Label>
                      </div>
                    </div>

                    {formData.is_special_edition && (
                      <div className="space-y-2">
                        <Label htmlFor="special_edition_notes" className="text-amber-700">Notas da Edição Especial</Label>
                        <Textarea
                          id="special_edition_notes"
                          value={formData.special_edition_notes}
                          onChange={(e) => setFormData({ ...formData, special_edition_notes: e.target.value })}
                          placeholder="Descreva o que torna este produto uma edição especial..."
                          rows={3}
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Informações Adicionais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-800">Informações Adicionais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material" className="text-amber-700">Material</Label>
                        <Input
                          id="material"
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                          placeholder="Ex: 100% Poliéster"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions" className="text-amber-700">Dimensões</Label>
                        <Input
                          id="dimensions"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          placeholder="Ex: P, M, G, GG"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="care_instructions" className="text-amber-700">Instruções de Cuidado</Label>
                      <Textarea
                        id="care_instructions"
                        value={formData.care_instructions}
                        onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                        placeholder="Instruções de lavagem e cuidados..."
                        rows={3}
                        className="border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-amber-800">SEO</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="seo_title" className="text-amber-700">Título SEO</Label>
                        <Input
                          id="seo_title"
                          value={formData.seo_title}
                          onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                          placeholder="Título otimizado para SEO"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seo_description" className="text-amber-700">Descrição SEO</Label>
                        <Textarea
                          id="seo_description"
                          value={formData.seo_description}
                          onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                          placeholder="Descrição otimizada para SEO"
                          rows={3}
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seo_keywords" className="text-amber-700">Palavras-chave SEO</Label>
                        <Input
                          id="seo_keywords"
                          value={formData.seo_keywords}
                          onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                          placeholder="palavra1, palavra2, palavra3"
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Formulário
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Adicionar Produto
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configurações da Loja */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Configurações da Loja
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Configure informações básicas da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name" className="text-amber-700">Nome da Loja</Label>
                    <Input
                      id="store-name"
                      value={storeConfig.store_name}
                      onChange={(e) => setStoreConfig({ ...storeConfig, store_name: e.target.value })}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-description" className="text-amber-700">Descrição</Label>
                    <Textarea
                      id="store-description"
                      value={storeConfig.store_description}
                      onChange={(e) => setStoreConfig({ ...storeConfig, store_description: e.target.value })}
                      className="border-amber-200 focus:border-amber-400"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email" className="text-amber-700">Email de Contato</Label>
                    <Input
                        id="store-email"
                        type="email"
                        value={storeConfig.contact_email}
                        onChange={(e) => setStoreConfig({ ...storeConfig, contact_email: e.target.value })}
                        className="border-amber-200 focus:border-amber-400"
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone" className="text-amber-700">Telefone (WhatsApp)</Label>
                    <Input
                        id="store-phone"
                        placeholder="Ex: (11) 99999-9999 ou 5511999999999"
                        value={storeConfig.contact_phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                      />
                    <p className="text-xs text-amber-600">
                      Este número será usado para o suporte via WhatsApp. Inclua o DDI do país.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-logo" className="text-amber-700">Logo da Loja</Label>
                    <Input
                        id="store-logo"
                        placeholder="URL da logo (ex: https://bhhifpcihjpjfmhgxlmz.supabase.co/storage/v1/object/public/product-images/logo/Captura%20de%20tela%202025-08-17%20194111-Photoroom.png)"
                        value={storeConfig.logo_url || ''}
                        onChange={(e) => setStoreConfig({ ...storeConfig, logo_url: e.target.value })}
                        className="border-amber-200 focus:border-amber-400"
                      />
                    <p className="text-xs text-amber-600">
                      URL da logo que será exibida na loja. Use arquivos SVG para melhor qualidade.
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveStoreConfig}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>

              {/* Gerenciar Categorias */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Gerenciar Categorias
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Adicione e gerencie categorias de produtos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova categoria..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="border-amber-200 focus:border-amber-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddCategory}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                        <span className="text-amber-800 font-medium">{category.name}</span>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gerenciar Ligas */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Gerenciar Ligas
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Adicione e gerencie ligas de futebol
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da liga..."
                        value={newLeagueName}
                        onChange={(e) => setNewLeagueName(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                      />
                      <Input
                        placeholder="País..."
                        value={newLeagueCountry}
                        onChange={(e) => setNewLeagueCountry(e.target.value)}
                        className="border-amber-200 focus:border-amber-400"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddLeague}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {leagues.map((league) => (
                      <div key={league.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                        <div className="flex flex-col">
                          <span className="text-amber-800 font-medium">{league.name}</span>
                          <span className="text-amber-600 text-sm">{league.country}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteLeague(league.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gerenciar Nacionalidades */}
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Gerenciar Nacionalidades
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Adicione e gerencie nacionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova nacionalidade..."
                      value={newNationalityName}
                      onChange={(e) => setNewNationalityName(e.target.value)}
                      className="border-amber-200 focus:border-amber-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNationality()}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddNationality}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {nationalities.map((nationality) => (
                      <div key={nationality.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                        <span className="text-amber-800 font-medium">{nationality.name}</span>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteNationality(nationality.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configurações Avançadas */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  Configurações Avançadas
                </CardTitle>
                <CardDescription className="text-amber-600">
                  Configure opções avançadas da loja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-amber-800">Exibição</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-prices" className="text-amber-700">Mostrar Preços</Label>
                        <Switch 
                          id="show-prices" 
                          checked={storeConfig.show_prices}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, show_prices: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-stock" className="text-amber-700">Mostrar Estoque</Label>
                        <Switch 
                          id="show-stock" 
                          checked={storeConfig.show_stock}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, show_stock: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-ratings" className="text-amber-700">Mostrar Avaliações</Label>
                        <Switch 
                          id="show-ratings" 
                          checked={storeConfig.show_ratings}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, show_ratings: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-amber-800">Vendas</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-backorder" className="text-amber-700">Permitir Pré-venda</Label>
                        <Switch 
                          id="allow-backorder" 
                          checked={storeConfig.allow_presale}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, allow_presale: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-approve" className="text-amber-700">Aprovar Pedidos Automaticamente</Label>
                        <Switch 
                          id="auto-approve" 
                          checked={storeConfig.auto_approve_orders}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, auto_approve_orders: checked })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="min-order" className="text-amber-700">Pedido Mínimo (R$)</Label>
                        <Input
                          id="min-order"
                          type="number"
                          value={storeConfig.minimum_order_value}
                      onChange={(e) => setStoreConfig({ ...storeConfig, minimum_order_value: parseFloat(e.target.value) || 0 })}
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-amber-800">Notificações</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="text-amber-700">Email de Pedidos</Label>
                        <Switch 
                          id="email-notifications" 
                          checked={storeConfig.order_email_notifications}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, order_email_notifications: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="low-stock-alerts" className="text-amber-700">Alerta de Estoque Baixo</Label>
                        <Switch 
                          id="low-stock-alerts" 
                          checked={storeConfig.low_stock_alerts}
                          onCheckedChange={(checked) => setStoreConfig({ ...storeConfig, low_stock_alerts: checked })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock-threshold" className="text-amber-700">Limite de Estoque Baixo</Label>
                        <Input
                          id="stock-threshold"
                          type="number"
                          value={storeConfig.low_stock_threshold}
                          onChange={(e) => setStoreConfig({ ...storeConfig, low_stock_threshold: Number(e.target.value) })}
                          className="border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-amber-200">
                  <div className="flex gap-4">
                    <Button 
                      onClick={handleSaveStoreConfig}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Todas as Configurações
                    </Button>
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restaurar Padrões
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-8">
            {/* Estatísticas de Clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total de Clientes</p>
                      <p className="text-2xl font-bold">{clients.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Clientes Ativos</p>
                      <p className="text-2xl font-bold">{clients.filter(client => client.user_type === 'user').length}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Novos Este Mês</p>
                      <p className="text-2xl font-bold">{clients.filter(client => {
                        const createdAt = new Date(client.created_at);
                        const now = new Date();
                        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        return createdAt >= thisMonth;
                      }).length}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Administradores</p>
                      <p className="text-2xl font-bold">{clients.filter(client => client.user_type === 'admin').length}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gerenciamento de Clientes */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Gerenciar Clientes
                </CardTitle>
                <CardDescription className="text-amber-600">
                  Visualize e gerencie informações dos seus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                      <Input
                        placeholder="Buscar clientes por nome ou email..."
                        className="pl-10 border-amber-200 focus:border-amber-400"
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={clientFilterStatus} onValueChange={setClientFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 border-amber-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48 border-amber-200">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela de Clientes */}
                <div className="border border-amber-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50">
                        <TableHead className="text-amber-800 font-semibold">Cliente</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Email</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Pedidos</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Total Gasto</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Último Pedido</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Status</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients
                        .filter((client) => {
                          const matchesSearch = !clientSearchTerm || 
                            (client.full_name && client.full_name.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
                            (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()));
                          
                          const matchesStatus = clientFilterStatus === 'all' || client.user_type === clientFilterStatus;
                          
                          return matchesSearch && matchesStatus;
                        })
                        .map((client) => {
                        const initials = client.full_name 
                          ? client.full_name.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
                          : 'NN';
                        const createdYear = new Date(client.created_at).getFullYear();
                        const gradients = [
                          'from-blue-500 to-purple-500',
                          'from-pink-500 to-red-500',
                          'from-green-500 to-teal-500',
                          'from-orange-500 to-yellow-500',
                          'from-purple-500 to-indigo-500'
                        ];
                        const gradientIndex = client.id.charCodeAt(0) % gradients.length;
                        
                        return (
                          <TableRow key={client.id} className="hover:bg-amber-50/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-r ${gradients[gradientIndex]} rounded-full flex items-center justify-center text-white font-bold`}>
                                  {initials}
                                </div>
                                <div>
                                  <p className="font-medium text-amber-900">{client.full_name || 'Nome não informado'}</p>
                                  <p className="text-sm text-amber-600">Cliente desde {createdYear}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-amber-700">{client.email || 'Email não informado'}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">0 pedidos</Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">R$ 0,00</TableCell>
                            <TableCell className="text-amber-700">{new Date(client.created_at).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              <Badge className={`${
                                client.user_type === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {client.user_type === 'admin' ? 'Admin' : 'Ativo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                  onClick={() => handleEditClient(client)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setClientToDelete(client);
                                    setDeleteClientDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-amber-600">Mostrando 1-{Math.min(clients.filter((client) => {
                    const matchesSearch = !clientSearchTerm || 
                      (client.full_name && client.full_name.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
                      (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()));
                    
                    const matchesStatus = clientFilterStatus === 'all' || client.user_type === clientFilterStatus;
                    
                    return matchesSearch && matchesStatus;
                  }).length, 10)} de {clients.filter((client) => {
                    const matchesSearch = !clientSearchTerm || 
                      (client.full_name && client.full_name.toLowerCase().includes(clientSearchTerm.toLowerCase())) ||
                      (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()));
                    
                    const matchesStatus = clientFilterStatus === 'all' || client.user_type === clientFilterStatus;
                    
                    return matchesSearch && matchesStatus;
                  }).length} clientes</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Anterior
                    </Button>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      1
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      2
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      3
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise de Segmentação */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Segmentação de Clientes
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Distribuição dos clientes por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-amber-700">Clientes VIP</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">156 (12.5%)</p>
                        <p className="text-sm text-amber-600">R$ 45.000/mês</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-amber-700">Clientes Ativos</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">736 (59.0%)</p>
                        <p className="text-sm text-amber-600">R$ 28.000/mês</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-amber-700">Clientes Novos</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">245 (19.6%)</p>
                        <p className="text-sm text-amber-600">R$ 8.500/mês</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-amber-700">Clientes Inativos</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">110 (8.9%)</p>
                        <p className="text-sm text-amber-600">R$ 0/mês</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Ferramentas para engajamento de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Enviar Newsletter
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    <Star className="h-4 w-4 mr-2" />
                    Programa de Fidelidade
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Campanhas Promocionais
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Lista de Clientes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-8">
            {/* Estatísticas de Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total de Pedidos</p>
                      <p className="text-2xl font-bold">2,847</p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Pedidos Entregues</p>
                      <p className="text-2xl font-bold">2,456</p>
                    </div>
                    <div className="h-8 w-8 bg-green-400 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Pedidos Pendentes</p>
                      <p className="text-2xl font-bold">234</p>
                    </div>
                    <div className="h-8 w-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Receita Total</p>
                      <p className="text-2xl font-bold">R$ 485K</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gerenciamento de Pedidos */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-amber-800 flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  Gerenciar Pedidos
                </CardTitle>
                <CardDescription className="text-amber-600">
                  Visualize e gerencie todos os pedidos da sua loja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filtros e Busca */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
                      <Input
                        placeholder="Buscar pedidos por ID ou cliente..."
                        className="pl-10 border-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48 border-amber-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="shipped">Enviado</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48 border-amber-200">
                      <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                      <SelectItem value="quarter">Último trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabela de Pedidos */}
                <div className="border border-amber-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50">
                        <TableHead className="text-amber-800 font-semibold">Pedido</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Cliente</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Produtos</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Total</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Data</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Status</TableHead>
                        <TableHead className="text-amber-800 font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Pedido 1 */}
                      <TableRow className="hover:bg-amber-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">#PED-2024-001</p>
                            <p className="text-sm text-amber-600">22/01/2024</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              JS
                            </div>
                            <div>
                              <p className="font-medium text-amber-900">João Silva</p>
                              <p className="text-sm text-amber-600">joao.silva@email.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">Camisa Brasil 2024</p>
                            <p className="text-sm text-amber-600">Tamanho: M, Qtd: 2</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">R$ 398,00</TableCell>
                        <TableCell className="text-amber-700">22/01/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">Entregue</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Pedido 2 */}
                      <TableRow className="hover:bg-amber-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">#PED-2024-002</p>
                            <p className="text-sm text-amber-600">Pagamento: Cartão</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              MS
                            </div>
                            <div>
                              <p className="font-medium text-amber-900">Maria Santos</p>
                              <p className="text-sm text-amber-600">maria.santos@email.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">Camisa Real Madrid</p>
                            <p className="text-sm text-amber-600">Tamanho: G, Qtd: 1</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">R$ 289,00</TableCell>
                        <TableCell className="text-amber-700">21/01/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">Enviado</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Pedido 3 */}
                      <TableRow className="hover:bg-amber-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">#PED-2024-003</p>
                            <p className="text-sm text-amber-600">Pagamento: PIX</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              PC
                            </div>
                            <div>
                              <p className="font-medium text-amber-900">Pedro Costa</p>
                              <p className="text-sm text-amber-600">pedro.costa@email.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">Camisa Barcelona</p>
                            <p className="text-sm text-amber-600">Tamanho: M, Qtd: 1</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">R$ 325,00</TableCell>
                        <TableCell className="text-amber-700">20/01/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-orange-100 text-orange-800">Processando</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Pedido 4 */}
                      <TableRow className="hover:bg-amber-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">#PED-2024-004</p>
                            <p className="text-sm text-amber-600">19/01/2024</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              AL
                            </div>
                            <div>
                              <p className="font-medium text-amber-900">Ana Lima</p>
                              <p className="text-sm text-amber-600">ana.lima@email.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">Camisa PSG</p>
                            <p className="text-sm text-amber-600">Tamanho: P, Qtd: 1</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">R$ 275,00</TableCell>
                        <TableCell className="text-amber-700">19/01/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Pedido 5 */}
                      <TableRow className="hover:bg-amber-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">#PED-2024-005</p>
                            <p className="text-sm text-amber-600">Pagamento: PIX</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              RF
                            </div>
                            <div>
                              <p className="font-medium text-amber-900">Roberto Ferreira</p>
                              <p className="text-sm text-amber-600">roberto.ferreira@email.com</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-amber-900">Camisa Liverpool</p>
                            <p className="text-sm text-amber-600">Tamanho: GG, Qtd: 1</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">R$ 0,00</TableCell>
                        <TableCell className="text-amber-700">18/01/2024</TableCell>
                        <TableCell>
                          <Badge className="bg-red-100 text-red-800">Cancelado</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-amber-600">Mostrando 1-5 de 2,847 pedidos</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Anterior
                    </Button>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      1
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      2
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      3
                    </Button>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise de Vendas e Ações Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análise de Vendas
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Desempenho de vendas por período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-amber-700">Hoje</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">45 pedidos</p>
                        <p className="text-sm text-amber-600">R$ 8.750</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-amber-700">Esta Semana</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">312 pedidos</p>
                        <p className="text-sm text-amber-600">R$ 58.900</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-amber-700">Este Mês</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">1.247 pedidos</p>
                        <p className="text-sm text-amber-600">R$ 235.600</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-amber-700">Este Ano</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900">2.847 pedidos</p>
                        <p className="text-sm text-amber-600">R$ 485.200</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Ferramentas para gerenciar pedidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Pedido Manual
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    <Package className="h-4 w-4 mr-2" />
                    Atualizar Status em Lote
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório de Vendas
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Pedidos
                  </Button>
                </CardContent>
              </Card>
            </div>
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

          <TabsContent value="analytics" className="space-y-8">
            {/* Dashboard de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Vendas Totais</p>
                      <p className="text-2xl font-bold">R$ 485.200</p>
                      <p className="text-blue-200 text-xs">+12% vs mês anterior</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Produtos Vendidos</p>
                      <p className="text-2xl font-bold">3.247</p>
                      <p className="text-green-200 text-xs">+8% vs mês anterior</p>
                    </div>
                    <Package className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Novos Clientes</p>
                      <p className="text-2xl font-bold">847</p>
                      <p className="text-purple-200 text-xs">+15% vs mês anterior</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Taxa de Conversão</p>
                      <p className="text-2xl font-bold">3.8%</p>
                      <p className="text-orange-200 text-xs">+0.5% vs mês anterior</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Análises */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Vendas por Período
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Desempenho de vendas nos últimos 12 meses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Janeiro</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <span className="text-amber-900 font-semibold text-sm">R$ 42K</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Fevereiro</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                        <span className="text-amber-900 font-semibold text-sm">R$ 46K</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Março</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                        <span className="text-amber-900 font-semibold text-sm">R$ 39K</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Abril</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                        <span className="text-amber-900 font-semibold text-sm">R$ 48K</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Maio</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <div className="w-full bg-amber-100 rounded-full h-2">
                          <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <span className="text-amber-900 font-semibold text-sm">R$ 51K</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Produtos Mais Vendidos
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Top 5 produtos por quantidade vendida
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">Camisa Brasil 2024</p>
                          <p className="text-sm text-amber-600">347 vendas</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">R$ 68.930</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">Camisa Real Madrid</p>
                          <p className="text-sm text-amber-600">289 vendas</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">R$ 83.521</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">Camisa Barcelona</p>
                          <p className="text-sm text-amber-600">234 vendas</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">R$ 76.050</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          4
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">Camisa PSG</p>
                          <p className="text-sm text-amber-600">198 vendas</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">R$ 54.450</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          5
                        </div>
                        <div>
                          <p className="font-medium text-amber-900">Camisa Liverpool</p>
                          <p className="text-sm text-amber-600">167 vendas</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">R$ 45.825</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análises Detalhadas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Origem dos Clientes
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Distribuição geográfica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">São Paulo</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-amber-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="text-amber-900 font-semibold text-sm">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Rio de Janeiro</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-amber-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-amber-900 font-semibold text-sm">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Minas Gerais</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-amber-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-amber-900 font-semibold text-sm">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700">Outros Estados</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-amber-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{width: '70%'}}></div>
                      </div>
                      <span className="text-amber-900 font-semibold text-sm">28%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Perfil dos Clientes
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Dados demográficos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-amber-700 font-medium mb-2">Faixa Etária</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">18-25 anos</span>
                        <span className="text-amber-900 font-semibold">28%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">26-35 anos</span>
                        <span className="text-amber-900 font-semibold">42%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">36-45 anos</span>
                        <span className="text-amber-900 font-semibold">22%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">46+ anos</span>
                        <span className="text-amber-900 font-semibold">8%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-amber-700 font-medium mb-2">Gênero</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Masculino</span>
                        <span className="text-amber-900 font-semibold">68%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600">Feminino</span>
                        <span className="text-amber-900 font-semibold">32%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Métricas de Crescimento
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Indicadores de performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Crescimento Mensal</span>
                      <Badge className="bg-green-100 text-green-800">+12.5%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Retenção de Clientes</span>
                      <Badge className="bg-blue-100 text-blue-800">78%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Ticket Médio</span>
                      <Badge className="bg-purple-100 text-purple-800">R$ 149</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Satisfação</span>
                      <Badge className="bg-yellow-100 text-yellow-800">4.8/5</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-amber-700 text-sm">Tempo Médio no Site</span>
                      <Badge className="bg-orange-100 text-orange-800">5m 32s</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações e Relatórios */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-amber-800 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatórios e Exportações
                </CardTitle>
                <CardDescription className="text-amber-600">
                  Gere relatórios detalhados para análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatório de Vendas
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    <Users className="h-4 w-4 mr-2" />
                    Relatório de Clientes
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                    <Package className="h-4 w-4 mr-2" />
                    Relatório de Produtos
                  </Button>
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                </div>
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
                    await productService.delete(productToDelete.id);
                    
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
                    const updateData = {
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
                      special_edition_notes: editingProduct.special_edition_notes
                    };
                    
                    await productService.update(editingProduct.id, updateData);
                    
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

        {/* Dialog de Edição de Cliente */}
        <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                <Input
                  value={editClientForm.full_name}
                  onChange={(e) => setEditClientForm({...editClientForm, full_name: e.target.value})}
                  placeholder="Nome completo do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <Input
                  value={editClientForm.phone}
                  onChange={(e) => setEditClientForm({...editClientForm, phone: e.target.value})}
                  placeholder="Telefone do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Usuário</label>
                <Select value={editClientForm.user_type} onValueChange={(value: "user" | "admin") => setEditClientForm({...editClientForm, user_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditClientDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateClient} className="bg-amber-600 hover:bg-amber-700">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão de Cliente */}
        <Dialog open={deleteClientDialogOpen} onOpenChange={setDeleteClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Tem certeza que deseja excluir o cliente <strong>{clientToDelete?.full_name}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteClientDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700">
                Excluir Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPanel;
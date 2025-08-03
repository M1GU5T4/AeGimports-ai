import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, Users, Settings, Download, Loader2, Edit, Trash2, Eye, EyeOff, Search, Filter } from "lucide-react";
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
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('[data-state="active"] form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="add-product" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Produtos</CardTitle>
                <CardDescription>
                  Gerencie todos os produtos da sua loja
                </CardDescription>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por categoria" />
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
                    <SelectTrigger className="w-32">
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className={editingProduct?.id === product.id ? 'bg-blue-50' : ''}>
                        <TableCell>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {product.name}
                            {editingProduct?.id === product.id && (
                              <Badge variant="secondary" className="text-xs">Editando</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.team_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={product.promotional_price ? 'line-through text-gray-500 text-sm' : ''}>
                              R$ {product.price.toFixed(2)}
                            </span>
                            {product.promotional_price && (
                              <span className="text-red-600 font-semibold">
                                R$ {product.promotional_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={product.stock_quantity <= 5 ? 'text-red-600 font-semibold' : ''}>
                            {product.stock_quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Badge variant={product.active ? 'default' : 'secondary'}>
                              {product.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            {product.is_featured && <Badge variant="outline">Destaque</Badge>}
                            {product.is_new_arrival && <Badge variant="outline">Novo</Badge>}
                            {product.is_on_sale && <Badge variant="outline">Promoção</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="hover:bg-blue-50"
                              title="Editar produto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleProductStatus(product)}
                              className="hover:bg-yellow-50"
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
                              className="hover:bg-red-100"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</CardTitle>
                <CardDescription>
                  {editingProduct ? 'Edite as informações básicas do produto' : 'Preencha as informações básicas do produto'}
                </CardDescription>
                {editingProduct && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-sm">
                      Editando: {editingProduct.name} (ID: {editingProduct.id})
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancelar Edição
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campos básicos de edição */}
                  <div className="space-y-6">
                    {/* Foto do Produto */}
                    <div className="space-y-2">
                      <Label>Foto do Produto</Label>
                      <ImageUpload
                        onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                        currentImageUrl={formData.image_url}
                      />
                    </div>

                    {/* Preço */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Quantidade em Estoque */}
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Quantidade em Estoque *</Label>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva o produto..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingProduct ? 'Atualizando...' : 'Adicionando...'}
                      </>
                    ) : (
                      editingProduct ? 'Atualizar Produto' : 'Adicionar Produto'
                    )}
                  </Button>
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
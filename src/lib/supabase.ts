import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bhhifpcihjpjfmhgxlmz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaGlmcGNpaGpwamZtaGd4bG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTYzOTUsImV4cCI6MjA2OTMzMjM5NX0.rWS9Wpm7iorsSH1uOcPX0GABFSxJnj_mQGCMcdU_hZo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco
export interface League {
  id: string
  name: string
  country: string
  logo_url?: string
  created_at: string
}

export interface Nationality {
  id: string
  name: string
  flag_url?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  parent_id?: string
  is_active: boolean
  sort_order?: number
  created_at: string
  updated_at: string
}

export interface SupabaseCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  user_type?: string;
  created_at?: string;
  updated_at?: string;
  email?: string; // Vem do join com auth.users
}

export interface CreateProfileData {
  user_id: string;
  full_name?: string;
  phone?: string;
  user_type?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  user_type?: string;
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  team_name: string
  league_id?: string
  nationality_id?: string
  season?: string
  is_special_edition?: boolean
  special_edition_notes?: string
  image_url?: string
  image_url_2?: string
  image_url_3?: string
  image_url_4?: string
  stock_quantity?: number
  active?: boolean
  sku?: string
  promotional_price?: number
  discount_percentage?: number
  category?: string
  subcategory?: string
  is_featured?: boolean
  is_new_arrival?: boolean
  is_on_sale?: boolean
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  min_stock_alert?: number
  weight?: number
  dimensions?: string
  material?: string
  care_instructions?: string
  created_at: string
  updated_at: string
}

// Funções para produtos
export const productService = {
  // Buscar todos os produtos
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        leagues(id, name, country),
        nationalities(id, name, flag_url)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Buscar produto por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        leagues(id, name, country),
        nationalities(id, name, flag_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Criar novo produto
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar produto
  async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Deletar produto
  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Buscar produtos com filtros
  async search(filters: {
    search?: string
    category?: string
    league_id?: string
    nationality_id?: string
    is_featured?: boolean
    is_on_sale?: boolean
    active?: boolean
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        leagues(id, name, country),
        nationalities(id, name, flag_url)
      `)
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,team_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    
    if (filters.league_id) {
      query = query.eq('league_id', filters.league_id)
    }
    
    if (filters.nationality_id) {
      query = query.eq('nationality_id', filters.nationality_id)
    }
    
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    
    if (filters.is_on_sale !== undefined) {
      query = query.eq('is_on_sale', filters.is_on_sale)
    }
    
    if (filters.active !== undefined) {
      query = query.eq('active', filters.active)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Funções para ligas
export const leagueService = {
  async getAll() {
    const { data, error } = await supabase
      .from('leagues')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async create(name: string, country: string) {
    const { data, error } = await supabase
      .from('leagues')
      .insert({ name, country })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('leagues')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Funções para nacionalidades
export const nationalityService = {
  async getAll() {
    const { data, error } = await supabase
      .from('nationalities')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async create(name: string) {
    const { data, error } = await supabase
      .from('nationalities')
      .insert({ name })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('nationalities')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Funções para categorias
export const categoryService = {
  async getAll(): Promise<SupabaseCategory[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async create(name: string) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, is_active: true })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
};

export interface StoreConfig {
  id: string;
  store_name: string;
  store_description: string;
  contact_email: string;
  contact_phone: string;
  logo_url?: string;
  show_prices: boolean;
  show_stock: boolean;
  show_ratings: boolean;
  allow_presale: boolean;
  auto_approve_orders: boolean;
  minimum_order_value: number;
  order_email_notifications: boolean;
  low_stock_alerts: boolean;
  low_stock_threshold: number;
  created_at?: string;
  updated_at?: string;
}

// Funções para configurações da loja
export const storeConfigService = {
  async getConfig(): Promise<StoreConfig | null> {
    const { data, error } = await supabase
      .from('store_config')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateConfig(config: Partial<StoreConfig>): Promise<StoreConfig> {
    const { data, error } = await supabase
      .from('store_config')
      .upsert(config)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
};

export const profileService = {
  async getAll(): Promise<SupabaseProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        phone,
        user_type,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getAllWithEmail(): Promise<SupabaseProfile[]> {
    const { data, error } = await supabase
      .rpc('get_profiles_with_email');
    
    if (error) {
      // Fallback para query manual se a função RPC não existir
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          phone,
          user_type,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });
      
      if (profileError) throw profileError;
      return profileData || [];
    }
    
    return data || [];
  },

  async getById(id: string): Promise<SupabaseProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        phone,
        user_type,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(profileData: CreateProfileData): Promise<SupabaseProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, profileData: UpdateProfileData): Promise<SupabaseProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(query: string): Promise<SupabaseProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        full_name,
        phone,
        user_type,
        created_at,
        updated_at
      `)
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
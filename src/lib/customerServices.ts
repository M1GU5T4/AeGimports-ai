import { supabase } from './supabase';
import { toast } from 'sonner';

// Tipos para a área de cliente
export interface Address {
  id: string;
  user_id: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}



export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_amount: number;
  discount_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  addresses?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  products?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// Serviços para Endereços
export const addressService = {
  async getAll(): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar endereços:', error);
      throw error;
    }

    return data || [];
  },

  async create(address: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
    const { data, error } = await supabase
      .from('addresses')
      .insert([address])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    }

    return data;
  },

  async update(id: string, address: Partial<Address>): Promise<Address> {
    const { data, error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    }
  },

  async setDefault(id: string): Promise<void> {
    // Primeiro, remove o padrão de todos os endereços
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .neq('id', id);

    // Depois, define o endereço selecionado como padrão
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (error) {
      console.error('Erro ao definir endereço padrão:', error);
      throw error;
    }
  }
};



// Serviços para Favoritos
export const favoriteService = {
  async getAll(): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar favoritos:', error);
      throw error;
    }

    return data || [];
  },

  async add(productId: string): Promise<Favorite> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Usuário não autenticado:', userError);
      toast.error('Você precisa estar logado para adicionar favoritos');
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ product_id: productId, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar favorito:', error);
      throw error;
    }

    toast.success('Produto adicionado aos favoritos!');
    return data;
  },

  async remove(productId: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Usuário não autenticado:', userError);
      toast.error('Você precisa estar logado para remover favoritos');
      throw new Error('Usuário não autenticado');
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao remover favorito:', error);
      throw error;
    }

    toast.success('Produto removido dos favoritos!');
  },

  async isFavorite(productId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar favorito:', error);
      return false;
    }

    return !!data;
  }
};

// Serviços para Pedidos
export const orderService = {
  async getAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        ),
        addresses (
          *
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }

    return data || [];
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        ),
        addresses (
          *
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar pedido:', error);
      return null;
    }

    return data;
  },

  async create(order: Omit<Order, 'id' | 'user_id' | 'order_number' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]): Promise<Order> {
    // Criar o pedido
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (orderError) {
      console.error('Erro ao criar pedido:', orderError);
      throw orderError;
    }

    // Criar os itens do pedido
    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Erro ao criar itens do pedido:', itemsError);
      throw itemsError;
    }

    toast.success('Pedido criado com sucesso!');
    return orderData;
  },

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }
};

// Serviços para Notificações
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }

    return data || [];
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }

    return count || 0;
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
      throw error;
    }
  }
};
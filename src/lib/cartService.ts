import { supabase } from './supabase';
import { Product } from './types';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  size_id: string;
  quantity: number;
  added_at: string;
  product?: Product;
}

export interface CartItemInput {
  product_id: string;
  size_id: string;
  quantity: number;
}

export const cartService = {
  // Obter todos os itens do carrinho do usuário
  async getCartItems(): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          image_url,
          description,
          league:leagues(name, country),
          nationality:nationalities(name)
        )
      `)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }

    return data || [];
  },

  // Adicionar item ao carrinho
  async addToCart(item: CartItemInput): Promise<CartItem> {
    // Verificar se o item já existe no carrinho
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('product_id', item.product_id)
      .eq('size_id', item.size_id)
      .single();

    if (existingItem) {
      // Se existe, atualizar a quantidade
      return await this.updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
    }

    // Se não existe, criar novo item
    const { data, error } = await supabase
      .from('cart_items')
      .insert([item])
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          image_url,
          description,
          league:leagues(name, country),
          nationality:nationalities(name)
        )
      `)
      .single();

    if (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }

    return data;
  },

  // Atualizar quantidade de um item
  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      return await this.removeFromCart(itemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          image_url,
          description,
          league:leagues(name, country),
          nationality:nationalities(name)
        )
      `)
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }

    return data;
  },

  // Remover item do carrinho
  async removeFromCart(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Limpar todo o carrinho
  async clearCart(): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Remove todos os itens

    if (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Obter contagem total de itens no carrinho
  async getCartCount(): Promise<number> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity');

    if (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }

    return data?.reduce((total, item) => total + item.quantity, 0) || 0;
  },

  // Obter total do carrinho
  async getCartTotal(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  },

  // Criar pedido a partir do carrinho
  async createOrderFromCart(shippingAddress: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('create_order_from_cart', {
        shipping_address: shippingAddress
      });

    if (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }

    return data;
  }
};
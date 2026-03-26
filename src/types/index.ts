export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  specs: string[];
  sizes: string[];
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  product_id: string;
  size: string;
  quantity: number;
  total_price: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_address_detail: string | null;
  delivery_memo: string | null;
  depositor_name: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  cancelled_at: string | null;
  product?: Product;
}

export interface OrderFormData {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_address_detail: string;
  delivery_memo: string;
  depositor_name: string;
}

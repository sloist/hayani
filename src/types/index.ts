export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  specs: string[];
  sizes: string[];
  stock_by_size: Record<string, number> | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  code: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_price: number;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_address_detail: string | null;
  delivery_memo: string | null;
  depositor_name: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  tracking_company: string | null;
  tracking_number: string | null;
  admin_memo: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  cancelled_at: string | null;
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

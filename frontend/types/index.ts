export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  userId?: string;
}

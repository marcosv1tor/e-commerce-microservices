export interface OrderItem {
  productId: string;
  productName: string;
  pictureUrl?: string;
  unitPrice: number;
  units: number;
}

export interface Order {
  id: string; // ou orderNumber dependendo do seu backend
  userName: string;
  totalPrice: number;
  status: string; // Pending, Paid, Shipped, Cancelled
  orderDate: string;
  orderItems: OrderItem[];
}
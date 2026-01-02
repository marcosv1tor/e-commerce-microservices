export interface OrderItem {
  productId: string;
  productName: string;
  pictureUrl?: string;
  unitPrice: number;
  units: number;
}

export interface Order {
  id: string; // ou orderNumber dependendo do seu backend
  orderCode: string;
  userName: string;
  totalPrice: number;
  status: string; // Pending, Paid, Shipped, Cancelled
  orderDate: string;
  orderItems: OrderItem[];
}

export interface OrderDetail {
  id: string;
  orderItems: {
    categorie: string;
    productName: string;
    units: number;
    unitPrice: number;
    pictureUrl: string;
  }[];
}


export interface Adress {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}
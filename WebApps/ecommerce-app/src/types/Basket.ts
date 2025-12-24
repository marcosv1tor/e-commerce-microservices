export interface BasketItem {
  quantity: number;
  color?: string;
  price: number;
  productId: string;
  productName: string;
  pictureUrl?: string;
}

export interface ShoppingCart {
  userName: string;
  items: BasketItem[];
  totalPrice?: number;
}

export interface BasketCheckout {
  userName: string;
  totalPrice: number;
  // Campos para o Checkout (Mock)
  firstName: string;
  lastName: string;
  emailAddress: string;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: number;
}
export type OrderStatus = 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Card' | 'Online';

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  date: string;
  items: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface Feedback {
  id: string;
  customerName: string;
  phoneNumber: string;
  message: string;
  rating: number;
  date: string;
}

export interface User {
  name: string;
  email: string;
  businessName: string;
}

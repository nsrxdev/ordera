import type { Feedback, Order } from '@/types';

export type DbOrder = {
  id: string;
  customer_name: string;
  phone_number: string;
  order_date: string; // YYYY-MM-DD
  order_items: string;
  quantity: number;
  total_amount: number;
  payment_method: Order['paymentMethod'];
  order_status: Order['status'];
  created_at: string;
  updated_at: string;
};

export type DbFeedback = {
  id: string;
  customer_name: string;
  phone_number: string;
  feedback_message: string;
  rating: number;
  feedback_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
};

export function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    date: new Date(row.order_date).toISOString(),
    items: row.order_items,
    quantity: row.quantity,
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    status: row.order_status,
  };
}

export function mapFeedback(row: DbFeedback): Feedback {
  return {
    id: row.id,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    message: row.feedback_message,
    rating: row.rating,
    date: new Date(row.feedback_date).toISOString(),
  };
}


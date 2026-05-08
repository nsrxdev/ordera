import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'Pending',
  'Preparing',
  'Completed',
  'Cancelled',
]);
export const paymentMethodEnum = z.enum(['Cash', 'Card', 'Online']);

export const orderCreateSchema = z.object({
  customer_name: z.string().min(2, 'Name is too short'),
  phone_number: z.string().min(5, 'Invalid phone number'),
  order_date: z.string().min(1, 'Order date is required'), // YYYY-MM-DD from <input type="date">
  order_items: z.string().min(1, 'Please enter items'),
  quantity: z.number().int().min(1),
  total_amount: z.number().min(0),
  payment_method: paymentMethodEnum,
  order_status: orderStatusEnum,
});

export const orderUpdateSchema = orderCreateSchema.partial();

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;

// Client-side form schema (camelCase) used by React Hook Form.
export const orderFormSchema = z.object({
  customerName: z.string().min(2, 'Name is too short'),
  phoneNumber: z.string().min(5, 'Invalid phone number'),
  orderDate: z.string().min(1, 'Order date is required'),
  items: z.string().min(1, 'Please enter items'),
  quantity: z.number().int().min(1),
  totalAmount: z.number().min(0),
  paymentMethod: paymentMethodEnum,
  status: orderStatusEnum,
});

export type OrderFormInput = z.infer<typeof orderFormSchema>;


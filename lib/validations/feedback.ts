import { z } from 'zod';

export const feedbackCreateSchema = z.object({
  customer_name: z.string().min(2, 'Name is too short'),
  phone_number: z.string().min(5, 'Invalid phone number'),
  feedback_message: z.string().min(5, 'Message is too short'),
  rating: z.number().int().min(1).max(5),
  feedback_date: z.string().min(1, 'Feedback date is required'), // YYYY-MM-DD
});

export const feedbackUpdateSchema = feedbackCreateSchema.partial();

export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
export type FeedbackUpdateInput = z.infer<typeof feedbackUpdateSchema>;

// Client-side form schema (camelCase) used by React Hook Form.
export const feedbackFormSchema = z.object({
  customerName: z.string().min(2, 'Name is too short'),
  phoneNumber: z.string().min(5, 'Invalid phone number'),
  message: z.string().min(5, 'Message is too short'),
  rating: z.number().int().min(1).max(5),
  feedbackDate: z.string().min(1, 'Feedback date is required'),
});

export type FeedbackFormInput = z.infer<typeof feedbackFormSchema>;


import { z } from 'zod';

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Name is too short').max(100),
  business_name: z.string().min(2, 'Business name is too short').max(160),
  email: z.string().email('Enter a valid email'),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;


import { z } from 'zod';

export const waitlistSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  role: z.string().min(1),
});

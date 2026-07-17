import { z } from 'zod';

export const emailVerificationSchema = z.object({
  token: z.string().min(1),
});

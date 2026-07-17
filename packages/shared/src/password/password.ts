import { z } from 'zod';

export const passwordForgotSchema = z.object({
  email: z.string().email(),
});

export const passwordResetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  newPassword: z.string().min(1),
});

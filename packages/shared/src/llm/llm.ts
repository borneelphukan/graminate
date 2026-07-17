import { z } from 'zod';

export const llmSchema = z.object({
  history: z.array(
    z.object({
      sender: z.enum(['user', 'bot']),
      text: z.string(),
    }),
  ),
  userId: z.string().min(1),
  token: z.string().min(1),
});

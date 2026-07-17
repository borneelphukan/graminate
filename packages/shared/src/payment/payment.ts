import { z } from 'zod';

export const createPaymentSchema = z.object({
  amount: z.coerce.number(),
  currency: z.string().min(1),
  userId: z.number().int(),
  planType: z.string().min(1),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  planType: z.string().min(1),
});

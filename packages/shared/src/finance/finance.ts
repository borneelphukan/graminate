import { z } from 'zod';

export const expensesSchema = z.object({
  expense_id: z.number().int().optional(),
  user_id: z.number().int(),
  title: z.string().min(1),
  occupation: z.string().optional().nullable(),
  category: z.string().min(1),
  expense: z.coerce.number(),
  date_created: z.coerce.date(),
  created_at: z.coerce.date().optional().nullable(),
});

export const invoiceItemsSchema = z.object({
  item_id: z.number().int().optional(),
  invoice_id: z.number().int(),
  description: z.string().optional().nullable(),
  quantity: z.coerce.number().default(1),
  rate: z.coerce.number().default(0),
});

export const invoicesSchema = z.object({
  invoice_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  title: z.string().min(1),
  bill_to: z.string().min(1),
  due_date: z.coerce.date(),
  receipt_date: z.coerce.date().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  tax: z.coerce.number().default(0).optional().nullable(),
  discount: z.coerce.number().default(0).optional().nullable(),
  shipping: z.coerce.number().default(0).optional().nullable(),
  receipt_number: z.string().optional().nullable(),
  issued_date: z.coerce.date().optional().nullable(),
  bill_to_address_line1: z.string().optional().nullable(),
  bill_to_address_line2: z.string().optional().nullable(),
  bill_to_city: z.string().optional().nullable(),
  bill_to_state: z.string().optional().nullable(),
  bill_to_postal_code: z.string().optional().nullable(),
  bill_to_country: z.string().optional().nullable(),
  sales_id: z.number().int().optional().nullable(),
});

export const paymentsSchema = z.object({
  payment_id: z.number().int().optional(),
  user_id: z.number().int(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().optional().nullable(),
  razorpay_signature: z.string().optional().nullable(),
  amount: z.coerce.number(),
  currency: z.string().min(1),
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED']).default('PENDING'),
  created_at: z.coerce.date().optional().nullable(),
  updated_at: z.coerce.date().optional().nullable(),
  plan_type: z.enum(['FREE', 'BASIC', 'PRO']).default('PRO'),
});

export const salesSchema = z.object({
  sales_id: z.number().int().optional(),
  user_id: z.number().int(),
  sales_date: z.coerce.date(),
  occupation: z.string().optional().nullable(),
  items_sold: z.array(z.string()).optional().nullable(),
  quantities_sold: z.array(z.number().int()).optional().nullable(),
  quantity_unit: z.string().optional().nullable(),
  invoice_created: z.boolean().default(false).optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  sales_name: z.string().optional().nullable(),
  prices_per_unit: z.array(z.coerce.number()).optional().nullable(),
});

export const loansSchema = z.object({
  loan_id: z.number().int().optional(),
  user_id: z.number().int(),
  loan_name: z.string().min(1),
  lender: z.string().min(1),
  amount: z.coerce.number(),
  interest_rate: z.coerce.number(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().optional().nullable(),
  status: z.string().default('Active'),
  created_at: z.coerce.date().optional().nullable(),
});

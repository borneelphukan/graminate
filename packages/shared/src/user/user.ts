import { z } from 'zod';

export const usersSchema = z.object({
  user_id: z.number().int().optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string(),
  business_name: z.string().optional().nullable(),
  date_of_birth: z.coerce.date().optional().nullable(),
  password: z.string().min(1),
  created_at: z.coerce.date().optional().nullable(),
  language: z.string().optional().nullable(),
  time_format: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  sub_type: z.array(z.string()).optional().nullable(),
  temperature_scale: z.string().optional().nullable(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  darkMode: z.boolean().default(false),
  widgets: z.array(z.string()).optional().nullable(),
  plan: z.enum(['FREE', 'BASIC', 'PRO']).default('FREE'),
  subscription_expires_at: z.coerce.date().optional().nullable(),
  country: z.string().optional().nullable(),
  opening_balance: z.coerce.number().default(0),
  business_size: z.string().optional().nullable(),
  entity_type: z.string().optional().nullable(),
  pending_plan: z.enum(['FREE', 'BASIC', 'PRO']).optional().nullable(),
  pending_plan_source: z.string().optional().nullable(),
});

export const adminSchema = z.object({
  admin_id: z.string().uuid().optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  created_at: z.coerce.date().optional().nullable(),
});

export const loginHistorySchema = z.object({
  login_id: z.string().uuid().optional(),
  user_id: z.number().int(),
  logged_in_at: z.coerce.date().optional().nullable(),
  logged_out_at: z.coerce.date().optional().nullable(),
});

export const passwordResetsSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  expires_at: z.coerce.date(),
});

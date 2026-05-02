import { z } from 'zod';

export const companiesSchema = z.object({
  company_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  company_name: z.string().min(1),
  contact_person: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  address_line_1: z.string().min(1),
  address_line_2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  website: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
});

export const contactsSchema = z.object({
  contact_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  first_name: z.string().min(1),
  last_name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
});

export const dealsSchema = z.object({
  deal_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  deal_name: z.string().min(1),
  partner: z.string().min(1),
  amount: z.coerce.number(),
  stage: z.string().min(1),
  end_date: z.coerce.date(),
  start_date: z.coerce.date(),
  category: z.string().optional().nullable(),
  priority: z.string().default('Medium'),
});

import { z } from 'zod';

export const inventorySchema = z.object({
  inventory_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  item_name: z.string().min(1),
  item_group: z.string().min(1),
  units: z.string().min(1),
  quantity: z.number().int(),
  created_at: z.coerce.date().optional().nullable(),
  price_per_unit: z.coerce.number(),
  warehouse_id: z.number().int().optional().nullable(),
  minimum_limit: z.number().int().optional().nullable(),
  feed: z.boolean().default(false),
});

export const jobApplicationsSchema = z.object({
  id: z.number().int().optional(),
  job_id: z.number().int(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  portfolio: z.string().optional().nullable(),
  cv_file: z.string().min(1),
  applied_at: z.coerce.date().optional().nullable(),
});

export const jobsSchema = z.object({
  id: z.number().int().optional(),
  position: z.string().min(1),
  type: z.string().min(1),
  mode: z.string().min(1),
  description: z.string().min(1),
  tasks: z.array(z.string()).optional().nullable(),
  requirements: z.array(z.string()).optional().nullable(),
  benefits: z.array(z.string()).optional().nullable(),
});

export const labourPaymentsSchema = z.object({
  payment_id: z.number().int().optional(),
  labour_id: z.number().int(),
  payment_date: z.coerce.date(),
  salary_paid: z.coerce.number(),
  bonus: z.coerce.number(),
  overtime_pay: z.coerce.number(),
  housing_allowance: z.coerce.number(),
  travel_allowance: z.coerce.number(),
  meal_allowance: z.coerce.number(),
  total_amount: z.coerce.number(),
  payment_status: z.string().default('Pending').optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
});

export const laboursSchema = z.object({
  labour_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  full_name: z.string().min(1),
  date_of_birth: z.coerce.date(),
  gender: z.string().min(1),
  contact_number: z.string().min(1),
  aadhar_card_number: z.string().min(1),
  ration_card: z.string().optional().nullable(),
  pan_card: z.string().optional().nullable(),
  driving_license: z.string().optional().nullable(),
  mnrega_job_card_number: z.string().optional().nullable(),
  bank_account_number: z.string().optional().nullable(),
  ifsc_code: z.string().optional().nullable(),
  bank_name: z.string().optional().nullable(),
  bank_branch: z.string().optional().nullable(),
  disability_status: z.boolean().default(false).optional().nullable(),
  epfo: z.string().optional().nullable(),
  esic: z.string().optional().nullable(),
  pm_kisan: z.boolean().default(false).optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
  role: z.string().default('Worker'),
  base_salary: z.coerce.number().default(0),
  bonus: z.coerce.number().optional().nullable(),
  overtime_pay: z.coerce.number().optional().nullable(),
  housing_allowance: z.coerce.number().optional().nullable(),
  travel_allowance: z.coerce.number().optional().nullable(),
  meal_allowance: z.coerce.number().optional().nullable(),
  payment_frequency: z.string().default('Monthly').optional().nullable(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
});

export const migrationsSchema = z.object({
  id: z.number().int().optional(),
  migration: z.string().min(1),
  batch: z.number().int(),
});

export const notificationsSchema = z.object({
  notification_id: z.number().int().optional(),
  user_id: z.number().int(),
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.string().default('info'),
  is_read: z.boolean().default(false),
  created_at: z.coerce.date().optional().nullable(),
});

export const kanbanColumnsSchema = z.object({
  column_id: z.number().int().optional(),
  user_id: z.number().int(),
  project: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().default(0),
  created_at: z.coerce.date().optional().nullable(),
});

export const warehouseSchema = z.object({
  warehouse_id: z.number().int().optional(),
  user_id: z.number().int().optional().nullable(),
  name: z.string().min(1),
  type: z.string().optional().nullable(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

import { z } from 'zod';

export const poultryEggsSchema = z.object({
  egg_id: z.number().int().optional(),
  user_id: z.number().int(),
  flock_id: z.number().int(),
  date_collected: z.coerce.date(),
  small_eggs: z.number().int().default(0),
  medium_eggs: z.number().int().default(0),
  large_eggs: z.number().int().default(0),
  extra_large_eggs: z.number().int().default(0),
  total_eggs: z.number().int().default(0),
  broken_eggs: z.number().int().default(0),
  date_logged: z.coerce.date().optional().nullable(),
});

export const poultryFeedsSchema = z.object({
  feed_id: z.number().int().optional(),
  user_id: z.number().int(),
  flock_id: z.number().int(),
  feed_given: z.string().min(1),
  amount_given: z.coerce.number(),
  units: z.string().min(1),
  feed_date: z.coerce.date().default(() => new Date()),
  created_at: z.coerce.date().optional().nullable(),
});

export const poultryFlockSchema = z.object({
  flock_id: z.number().int().optional(),
  user_id: z.number().int(),
  flock_name: z.string().min(1),
  flock_type: z.string().min(1),
  quantity: z.number().int(),
  created_at: z.coerce.date().optional().nullable(),
  breed: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  housing_type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const poultryHealthSchema = z.object({
  poultry_health_id: z.number().int().optional(),
  user_id: z.number().int(),
  flock_id: z.number().int(),
  veterinary_name: z.string().optional().nullable(),
  total_birds: z.number().int(),
  birds_vaccinated: z.number().int(),
  vaccines_given: z.array(z.string()).optional().nullable(),
  symptoms: z.array(z.string()).optional().nullable(),
  medicine_approved: z.array(z.string()).optional().nullable(),
  remarks: z.string().optional().nullable(),
  next_appointment: z.coerce.date().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
});

import { z } from 'zod';

export const cattleMilkSchema = z.object({
  milk_id: z.number().int().optional(),
  cattle_id: z.number().int(),
  user_id: z.number().int(),
  date_collected: z.coerce.date(),
  animal_name: z.string().optional().nullable(),
  milk_produced: z.coerce.number(),
  date_logged: z.coerce.date().optional().nullable(),
});

export const cattleRearingSchema = z.object({
  cattle_id: z.number().int().optional(),
  user_id: z.number().int(),
  cattle_name: z.string().min(1),
  cattle_type: z.string().min(1),
  number_of_animals: z.number().int(),
  purpose: z.string().optional().nullable(),
  created_at: z.coerce.date().optional().nullable(),
});

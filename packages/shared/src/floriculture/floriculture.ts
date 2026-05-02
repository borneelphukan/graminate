import { z } from 'zod';

export const floricultureSchema = z.object({
  flower_id: z.number().int().optional(),
  user_id: z.number().int(),
  flower_name: z.string().min(1),
  flower_type: z.string().optional().nullable(),
  area: z.coerce.number().optional().nullable(),
  method: z.string().optional().nullable(),
  planting_date: z.preprocess((val) => (val === '' || val === 'Invalid Date' ? null : val), z.coerce.date().optional().nullable()).transform((val) => {
    if (val instanceof Date && isNaN(val.getTime())) {
      return null;
    }
    return val;
  }),
  created_at: z.coerce.date().optional().nullable(),
});

export const flowerWateringSchema = z.object({
  watering_id: z.number().int().optional(),
  flower_id: z.number().int(),
  user_id: z.number().int(),
  watering_date: z.coerce.date(),
  watered: z.boolean().default(false),
  created_at: z.coerce.date().optional().nullable(),
});

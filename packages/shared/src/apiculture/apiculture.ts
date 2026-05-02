import { z } from 'zod';

export const apicultureSchema = z.object({
  apiary_id: z.number().int().optional(),
  user_id: z.number().int(),
  apiary_name: z.string().min(1),
  created_at: z.coerce.date().optional().nullable(),
  area: z.coerce.number().optional().nullable(),
  address_line_1: z.string().optional().nullable(),
  address_line_2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
});

export const beeHivesSchema = z.object({
  hive_id: z.number().int().optional(),
  apiary_id: z.number().int(),
  hive_name: z.string().min(1),
  hive_type: z.string().optional().nullable(),
  installation_date: z.coerce.date().optional().nullable(),
  ventilation_status: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  bee_species: z.string().optional().nullable(),
  honey_capacity: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const hiveInspectionSchema = z.object({
  inspection_id: z.number().int().optional(),
  hive_id: z.number().int(),
  inspection_date: z.coerce.date(),
  queen_status: z.string().optional().nullable(),
  queen_introduced_date: z.coerce.date().optional().nullable(),
  brood_pattern: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  symptoms: z.array(z.string()).optional().nullable(),
  population_strength: z.string().optional().nullable(),
  frames_of_brood: z.number().int().optional().nullable(),
  frames_of_nectar_honey: z.number().int().optional().nullable(),
  frames_of_pollen: z.number().int().optional().nullable(),
  room_to_lay: z.string().optional().nullable(),
  queen_cells_observed: z.string().optional().nullable(),
  queen_cells_count: z.number().int().optional().nullable(),
  varroa_mite_method: z.string().optional().nullable(),
  varroa_mite_count: z.number().int().optional().nullable(),
  actions_taken: z.string().optional().nullable(),
});

export const honeyProductionSchema = z.object({
  harvest_id: z.number().int().optional(),
  hive_id: z.number().int(),
  harvest_date: z.coerce.date(),
  honey_weight: z.coerce.number(),
  frames_harvested: z.number().int().optional().nullable(),
  honey_type: z.string().optional().nullable(),
  harvest_notes: z.string().optional().nullable(),
  logged_at: z.coerce.date().optional().nullable(),
});

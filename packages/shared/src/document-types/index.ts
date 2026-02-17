import { z } from "zod";

export const Z_DocumentTypesSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().nullable().optional(),
  longName: z.string().nullable().optional(),
  order: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  slug: z.string(),
});

export type T_DocumentTypesType = z.infer<typeof Z_DocumentTypesSchema>;

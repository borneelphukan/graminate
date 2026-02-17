import { z } from "zod";

export const Z_EstablishmentSchema = z.object({
  id: z.string(),
  establishmentNumber: z.number(),
});

export type T_EstablishmentType = z.infer<typeof Z_EstablishmentSchema>;

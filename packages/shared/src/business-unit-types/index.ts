import { Z_DocumentTypesSchema } from "../document-types";
import { z } from "zod";

export const Z_BusinessUnitTypesSchema = z.object({
  name: z.string(),
  relevantDocumentTypes: z.array(Z_DocumentTypesSchema.or(z.string())),
});

export type T_BusinessUnitTypesType = z.infer<typeof Z_BusinessUnitTypesSchema>;

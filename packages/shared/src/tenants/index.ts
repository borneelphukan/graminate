import { z } from "zod";

export const Z_TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantType: z.enum(["client", "agency", "platform"]).optional().nullable(),
  description: z.string().optional().nullable(),
  updatedAt: z.iso.datetime().optional(),
  createdAt: z.iso.datetime().optional(),
});

export type T_TenantType = z.infer<typeof Z_TenantSchema>;

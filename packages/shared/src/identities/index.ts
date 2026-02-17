import { z } from "zod";

export const Z_AccessCacheSchema = z
  .object({
    tenants: z.array(z.string()),
    businessUnits: z.array(z.string()),
  })
  .partial()
  .optional();

export const Z_IdentitySchema = z.object({
  id: z.string(),
  email: z.email().meta({
    description: "The email address of the identity",
    example: "user@example.com",
  }),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  accessCache: Z_AccessCacheSchema,
});

export type T_IdentityType = z.infer<typeof Z_IdentitySchema>;

export const Z_BusinessUnitsInfoEntrySchema = z.object({
  outstandingContributions: z.number().optional().nullable().default(0),
  expiredDocuments: z.number().optional().nullable().default(0),
});
export const Z_BusinessUnitsInfoSchema = z.record(
  z.string(),
  Z_BusinessUnitsInfoEntrySchema
);

export type T_BusinessUnitsInfoEntryType = z.infer<
  typeof Z_BusinessUnitsInfoEntrySchema
>;
export type T_BusinessUnitsInfoType = z.infer<typeof Z_BusinessUnitsInfoSchema>;

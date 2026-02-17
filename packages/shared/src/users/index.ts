import { z } from "zod";
import { Z_BusinessUnitSchema } from "../business-units/index";
import { Z_DocumentTypesSchema } from "../document-types/index";
import { Z_TenantSchema } from "../tenants/index";

export const Z_UserSchema = z.object({
  id: z.string(),
  tenant: z.union([z.string(), Z_TenantSchema]).nullable().optional(),
  businessUnits: z
    .array(z.union([z.string(), Z_BusinessUnitSchema]))
    .nullable()
    .optional(),
  documentTypes: z
    .array(z.union([z.string(), Z_DocumentTypesSchema]))
    .nullable()
    .optional(),
  email: z.email(),
  resetPasswordToken: z.string().nullable().optional(),
  resetPasswordExpiration: z.string().nullable().optional(),
  salt: z.string().nullable().optional(),
  hash: z.string().nullable().optional(),
  loginAttempts: z.number().nullable().optional(),
  lockUntil: z.string().nullable().optional(),
  sessions: z
    .array(
      z.object({
        id: z.string(),
        createdAt: z.iso.datetime().nullable().optional(),
        expiresAt: z.iso.datetime(),
      })
    )
    .nullable()
    .optional(),
  password: z.string().nullable().optional(),
});

export type T_UserType = z.infer<typeof Z_UserSchema>;

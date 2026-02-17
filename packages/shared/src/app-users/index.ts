import { z } from "zod";

export const Z_AppUserSchema = z.object({
  id: z.string(),
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
  phone: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]).nullable().optional(),
  otpHash: z.string().nullable().optional(),
  otpExpiresAt: z.iso.datetime().nullable().optional(),
  otpAttempts: z.number().nullable().optional(),
});

export type T_AppUserType = z.infer<typeof Z_AppUserSchema>;

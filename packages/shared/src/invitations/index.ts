import { z } from "zod";
import { Z_BusinessUnitSchema } from "../business-units";
import { Z_UserSchema } from "../users";

export const Z_InvitationSchema = z.object({
  id: z.string(),
  inviter: z.union([z.string(), Z_UserSchema]),
  inviteeEmail: z.email(),
  invitedUnits: z.array(z.union([z.string(), Z_BusinessUnitSchema])),
  managingBusinessUnit: z
    .union([z.string(), Z_BusinessUnitSchema])
    .nullable()
    .optional(),
  inviteeCompanyName: z.string().optional().nullable(),
  status: z
    .enum(["created", "accepted", "sent", "revoked"])
    .nullable()
    .optional(),
  message: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  tokenHash: z.string().nullable().optional(),
  acceptedAt: z.string().nullable().optional(),
});

export const Z_VerifyUserAccessToBUInputSchema = z.object({
  userEmail: z.email(),
  selfAndParentBusinessUnitIds: z.array(z.string()),
});

export const Z_GetBUWithVerifiedParentInputSchema = z.object({
  businessUnit: Z_BusinessUnitSchema,
});

export const Z_GetBUWithVerifiedParentOutputSchema = Z_BusinessUnitSchema;

// Types for TypeScript

export type T_InvitationType = z.infer<typeof Z_InvitationSchema>;

export type T_VerifyUserAccessToBUInputType = z.infer<
  typeof Z_VerifyUserAccessToBUInputSchema
>;

export type T_GetBUWithVerifiedParentInputType = z.infer<
  typeof Z_GetBUWithVerifiedParentInputSchema
>;

export type T_GetBUWithVerifiedParentOutputType = z.infer<
  typeof Z_GetBUWithVerifiedParentOutputSchema
>;

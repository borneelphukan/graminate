import { z } from "zod";
import { Z_AppUserSchema } from "../app-users";
import { Z_IdentitySchema } from "../identities";

// Minimal user payload returned by auth endpoints
export const Z_AuthUserSchema = z.object({
  id: z.string(),
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
  firstName: z.string(),
  lastName: z.string(),
});

// Common tokens response
export const Z_AuthTokensOutputSchema = z.object({
  user: Z_AuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

// request-otp
export const Z_RequestOtpInputSchema = z.object({
  acceptTerms: z.boolean().optional(),
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
});
export const Z_RequestOtpOutputSchema = z.object({
  termsAlreadyAccepted: z.boolean().optional(),
});

// verify-otp
export const Z_VerifyOtpInputSchema = z.object({
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
  otp: z.string().min(6).max(6),
});
export const Z_VerifyOtpOutputSchema = Z_AuthTokensOutputSchema;

// accept-invite
export const Z_AcceptInviteInputSchema = z.object({
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
  invitationToken: z.string(),
  firstName: z.string().min(1).optional().nullable(),
  lastName: z.string().min(1).optional().nullable(),
  companyName: z.string().min(1).optional().nullable(),
  acceptTerms: z.literal(true),
});
export const Z_AcceptInviteOutputSchema = Z_AuthTokensOutputSchema;

// accept-invitation-frontend
export const Z_AcceptInvitationSchema = z.object({
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
  token: z.string(),
  companyName: z.string().optional(),
});

export type T_AcceptInvitation = z.infer<typeof Z_AcceptInvitationSchema>;

// refresh-token
export const Z_RefreshTokenInputSchema = z.object({
  refreshToken: z.string().min(1),
});
export const Z_RefreshTokenOutputSchema = Z_AuthTokensOutputSchema;

// logout
export const Z_LogoutInputSchema = Z_AppUserSchema;

export const Z_LogoutOutputSchema = z.void();

// generate-access-token
export const Z_GenerateAccessTokenInputSchema = z.object({
  identity: Z_IdentitySchema,
  secret: z.string(),
});
export const Z_GenerateAccessTokenOutputSchema = z.string();

// generate-refresh-token
export const Z_GenerateRefreshTokenInputSchema = z.object({
  identity: Z_IdentitySchema,
  secret: z.string(),
});
export const Z_GenerateRefreshTokenOutputSchema = z.string();

// request-access
export const Z_RequestAccessInputSchema = z.object({
  email: z.email().meta({
    description: "The email address of the user",
    example: "user@example.com",
  }),
});
export const Z_RequestAccessOutputSchema = z.void();

// Types
export type T_AuthUserType = z.infer<typeof Z_AuthUserSchema>;
export type T_AuthTokensOutputType = z.infer<typeof Z_AuthTokensOutputSchema>;
export type T_RequestOtpInputType = z.infer<typeof Z_RequestOtpInputSchema>;
export type T_RequestOtpOutputType = z.infer<typeof Z_RequestOtpOutputSchema>;
export type T_VerifyOtpInputType = z.infer<typeof Z_VerifyOtpInputSchema>;
export type T_VerifyOtpOutputType = z.infer<typeof Z_VerifyOtpOutputSchema>;
export type T_AcceptInviteInputType = z.infer<typeof Z_AcceptInviteInputSchema>;
export type T_AcceptInviteOutputType = z.infer<
  typeof Z_AcceptInviteOutputSchema
>;
export type T_RefreshTokenInputType = z.infer<typeof Z_RefreshTokenInputSchema>;
export type T_RefreshTokenOutputType = z.infer<
  typeof Z_RefreshTokenOutputSchema
>;
export type T_VerifyInvitationInputType = z.infer<
  typeof Z_AcceptInviteInputSchema
>;
export type T_VerifyInvitationOutputType = z.infer<
  typeof Z_AuthTokensOutputSchema
>;
export type T_LogoutInputType = z.infer<typeof Z_LogoutInputSchema>;
export type T_LogoutOutputType = z.infer<typeof Z_LogoutOutputSchema>;
export type T_GenerateAccessTokenInputType = z.infer<
  typeof Z_GenerateAccessTokenInputSchema
>;
export type T_GenerateAccessTokenOutputType = z.infer<
  typeof Z_GenerateAccessTokenOutputSchema
>;
export type T_GenerateRefreshTokenInputType = z.infer<
  typeof Z_GenerateRefreshTokenInputSchema
>;
export type T_GenerateRefreshTokenOutputType = z.infer<
  typeof Z_GenerateRefreshTokenOutputSchema
>;

export type T_RequestAccessInputType = z.infer<
  typeof Z_RequestAccessInputSchema
>;
export type T_RequestAccessOutputType = z.infer<
  typeof Z_RequestAccessOutputSchema
>;

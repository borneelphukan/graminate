import { z } from "zod";

export const Z_ValidateShareableLinkInput = z.object({
  token: z.string(),
  email: z.email(),
});
export const Z_ValidateShareableLinkOutput = z.object({
  isValid: z.boolean(),
  appUserExists: z.boolean(),
});
export type T_ValidateShareableLinkInput = z.infer<
  typeof Z_ValidateShareableLinkInput
>;
export type T_ValidateShareableLinkOutput = z.infer<
  typeof Z_ValidateShareableLinkOutput
>;

export const Z_GetTokenByAliasInput = z.object({
  alias: z.string(),
});
export const Z_GetTokenByAliasOutput = z.object({
  token: z.string(),
});
export type T_GetTokenByAliasInput = z.infer<typeof Z_GetTokenByAliasInput>;
export type T_GetTokenByAliasOutput = z.infer<typeof Z_GetTokenByAliasOutput>;

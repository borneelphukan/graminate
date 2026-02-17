import z from "zod";
import { Z_MediaSchema } from "../media";

export const Z_MarketingAssetSchema = Z_MediaSchema.extend({
  displayInPaywall: z.boolean().optional().nullable(),
  type: z.enum(["customers", "partners", "product"]).optional().nullable(),
  plans: z
    .array(z.enum(["starter", "professional", "enterprise"]))
    .optional()
    .nullable(),
  products: z
    .enum(["werkvertraege_compliance", "vendor_workforce_management_suite"])
    .optional()
    .nullable(),
});

export type T_MarketingAssetType = z.infer<typeof Z_MarketingAssetSchema>;

export const Z_ListMarketingAssetOutputSchema = z.array(Z_MarketingAssetSchema);
export type T_ListMarketingAssetOutputType = z.infer<
  typeof Z_ListMarketingAssetOutputSchema
>;

export const Z_GetPartnersInputSchema = z.object({
  plan: z.string().optional(),
});
export type T_GetPartnersInputType = z.infer<typeof Z_GetPartnersInputSchema>;

export const Z_GetProductsInputSchema = z.object({
  product: z.string().optional(),
});
export type T_GetProductsInputType = z.infer<typeof Z_GetProductsInputSchema>;

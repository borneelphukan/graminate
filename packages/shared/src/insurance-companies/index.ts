import { z } from "zod";
import { Z_EstablishmentInsuranceAssignmentsSchema } from "../establishment-insurance-assignments";
import { Z_MediaSchema } from "../media";

export const Z_InsuranceCompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  companyNumber: z.string(),
  logo: z.union([z.string(), Z_MediaSchema]).nullable().optional(),
});
export type T_InsuranceCompanyType = z.infer<typeof Z_InsuranceCompanySchema>;

export const Z_ListAssignmentsInputSchema = z.object({
  businessUnitId: z.string(),
  effectiveDate: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date().optional()
  ),
});
export type T_ListAssignmentsInputType = z.infer<
  typeof Z_ListAssignmentsInputSchema
>;

export const Z_ListAssignmentsOutputSchema = z.array(
  Z_EstablishmentInsuranceAssignmentsSchema
);
export type T_ListAssignmentsOutputType = z.infer<
  typeof Z_ListAssignmentsOutputSchema
>;

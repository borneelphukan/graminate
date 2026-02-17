import { z } from "zod";
import { Z_EstablishmentSchema } from "./../establishments/index";
import { Z_InsuranceCompanySchema } from "./../insurance-companies/index";

export const Z_EstablishmentInsuranceAssignmentsSchema = z.object({
  id: z.string(),
  title: z.string(),
  establishment: z.union([z.string(), Z_EstablishmentSchema]),
  insuranceCompany: z.lazy(() =>
    z.union([z.string(), Z_InsuranceCompanySchema])
  ),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime(),
});
export type T_EstablishmentInsuranceAssignmentsType = z.infer<
  typeof Z_EstablishmentInsuranceAssignmentsSchema
>;

export const Z_AssignmentExpectationInputSchema = z.object({
  establishmentNumber: z.string(),
  insuranceNumber: z.string(),
  effectiveFrom: z.string(),
});
export type T_AssignmentExpectationInputType = z.infer<
  typeof Z_AssignmentExpectationInputSchema
>;

export const Z_AssignmentModificationInputSchema = z.object({
  tenantSlug: z.string(),
  establishmentNumber: z.string(),
  insuranceNumber: z.string(),
  effectiveFrom: z.string(),
});
export type T_AssignmentModificationInputType = z.infer<
  typeof Z_AssignmentModificationInputSchema
>;

export const Z_AssignmentStatusUpdateInputSchema = z.object({
  tenantSlug: z.string(),
  establishmentNumber: z.string(),
  insuranceNumber: z.string(),
  effectiveFrom: z.string(),
  documentStatus: z.enum(["pending", "compliant", "outstanding"]),
});

const Z_AssignmentObjectSchema = z.object({
  establishmentNumber: z.string(),
  insuranceNumber: z.string(),
});

export const Z_AssignmentUpdateInputSchema = z.object({
  tenantSlug: z.string(),
  valid: z.array(Z_AssignmentObjectSchema),
  missing: z.array(Z_AssignmentObjectSchema),
  invalid: z.array(Z_AssignmentObjectSchema),
  effectiveFrom: z.string(),
});

export const Z_TemporaryAssignmentModificationInputSchema = z.object({
  tenantSlug: z.string(),
  effectiveFrom: z.string(),
});
export type T_TemporaryAssignmentModificationInputType = z.infer<
  typeof Z_TemporaryAssignmentModificationInputSchema
>;

export type T_AssignmentStatusUpdateInputType = z.infer<
  typeof Z_AssignmentStatusUpdateInputSchema
>;

export type T_AssignmentUpdateInputType = z.infer<
  typeof Z_AssignmentUpdateInputSchema
>;

export type T_AssignmentObject = z.infer<typeof Z_AssignmentObjectSchema>;

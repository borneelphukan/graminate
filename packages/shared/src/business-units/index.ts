import { z } from "zod";
import {
  type T_EstablishmentType,
  Z_EstablishmentSchema,
} from "../establishments";
import { withFilters } from "../filtering";
import {
  type T_InsuranceCompanyType,
  Z_InsuranceCompanySchema,
} from "../insurance-companies";
import { type T_MediaType, Z_MediaSchema } from "../media";
import { type T_TenantType, Z_TenantSchema } from "../tenants";
import {
  Z_BusinessUnitTypesSchema,
  type T_BusinessUnitTypesType,
} from "../business-unit-types";

export const Z_BusinessUnitANUDetail = z.object({
  name1: z.string().describe("Niederlassung"),
  name2: z.string().optional(),
  name3: z.string().optional(),
  strasse: z.string().describe("Straße"),
  hausnr: z.string(),
  plz: z.string().describe("PLZ"),
  ort: z.string().describe("Ort"),
  staat: z.string().describe("Land"),
  hauptagenturnummer: z.string().optional(),
});

export const Z_BusinessUnitANUDetails = z.array(Z_BusinessUnitANUDetail);

export const Z_BusinessUnitFilterOptions = z.object({
  name: z.string().describe("Niederlassung"),
  complianceStatusOverall: z
    .enum(["valid", "invalid", "pending"])
    .describe("Status")
    .meta({
      labels: {
        valid: "Gültig",
        invalid: "Ungültig",
        pending: "Ausstehend",
      },
    }),
  street: z.string().describe("Straße"),
  postalCode: z.string().describe("Postleitzahl"),
  city: z.string().describe("Stadt"),
  country: z.string().describe("Land"),
  outstandingContributions: z.number().describe("Beitragsrückstände"),
  expiredDocuments: z.number().describe("Abgelaufene Dokumente"),
});

// needed type explicitly for self-referencing (if someone finds a solution with infer please share)
export type T_BusinessUnitType = {
  id: string;
  name: string;
  logo?: (string | null) | T_MediaType;
  anuComplianceStatus?: ("valid" | "invalid" | "pending") | null;
  healthInsuranceComplianceStatus?: ("valid" | "invalid" | "pending") | null;
  professionalAssociationComplianceStatus?:
    | ("valid" | "invalid" | "pending")
    | null;
  taxOfficeComplianceStatus?: ("valid" | "invalid" | "pending") | null;
  anuChecklist?: T_BusinessUnitANUDetails | null;
  enableANURetrieval: boolean;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  establishment?: (string | null) | T_EstablishmentType;
  insuranceCompanies?: (string | T_InsuranceCompanyType)[] | null;
  noteByPactos?: string | null;
  tenant: string | T_TenantType;
  parent?: (null | string) | T_BusinessUnitType;
  complianceStatusOverall?: ("valid" | "invalid" | "pending") | null;
  overrideHealthInsurance?: boolean | null;
  healthInsuranceOverridingReason?: string | null;
  overrideProfessionalAssociation?: boolean | null;
  professionalAssociationOverridingReason?: string | null;
  overrideTaxOffice?: boolean | null;
  taxOfficeOverridingReason?: string | null;
  isComplianceVisible?: boolean | null;
  isActiveEntity?: boolean | null;
  isComplianceChecked?: boolean | null;
  types: (T_BusinessUnitTypesType | string)[];
  outstandingContributions?: number | null;
  outstandingContributionDocumentIds?: string[] | null;
  expiredDocuments?: number | null;
  expiredDocumentIds?: string[] | null;
};

// Lean tenant as seen in console output (no timestamps)
const Z_TenantLeanSchema = z.object({
  id: z.string(),
  name: z.string(),
  tenantType: z.enum(["client", "agency", "platform"]).optional().nullable(),
  description: z.string().optional().nullable(),
});

// Shallow BU shape for parent references (no strict timestamps, parent not fully recursive)
const Z_BusinessUnitShallowSchema = z.object({
  id: z.string(),
  name: z.string(),
  healthInsuranceComplianceStatus: z
    .enum(["valid", "pending", "invalid"])
    .nullable()
    .optional(),
  professionalAssociationComplianceStatus: z
    .enum(["valid", "pending", "invalid"])
    .nullable()
    .optional(),
  anuComplianceStatus: z
    .enum(["valid", "pending", "invalid"])
    .nullable()
    .optional(),
  anuChecklist: Z_BusinessUnitANUDetails.optional(),
  enableANURetrieval: z.boolean(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  establishment: z
    .union([z.string(), Z_EstablishmentSchema])
    .nullable()
    .optional(),
  insuranceCompanies: z
    .array(z.union([z.string(), Z_InsuranceCompanySchema]))
    .nullable()
    .optional(),
  noteByPactos: z.string().nullable().optional(),
  overrideHealthInsurance: z.boolean().nullable().optional(),
  healthInsuranceOverridingReason: z.string().nullable().optional(),
  overrideProfessionalAssociation: z.boolean().nullable().optional(),
  professionalAssociationOverridingReason: z.string().nullable().optional(),
  overrideTaxOffice: z.boolean().nullable().optional(),
  taxOfficeOverridingReason: z.string().nullable().optional(),
  tenant: z.union([z.string(), Z_TenantSchema, Z_TenantLeanSchema]),
  parent: z.union([z.string(), z.any()]).nullable().optional(),
  complianceStatusOverall: z.enum(["valid", "invalid", "pending"]).optional(),
  logo: z.union([z.string(), Z_MediaSchema]).nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  types: z.array(z.union([z.string(), Z_BusinessUnitTypesSchema])),
  outstandingContributions: z.number().optional().nullable().default(0),
  outstandingContributionDocumentIds: z
    .array(z.string())
    .optional()
    .nullable()
    .default([]),
  expiredDocuments: z.number().optional().nullable().default(0),
  expiredDocumentIds: z.array(z.string()).optional().nullable().default([]),
});

export const Z_BusinessUnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  healthInsuranceComplianceStatus: z
    .enum(["valid", "pending", "invalid"])
    .nullable()
    .optional(),
  professionalAssociationComplianceStatus: z
    .enum(["valid", "pending", "invalid"])
    .nullable()
    .optional(),
  anuComplianceStatus: z
    .enum(["valid", "pending", "invalid"])
    .nullable()
    .optional(),
  anuChecklist: Z_BusinessUnitANUDetails.optional(),
  enableANURetrieval: z.boolean(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  updatedAt: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  establishment: z
    .union([z.string(), Z_EstablishmentSchema])
    .nullable()
    .optional(),
  insuranceCompanies: z
    .array(z.union([z.string(), Z_InsuranceCompanySchema]))
    .nullable()
    .optional(),
  noteByPactos: z.string().nullable().optional(),
  overrideHealthInsurance: z.boolean().nullable().optional(),
  healthInsuranceOverridingReason: z.string().nullable().optional(),
  overrideProfessionalAssociation: z.boolean().nullable().optional(),
  professionalAssociationOverridingReason: z.string().nullable().optional(),
  overrideTaxOffice: z.boolean().nullable().optional(),
  taxOfficeOverridingReason: z.string().nullable().optional(),
  tenant: z.union([z.string(), Z_TenantSchema, Z_TenantLeanSchema]),
  parent: z
    .union([z.string(), z.lazy(() => Z_BusinessUnitShallowSchema)])
    .nullable()
    .optional(),
  complianceStatusOverall: z.enum(["valid", "invalid", "pending"]).optional(),
  logo: z.union([z.string(), Z_MediaSchema]).nullable().optional(),
  isComplianceVisible: z.boolean().nullable().optional(),
  isActiveEntity: z.boolean().nullable().optional(),
  isComplianceChecked: z.boolean().nullable().optional(),
  types: z.array(z.union([z.string(), Z_BusinessUnitTypesSchema])),
  outstandingContributions: z.number().optional().nullable().default(0),
  outstandingContributionDocumentIds: z
    .array(z.string())
    .optional()
    .nullable()
    .default([]),
  expiredDocuments: z.number().optional().nullable().default(0),
  expiredDocumentIds: z.array(z.string()).optional().nullable().default([]),
});

export const Z_BusinessEntitySchema = z.object({
  relationTo: z.enum(["business-units", "establishments"]),
  value: z.union([z.string(), Z_BusinessUnitSchema, Z_EstablishmentSchema]),
});

export const Z_BusinessUnitExistsInputSchema = z.object({
  id: z.string(),
});

export const Z_BusinessUnitExistsOutputSchema = z.object({
  exists: z.boolean(),
});

export const Z_GetBusinessUnitByIdInputSchema = z.object({
  id: z.string(),
  depth: z.number().optional(),
});

export const Z_GetBusinessUnitByIdOutputSchema = z.union([
  z.string(),
  Z_BusinessUnitSchema,
]);

export const Z_GetDescendantsInputSchema = withFilters(
  Z_BusinessUnitFilterOptions,
  z.object({
    parentId: z.string(),
    depth: z.number(),
    includeSelf: z.boolean(),
  })
);

export const Z_GetDescendantsOutputSchema = z.array(Z_BusinessUnitSchema);

export const Z_GetAscendantsInputSchema = z.object({
  childId: z.string(),
  depth: z.number().optional(),
  includeSelf: z.boolean().optional(),
});

export const Z_GetAscendantsOutputSchema = z.array(Z_BusinessUnitSchema);

export const Z_ListHighestInvitedLevelInputSchema = z.object({
  name: z.string().optional(),
});

export const Z_ListHighestInvitedLevelOutputSchema =
  z.array(Z_BusinessUnitSchema);

export const Z_ListBusinessUnitsInputSchema = z.object({
  status: z.enum(["valid", "invalid"]).optional(),
  name: z.string().optional(),
  establishment: z.string().optional(),
});

export const Z_ListBusinessUnitsOutputSchema = z.array(Z_BusinessUnitSchema);

// Types for TypeScript
export type T_BusinessUnitExistsInputType = z.infer<
  typeof Z_BusinessUnitExistsInputSchema
>;
export type T_BusinessUnitFilterOptionsType = z.infer<
  typeof Z_BusinessUnitFilterOptions
>;
export type T_BusinessUnitExistsOutputType = z.infer<
  typeof Z_BusinessUnitExistsOutputSchema
>;
export type T_GetBusinessUnitByIdInputType = z.infer<
  typeof Z_GetBusinessUnitByIdInputSchema
>;
export type T_GetBusinessUnitByIdOutputType = z.infer<
  typeof Z_GetBusinessUnitByIdOutputSchema
>;
export type T_GetDescendantsInputType = z.infer<
  typeof Z_GetDescendantsInputSchema
>;
export type T_GetDescendantsOutputType = z.infer<
  typeof Z_GetDescendantsOutputSchema
>;
export type T_GetAscendantsInputType = z.infer<
  typeof Z_GetAscendantsInputSchema
>;
export type T_GetAscendantsOutputType = z.infer<
  typeof Z_GetAscendantsOutputSchema
>;
export type T_ListHighestInvitedLevelInputType = z.infer<
  typeof Z_ListHighestInvitedLevelInputSchema
>;
export type T_ListHighestInvitedLevelOutputType = z.infer<
  typeof Z_ListHighestInvitedLevelOutputSchema
>;
export type T_ListBusinessUnitsInputType = z.infer<
  typeof Z_ListBusinessUnitsInputSchema
>;
export type T_ListBusinessUnitsOutputType = z.infer<
  typeof Z_ListBusinessUnitsOutputSchema
>;
export type T_BusinessUnitANUDetails = z.infer<typeof Z_BusinessUnitANUDetails>;
export type T_BusinessUnitANUDetail = z.infer<typeof Z_BusinessUnitANUDetail>;

import { z } from "zod";
import { Z_BusinessUnitSchema } from "../business-units/index";
import { Z_DocumentTypesSchema } from "../document-types/index";
import { Z_EstablishmentInsuranceAssignmentsSchema } from "../establishment-insurance-assignments/index";
import { Z_EstablishmentSchema } from "../establishments/index";
import { Z_TenantSchema } from "../tenants/index";

export const Z_DocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  tenant: z.union([z.string(), Z_TenantSchema]),
  businessUnit: z
    .union([z.string(), Z_BusinessUnitSchema])
    .nullable()
    .optional(),
  establishment: z
    .union([z.string(), Z_EstablishmentSchema])
    .nullable()
    .optional(),
  insuranceAssignment: z
    .union([z.string(), Z_EstablishmentInsuranceAssignmentsSchema])
    .nullable()
    .optional(),
  documentType: z.union([z.string(), Z_DocumentTypesSchema]),
  status: z.enum(["valid", "expired", "invalid"]),
  validFrom: z.string(),
  validUntil: z.string(),
  pactosCheck: z.enum(["pending", "passed", "failed"]),
  description: z.string().nullable().optional(),
  // Not exposed on purpose
  // uploadedBy: z.union([z.string(), Z_UserSchema]).nullable().optional(),
  url: z.string().nullable().optional(),
  thumbnailURL: z.string().nullable().optional(),
  filename: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  filesize: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  focalX: z.number().nullable().optional(),
  focalY: z.number().nullable().optional(),
  sizes: z
    .object({
      thumbnail: z
        .object({
          url: z.string().nullable().optional(),
          width: z.number().nullable().optional(),
          height: z.number().nullable().optional(),
          mimeType: z.string().nullable().optional(),
          filesize: z.number().nullable().optional(),
          filename: z.string().nullable().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const Z_GetDocumentsForBusinessUnitAndParentInputSchema = z.object({
  businessUnitId: z.string(),
});

export const Z_GetDocumentsForBusinessUnitAndParentOutputSchema =
  Z_DocumentSchema.array();

export const Z_ListDocumentTypesOutputSchema = Z_DocumentTypesSchema.array();

export const Z_GetDocumentVersionsInputSchema = z.object({
  documentId: z.string(),
});

export const Z_GetDocumentsByBusinessUnitIdInputSchema = z.object({
  businessUnitId: z.string(),
  includeBusinessUnitParents: z.boolean().optional(),
  includeBusinessUnitDescendants: z.boolean().optional(),
  documentIds: z.array(z.string()).optional(),
});

export const Z_GetDocumentsInputSchema = z.object({
  businessUnitId: z.string().optional(),
  businessUnitIds: z.array(z.string()).optional(),
  includeBusinessUnitParents: z.boolean().optional(),
  documentIds: z.array(z.string()).optional(),
  establishmentIds: z.array(z.string()).optional(),
});

export const Z_UploadInsuranceDocumentInputSchema = z.object({
  documentType: z.string(),
  title: z.string(),
  establishmentNumber: z.string(),
  insuranceNumber: z.string(),
  status: z.enum(["valid", "expired"]),
  effectiveFrom: z.string(),
  effectiveTo: z.string(),
  pactosCheck: z.enum(["pending", "passed", "failed"]),
  file: z.string(),
  numberOfEmployees: z.number(),
});

export const Z_GetDocumentsOutputSchema = Z_DocumentSchema.array();
export const Z_DocumentSchemaOptionalId = Z_DocumentSchema.extend({
  id: Z_DocumentSchema.shape.id.optional(),
});

export const Z_GetDocumentVersionsOutputSchema = z.object({
  documents: z.array(
    z.object({
      parent: z.union([z.string(), Z_DocumentSchema]),
      createdAt: z.string(),
      id: z.string(), // Version ID
      publishedLocale: z.string().optional(),
      snapshot: z.boolean().optional(),
      updatedAt: z.string(),
      version: Z_DocumentSchemaOptionalId,
    })
  ),
});

// Types for TypeScript
export type T_DocumentType = z.infer<typeof Z_DocumentSchema>;

export type T_GetDocumentsForBusinessUnitAndParentInputType = z.infer<
  typeof Z_GetDocumentsForBusinessUnitAndParentInputSchema
>;
export type T_GetDocumentsForBusinessUnitAndParentOutputType = z.infer<
  typeof Z_GetDocumentsForBusinessUnitAndParentOutputSchema
>;

export type T_ListDocumentTypesOutputType = z.infer<
  typeof Z_ListDocumentTypesOutputSchema
>;
export type T_GetDocumentVersionsInputType = z.infer<
  typeof Z_GetDocumentVersionsInputSchema
>;
export type T_GetDocumentVersionsOutputType = z.infer<
  typeof Z_GetDocumentVersionsOutputSchema
>;

export type T_GetDocumentsByBusinessUnitIdInputType = z.infer<
  typeof Z_GetDocumentsByBusinessUnitIdInputSchema
>;
export type T_GetDocumentsInputType = z.infer<typeof Z_GetDocumentsInputSchema>;
export type T_GetDocumentsOutputType = z.infer<
  typeof Z_GetDocumentsOutputSchema
>;

export type T_UploadInsuranceDocumentInputType = z.infer<
  typeof Z_UploadInsuranceDocumentInputSchema
>;

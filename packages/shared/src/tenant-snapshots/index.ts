import { z } from "zod";
import { Z_BusinessUnitSchema } from "../business-units";
import { Z_DocumentSchema } from "../compliance-documents";
import { Z_EstablishmentInsuranceAssignmentsSchema } from "../establishment-insurance-assignments";
import { Z_TenantSchema } from "../tenants";

export const Z_TenantSnapshotsBusinessUnitsItemSchema =
  Z_BusinessUnitSchema.extend({
    /**
     * Makes document matching easier.
     */
    parentIds: z.array(z.string()),
  });
export type T_TenantSnapshotsBusinessUnitsItemType = z.infer<
  typeof Z_TenantSnapshotsBusinessUnitsItemSchema
>;

export const Z_TenantSnapshotsSchema = z.object({
  id: z.string(),
  title: z.string(),
  tenant: z.union([z.string(), Z_TenantSchema]),
  effectiveFrom: z.date(),
  effectiveTo: z.date(),
  businessUnits: z.array(Z_TenantSnapshotsBusinessUnitsItemSchema),
  insuranceAssignments: z.array(Z_EstablishmentInsuranceAssignmentsSchema),
  documents: z.array(Z_DocumentSchema),
});
export type T_TenantSnapshotsType = z.infer<typeof Z_TenantSnapshotsSchema>;

export const Z_TenantSnapshotReturnTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  tenant: z.union([z.string(), Z_TenantSchema]),
  effectiveFrom: z.date(),
  effectiveTo: z.date(),
  businessUnits: z.array(Z_TenantSnapshotsBusinessUnitsItemSchema),
  insuranceAssignments: z.array(Z_EstablishmentInsuranceAssignmentsSchema),
  documents: z.array(Z_DocumentSchema),
});

export type T_TenantSnapshotReturnType = z.infer<
  typeof Z_TenantSnapshotReturnTypeSchema
>;

export const Z_GetTenantSnapshotOutputSchema = z.array(
  Z_TenantSnapshotReturnTypeSchema
);

export type T_GetTenantSnapshotOutputType = z.infer<
  typeof Z_GetTenantSnapshotOutputSchema
>;

export const Z_SnapshotVersionCheckSchema = z.object({
  id: z.string(),
  updatedAt: z.string(),
});

export type T_SnapshotVersionCheckType = z.infer<
  typeof Z_SnapshotVersionCheckSchema
>;

export const Z_CheckUpdatedSnapshotsInputSchema = z.array(
  Z_SnapshotVersionCheckSchema
);

export type T_CheckUpdatedSnapshotsInputType = z.infer<
  typeof Z_CheckUpdatedSnapshotsInputSchema
>;

export const Z_UpdatedSnapshotSchema = Z_TenantSnapshotReturnTypeSchema.extend({
  updatedAt: z.string(),
});

export type T_UpdatedSnapshotType = z.infer<typeof Z_UpdatedSnapshotSchema>;

export const Z_CheckUpdatedSnapshotsOutputSchema = z.array(
  Z_UpdatedSnapshotSchema
);

export type T_CheckUpdatedSnapshotsOutputType = z.infer<
  typeof Z_CheckUpdatedSnapshotsOutputSchema
>;

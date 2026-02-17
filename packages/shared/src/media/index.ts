import z from "zod";

export const Z_MediaSchema = z.object({
  id: z.string(),
  updatedAt: z.string(),
  createdAt: z.string(),
  uploadedBy: z.any().optional().nullable(),
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

export type T_MediaType = z.infer<typeof Z_MediaSchema>;

export const Z_ListMediaOutputSchema = z.array(Z_MediaSchema);
export type T_ListMediaOutputType = z.infer<typeof Z_ListMediaOutputSchema>;

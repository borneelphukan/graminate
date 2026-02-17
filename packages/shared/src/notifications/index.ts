import { z } from "zod";

export const Z_SendEmailInputSchema = z.object({
  to: z.string().email({ message: "A valid recipient email is required." }),
  subject: z.string().min(1, { message: "Subject cannot be empty." }),
  bodyContent: z.string().min(1, { message: "Body content cannot be empty." }),
  bcc: z.string().email().optional(),
});

export const Z_SendEmailOutputSchema = z.object({
  success: z.boolean(),
});

export type T_SendEmailInput = z.infer<typeof Z_SendEmailInputSchema>;
export type T_SendEmailOutput = z.infer<typeof Z_SendEmailOutputSchema>;

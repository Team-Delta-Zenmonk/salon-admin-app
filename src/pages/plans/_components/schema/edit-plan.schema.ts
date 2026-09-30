import { z } from "zod";

export const editPlanSchema = z.object({
  name: z
    .string()
    .min(1, "Required")
    .max(50, "Maximum 50 characters"),
  amount: z.coerce
    .number({ invalid_type_error: "Price amount is required" })
    .min(0, "Price must be non-negative")
    .max(100000, "Price cannot exceed 1,00,000"),
  billing_cycle: z
    .string()
    .max(30, "Maximum 30 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(250, "Maximum 250 characters")
    .optional()
    .or(z.literal("")),
});

export const changePricingSchema = editPlanSchema;

export type EditPlanForm = z.infer<typeof editPlanSchema>;
export type ChangePricingForm = EditPlanForm;

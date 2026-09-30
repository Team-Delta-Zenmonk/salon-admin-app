import { z } from "zod";

export const editPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required")
    .max(255, "Plan name cannot exceed 255 characters"),
  amount: z.coerce
    .number({ required_error: "Required", invalid_type_error: "Amount must be a number" })
    .min(0, "Price amount cannot be negative"),
  duration_days: z.coerce
    .number({ required_error: "Required", invalid_type_error: "Duration days must be a number" })
    .int("Duration must be an integer number of days")
    .min(1, "Duration must be at least 1 day")
    .max(365, "Duration cannot exceed 365 days"),
  billing_cycle: z
    .string()
    .trim()
    .max(50, "Billing cycle tag cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(300, "Description cannot exceed 300 characters")
    .optional()
    .or(z.literal("")),
});

export const getEditPlanSchema = (planCode?: string) =>
  editPlanSchema.superRefine((data, ctx) => {
    const isFreeTier = planCode?.toLowerCase().trim() === "trial";
    if (!isFreeTier && data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Zero price (₹0) is only allowed for the free trial tier (code: trial)",
      });
    }
  });

export type EditPlanForm = z.infer<typeof editPlanSchema>;

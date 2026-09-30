import { z } from "zod";

export const createPlanSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Plan name is required")
      .max(255, "Plan name cannot exceed 255 characters"),
    code: z
      .string()
      .trim()
      .min(1, "Plan code is required")
      .max(50, "Plan code cannot exceed 50 characters")
      .regex(/^[a-z0-9_]+$/, "Code must contain only lowercase letters, numbers, and underscores"),
    amount: z.coerce
      .number({ required_error: "Price amount is required", invalid_type_error: "Amount must be a number" })
      .min(0, "Price amount cannot be negative"),
    duration_days: z.coerce
      .number({ required_error: "Duration days is required", invalid_type_error: "Duration days must be a number" })
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
  })
  .superRefine((data, ctx) => {
    const isFreeTier = data.code.toLowerCase().trim() === "trial";
    if (!isFreeTier && data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Zero price (₹0) is only allowed for the free trial tier (code: trial)",
      });
    }
  });

export type CreatePlanForm = z.infer<typeof createPlanSchema>;

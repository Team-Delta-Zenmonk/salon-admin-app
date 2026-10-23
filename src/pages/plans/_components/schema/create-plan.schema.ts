import { z } from "zod";

export const createPlanSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Required")
      .max(255, "Plan name cannot exceed 255 characters"),
    code: z
      .string()
      .trim()
      .min(1, "Required")
      .max(50, "Plan code cannot exceed 50 characters")
      .regex(/^[a-z0-9_]+$/, "Code must contain only lowercase letters, numbers, and underscores")
      .refine((val) => val.toLowerCase().trim() !== "trial", {
        message: "Code 'trial' is a reserved system tier and cannot be created",
      }),
    amount: z.coerce
      .number({ required_error: "Required", invalid_type_error: "Amount must be a number" })
      .positive("Price amount must be greater than 0"),
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
  })
  .superRefine((data, ctx) => {
    if (data.code.toLowerCase().trim() === "trial" || data.name.toLowerCase().trim() === "trial") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["code"],
        message: "Plan code 'trial' is a reserved system tier and cannot be created",
      });
    }
  });

export type CreatePlanForm = z.infer<typeof createPlanSchema>;

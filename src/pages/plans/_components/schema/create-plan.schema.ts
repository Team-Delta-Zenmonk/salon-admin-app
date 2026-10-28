import { z } from "zod";
import { getCurrencyConfig } from "../../../../common/currencies.config";

export const getCreatePlanSchema = (currencyCode?: string) => {
  const currencyConfig = getCurrencyConfig(currencyCode);
  return z
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
      amount: z
        .union([z.string(), z.number()])
        .refine((val) => val !== "" && val !== undefined && val !== null, {
          message: "Required",
        })
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val), {
          message: "Amount must be a number",
        })
        .refine((val) => val >= currencyConfig.minChargeAmount, {
          message: `Plan price must be at least ${currencyConfig.symbol}${currencyConfig.minChargeAmount} for paid plans (minimum payment requirement)`,
        }),
      duration_days: z
        .union([z.string(), z.number()])
        .refine((val) => val !== "" && val !== undefined && val !== null, {
          message: "Required",
        })
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val), {
          message: "Duration days must be a number",
        })
        .refine((val) => Number.isInteger(val), {
          message: "Duration must be an integer number of days",
        })
        .refine((val) => val >= 1, {
          message: "Duration must be at least 1 day",
        })
        .refine((val) => val <= 365, {
          message: "Duration cannot exceed 365 days",
        }),
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
};

export const createPlanSchema = getCreatePlanSchema();

export type CreatePlanForm = z.infer<typeof createPlanSchema>;

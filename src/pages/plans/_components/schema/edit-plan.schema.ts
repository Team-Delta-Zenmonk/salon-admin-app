import { z } from "zod";
import { getCurrencyConfig } from "../../../../common/currencies.config";

export const editPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required")
    .max(255, "Plan name cannot exceed 255 characters"),
  amount: z
    .union([z.string(), z.number()])
    .refine((val) => val !== "" && val !== undefined && val !== null, {
      message: "Required",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
      message: "Amount must be a number",
    })
    .refine((val) => val >= 0, {
      message: "Price amount cannot be negative",
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
});

export const getEditPlanSchema = (planCode?: string, currencyCode?: string) => {
  const currencyConfig = getCurrencyConfig(currencyCode);
  return editPlanSchema.superRefine((data, ctx) => {
    const isFreeTier = planCode?.toLowerCase().trim() === "trial";
    if (!isFreeTier && data.amount < currencyConfig.minChargeAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `Plan price must be at least ${currencyConfig.symbol}${currencyConfig.minChargeAmount} for paid plans (minimum payment requirement)`,
      });
    }
  });
};

export type EditPlanForm = z.infer<typeof editPlanSchema>;

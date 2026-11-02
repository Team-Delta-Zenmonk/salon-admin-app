import { z } from "zod";
import { getCurrencyConfig } from "../../../../common/currencies.config";

export const editPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required")
    .max(255, "Plan name cannot exceed 255 characters"),
  amount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: "Required",
        invalid_type_error: "Amount must be a number",
      })
      .min(0, "Price amount cannot be negative")
      .max(100000, "Maximum plan price can be ₹1,00,000 only")
  ),
  duration_days: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: "Required",
        invalid_type_error: "Duration days must be a number",
      })
      .int("Duration must be an integer number of days")
      .min(1, "Duration must be at least 1 day")
      .max(365, "Duration cannot exceed 365 days")
  ),
  billing_cycle: z
    .string()
    .trim()
    .max(50, "Billing cycle tag cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  code: z
    .string()
    .trim()
    .max(50, "Plan code cannot exceed 50 characters")
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
  const normalizedCode = planCode?.toLowerCase().trim();
  const isFreeTier = normalizedCode === "trial" || normalizedCode?.includes("trial");

  return editPlanSchema.superRefine((data, ctx) => {
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

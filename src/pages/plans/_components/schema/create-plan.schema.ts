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
      amount: z.preprocess(
        (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
        z
          .number({
            required_error: "Required",
            invalid_type_error: "Amount must be a number",
          })
          .min(
            currencyConfig.minChargeAmount,
            `Plan price must be at least ${currencyConfig.symbol}${currencyConfig.minChargeAmount} for paid plans (minimum payment requirement)`
          )
          .max(
            100000,
            `Maximum plan price can be ${currencyConfig.symbol}1,00,000 only`
          )
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
      badge: z
        .string()
        .trim()
        .max(50, "Badge cannot exceed 50 characters")
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

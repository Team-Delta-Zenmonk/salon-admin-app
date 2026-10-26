import { z } from "zod";
import {
  SUBSCRIPTION_PLAN,
  DISCOUNT_TYPE,
  PLAN_BASE_PRICES,
  type PaidSubscriptionPlan,
} from "@/common/enums/subscription.enum";
import type { BackendPlan } from "@/features/salons/list-salons/list-salons.service";

export const createSalonSchema = (backendPlans: BackendPlan[] = []) =>
  z
    .object({
      name: z.string().min(1, "Required").max(50, "Maximum 50 characters"),
      slug: z
        .string()
        .max(50, "Maximum 50 characters")
        .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and hyphens")
        .optional()
        .or(z.literal("")),
      email: z.string().min(1, "Required").email("Invalid email address").max(100, "Maximum 100 characters"),
      phone: z
        .string()
        .max(10, "Maximum 10 digits allowed")
        .regex(/^[0-9]*$/, "Only digits 0-9 are allowed")
        .optional(),
      password: z.string().min(8, "Password must be at least 8 characters").max(50, "Maximum 50 characters"),
      trial_days: z.coerce.number().min(1, "Minimum 1 day").max(90, "Maximum 90 days"),
      plan: z.string().min(1, "Please select a plan"),
      discount_type: z.enum([DISCOUNT_TYPE.MANUAL, DISCOUNT_TYPE.PERCENTAGE]),
      discount_value: z.coerce.number().min(0, "Discount cannot be negative").optional(),
    })
    .superRefine((data, ctx) => {
      if (data.discount_value !== undefined && data.discount_value > 0) {
        if (data.plan === SUBSCRIPTION_PLAN.TRIAL) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discount_value"],
            message: "Discounts can only be applied to paid plans",
          });
          return;
        }

        const matchedPlan = backendPlans.find((p) => p.id === data.plan || p.code === data.plan);
        const baseAmount =
          matchedPlan?.amount ??
          (PLAN_BASE_PRICES[data.plan as PaidSubscriptionPlan] || 0);

        if (data.discount_type === DISCOUNT_TYPE.PERCENTAGE) {
          if (data.discount_value > 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["discount_value"],
              message: "Percentage discount cannot exceed 100%",
            });
          }
        } else if (data.discount_type === DISCOUNT_TYPE.MANUAL) {
          if (baseAmount > 0 && data.discount_value > baseAmount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["discount_value"],
              message: `Discount amount cannot exceed the selected plan price (₹${baseAmount.toLocaleString()})`,
            });
          }
        }
      }
    });

export type CreateSalonForm = z.infer<ReturnType<typeof createSalonSchema>>;

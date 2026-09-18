import { z } from "zod";
import { SUBSCRIPTION_PLAN } from "@/common/enums/subscription.enum";

export const createSalonSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Maximum 50 characters"),
  slug: z.string().max(30, "Maximum 30 characters").regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and hyphens").optional().or(z.literal("")),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  trial_days: z.coerce.number().min(1, "Minimum 1 day").max(90, "Maximum 90 days"),
  plan: z.enum([SUBSCRIPTION_PLAN.TRIAL, SUBSCRIPTION_PLAN.MONTHLY, SUBSCRIPTION_PLAN.YEARLY] as const),
});

export type CreateSalonForm = z.infer<typeof createSalonSchema>;

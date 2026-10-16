import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Required")
    .email("Please enter a valid email address")
    .max(100, "Email cannot exceed 100 characters"),
  password: z
    .string()
    .min(1, "Required")
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password cannot exceed 50 characters"),
});

export type LoginForm = z.infer<typeof loginSchema>;

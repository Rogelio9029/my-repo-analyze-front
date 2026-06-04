import { z } from "zod";

export const loginSchema = z.object({
    email: z.email("Invalid email"),

    password: z
        .string()
        .min(6, "Password must contain at least 6 characters"),
});

export const registerSchema = z.object({
    email: z.email("Invalid email"),

    password: z
        .string()
        .min(6, "Password must contain at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export type RegisterSchema = z.infer<typeof registerSchema>;
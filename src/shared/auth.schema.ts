import { z } from 'zod';

// Skema untuk registrasi
export const registerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

// Skema untuk login
export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

// Mengekspor tipe TypeScript yang diinferensi dari skema Zod.
// Ini sangat berguna untuk frontend!
export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
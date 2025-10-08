// src/shared/auth.schema.ts
import { z } from 'zod';

/**
 * NOTE:
 * - Zod tidak menyediakan .example(). Jika Anda ingin dokumentasi/example di OpenAPI,
 *   gunakan plugin OpenAPI (zod-to-openapi / Elysia OpenAPI) atau simpan contoh terpisah.
 * - Saya menggunakan { message: '...' } untuk pesan validasi agar lebih eksplisit.
 */

export const registerSchema = z.object({
  username: z.string().min(3, { message: "Username minimal 3 karakter" }).describe('Nama pengguna, minimal 3 karakter'),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).describe('Password, minimal 6 karakter'),
  email: z.string().email({ message: "Email tidak valid" }).optional().describe('Email (opsional)')
});

export const loginSchema = z.object({
  username: z.string().min(3, { message: "Username minimal 3 karakter" }).describe('Nama pengguna'),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }).describe('Password')
});

// Jika Anda butuh contoh untuk dokumentasi / Postman / test, simpan contoh terpisah:
export const examples = {
  register: {
    username: "ariska",
    password: "rahasia123",
    email: "ariska@example.com"
  },
  login: {
    username: "ariska",
    password: "rahasia123"
  }
};

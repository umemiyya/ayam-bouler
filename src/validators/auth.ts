import { z } from 'zod';

const usernameSchema = z
  .string()
  .min(3, 'Username minimal 3 karakter')
  .max(32, 'Username maksimal 32 karakter')
  .regex(/^[a-zA-Z0-9_.]+$/, 'Username hanya boleh huruf, angka, titik, dan underscore');

const passwordSchema = z
  .string()
  .min(8, 'Kata sandi minimal 8 karakter')
  .regex(/[A-Z]/, 'Harus mengandung huruf besar')
  .regex(/[0-9]/, 'Harus mengandung angka');

export const roleSchema = z.enum(['user', 'admin']);

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    role: roleSchema.default('user'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirmPassword'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;
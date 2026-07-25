'use server';

import { redirect } from 'next/navigation';
import { findUserByUsername, createUser } from '@/services/notion-users';
import { hashPassword, verifyPassword } from '@/lib/password';
import { setSessionCookie, clearSessionCookie } from '@/lib/auth-server';
import { loginSchema, registerSchema } from '@/validators/auth';
import type { UserRole } from '@/types/auth';

interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function registerAction(input: {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid.' };
  }

  const { username, password, role } = parsed.data;

  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      return { success: false, error: 'Username sudah digunakan. Silakan gunakan username lain.' };
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ username, passwordHash, role });

    await setSessionCookie({
      sub: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error('registerAction error:', err);
    return { success: false, error: 'Gagal membuat akun. Silakan coba lagi.' };
  }

  redirect(role === 'admin' ? '/admin' : '/');
}

export async function loginAction(input: {
  username: string;
  password: string;
  role: UserRole;
}): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({ username: input.username, password: input.password });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid.' };
  }

  const { username, password } = parsed.data;

  let user;
  try {
    user = await findUserByUsername(username);
  } catch (err) {
    console.error('loginAction error:', err);
    return { success: false, error: 'Gagal menghubungi server. Silakan coba lagi.' };
  }

  if (!user) {
    return { success: false, error: 'Username atau kata sandi salah.' };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, error: 'Username atau kata sandi salah.' };
  }

  if (user.role !== input.role) {
    return {
      success: false,
      error:
        input.role === 'admin'
          ? 'Akun ini bukan akun admin. Gunakan tombol "Masuk sebagai User".'
          : 'Akun ini adalah akun admin. Gunakan tombol "Masuk sebagai Admin".',
    };
  }

  await setSessionCookie({
    sub: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
  });

  redirect(user.role === 'admin' ? '/admin' : '/');
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
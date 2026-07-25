import 'server-only';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from '@/lib/session';
import type { SessionPayload } from '@/types/auth';

/**
 * Helper untuk Server Components & Server Actions (Node runtime).
 * Tidak dipakai oleh middleware.ts (lihat lib/session.ts untuk versi Edge-safe).
 */

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
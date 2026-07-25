import { SignJWT, jwtVerify } from 'jose';
import type { SessionPayload } from '@/types/auth';

// File ini SENGAJA tidak mengimpor 'next/headers' ataupun library Node-only,
// agar bisa dipakai baik di Server Actions/Server Components (Node runtime)
// maupun di middleware.ts (Edge runtime).

export const SESSION_COOKIE_NAME = 'session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'AUTH_SECRET belum diset atau terlalu pendek (minimal 16 karakter) di environment variables.'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
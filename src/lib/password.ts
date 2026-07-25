import 'server-only';

import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  // Hash bcrypt selalu diawali $2a$, $2b$, atau $2y$
  const isBcryptHash = /^\$2[aby]\$/.test(hash);
  if (!isBcryptHash) {
    // hash tidak dikenali / rusak / dari library lain
    return false;
  }
  return bcrypt.compare(plain, hash);
}
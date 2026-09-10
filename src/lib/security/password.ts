/**
 * @file password.ts
 * @description Cryptographic utilities for password hashing (scrypt) and secure token generation/hashing.
 */

import { scrypt, randomBytes, timingSafeEqual, createHash } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keylen: 64,
  saltLen: 16,
};

/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Hashes a plaintext password using Node's crypto.scrypt.
 * Output format: scrypt$N=16384,r=8,p=1$<saltHex>$<derivedKeyHex>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SCRYPT_PARAMS.saltLen);
  const derivedKey = (await scryptAsync(password, salt, SCRYPT_PARAMS.keylen, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
  })) as Buffer;

  return `scrypt$N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash string using timingSafeEqual.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'scrypt') {
      return false;
    }

    const paramStr = parts[1]; // e.g. N=16384,r=8,p=1
    const saltHex = parts[2];
    const keyHex = parts[3];

    const params: Record<string, number> = {};
    for (const item of paramStr.split(',')) {
      const [k, v] = item.split('=');
      params[k] = parseInt(v, 10);
    }

    const salt = Buffer.from(saltHex, 'hex');
    const keyBuffer = Buffer.from(keyHex, 'hex');

    const derivedKey = (await scryptAsync(password, salt, keyBuffer.length, {
      N: params.N || SCRYPT_PARAMS.N,
      r: params.r || SCRYPT_PARAMS.r,
      p: params.p || SCRYPT_PARAMS.p,
    })) as Buffer;

    if (derivedKey.length !== keyBuffer.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, keyBuffer);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure random token (default 32 bytes / 64 hex chars).
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Computes a SHA-256 hash of a raw token for secure database storage.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

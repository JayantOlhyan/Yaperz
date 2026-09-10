/**
 * @file auth.test.ts
 * @description Unit tests for authentication cryptographic helpers, password security, email normalization,
 * and token hashing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  normalizeEmail,
  generateToken,
  hashToken,
} from '../../src/lib/security/password';
import { authRepository } from '../../src/lib/db/repositories/auth.repository';
import { customerRepository } from '../../src/lib/db/repositories/customer.repository';

describe('Password Security & Token Cryptography (scrypt & SHA-256)', () => {
  beforeEach(() => {
    authRepository.resetForTesting();
    customerRepository.resetForTesting();
  });

  it('normalizes email addresses by trimming and lowercasing', () => {
    expect(normalizeEmail('  USER@Domain.COM  ')).toBe('user@domain.com');
    expect(normalizeEmail('Customer.Streetwear@Yaperz.in')).toBe('customer.streetwear@yaperz.in');
  });

  it('hashes passwords with scrypt and verifies valid passwords correctly', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toContain('scrypt$N=16384,r=8,p=1$');
    expect(hash).not.toContain(rawPassword);

    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);
  });

  it('rejects incorrect passwords during scrypt verification', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    const isValid = await verifyPassword('WrongPassword999!', hash);
    expect(isValid).toBe(false);
  });

  it('generates random hex tokens and computes deterministic SHA-256 hashes', () => {
    const token = generateToken(32);
    expect(token).toHaveLength(64);

    const hash1 = hashToken(token);
    const hash2 = hashToken(token);
    expect(hash1).toHaveLength(64);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(token);
  });

  it('creates and retrieves session records using hashed token', async () => {
    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const session = await authRepository.createSession({
      tokenHash,
      customerId: 'cust-123',
      expiresAt,
    });

    expect(session.customerId).toBe('cust-123');

    const found = await authRepository.findSessionByTokenHash(tokenHash);
    expect(found).not.toBeNull();
    expect(found?.customerId).toBe('cust-123');
  });

  it('rejects expired sessions during retrieval', async () => {
    const rawToken = generateToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() - 1000); // 1 sec in past

    await authRepository.createSession({
      tokenHash,
      customerId: 'cust-expired',
      expiresAt,
    });

    const found = await authRepository.findSessionByTokenHash(tokenHash);
    expect(found).toBeNull();
  });
});

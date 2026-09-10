/**
 * @file auth.service.ts
 * @description Core Authentication and Session Service Layer.
 * Manages customer registration, credential verification, session creation/validation,
 * rate limiting, and password reset flows.
 */

import { customerRepository, CustomerRecord } from '../../db/repositories/customer.repository';
import { authRepository, SessionRecord } from '../../db/repositories/auth.repository';
import { hashPassword, verifyPassword, generateToken, hashToken, normalizeEmail } from '../../security/password';
import { rateLimiter } from '../../security/rate-limiter';
import { cartMergeService } from '../cart/cart-merge.service';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../../validation/auth.schema';
import {
  InvalidCredentialsError,
  DuplicateAccountError,
  AccountSuspendedError,
  InvalidTokenError,
  RateLimitedError,
} from '../../errors';

export const AUTH_COOKIE_NAME = 'yaperz_auth_session';
export const SESSION_EXPIRATION_DAYS = 30;

export interface SafeCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  marketingConsent: boolean;
  accountStatus: string;
  createdAt: Date;
}

export class AuthService {
  /**
   * Sanitizes customer record for safe client output.
   */
  public toSafeCustomer(customer: CustomerRecord): SafeCustomer {
    return {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      marketingConsent: customer.marketingConsent,
      accountStatus: customer.accountStatus,
      createdAt: customer.createdAt,
    };
  }

  /**
   * Registers a new customer account.
   */
  async register(
    data: RegisterInput,
    guestSessionToken?: string,
    ip = '127.0.0.1'
  ): Promise<{ customer: SafeCustomer; rawSessionToken: string }> {
    // Rate limiting: max 10 registrations per 15 mins per IP
    const rateCheck = await rateLimiter.check(`register:${ip}`, 10, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new RateLimitedError('Too many registration attempts. Please try again later.');
    }

    const email = normalizeEmail(data.email);
    const existing = await customerRepository.findByEmail(email);
    if (existing) {
      throw new DuplicateAccountError('An account with this email address already exists');
    }

    // Hash password with scrypt
    const passwordHash = await hashPassword(data.password);

    // Create customer record
    const customer = await customerRepository.createCustomer({
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || undefined,
      accountStatus: 'ACTIVE',
    });

    // Save credentials
    await authRepository.createCredentials({
      customerId: customer.id,
      passwordHash,
      passwordAlgo: 'scrypt',
    });

    // Create authenticated session
    const rawSessionToken = generateToken(32);
    const tokenHash = hashToken(rawSessionToken);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    await authRepository.createSession({
      tokenHash,
      customerId: customer.id,
      expiresAt,
    });

    // Perform guest cart merge if applicable
    if (guestSessionToken) {
      try {
        await cartMergeService.mergeGuestCart(guestSessionToken, customer.id, rawSessionToken);
      } catch {
        // Do not fail registration if cart merge fails
      }
    }

    return {
      customer: this.toSafeCustomer(customer),
      rawSessionToken,
    };
  }

  /**
   * Authenticates a customer by email and password.
   */
  async login(
    data: LoginInput,
    guestSessionToken?: string,
    ip = '127.0.0.1'
  ): Promise<{ customer: SafeCustomer; rawSessionToken: string }> {
    const email = normalizeEmail(data.email);

    // Rate limiting: max 5 login failures per 15 mins per email/IP
    const rateCheck = await rateLimiter.check(`login:${email}:${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new RateLimitedError('Too many failed login attempts. Please try again in 15 minutes.');
    }

    const customer = await customerRepository.findByEmail(email);
    if (!customer) {
      throw new InvalidCredentialsError('Invalid email address or password');
    }

    if (customer.accountStatus === 'SUSPENDED') {
      throw new AccountSuspendedError('Account has been suspended. Please contact customer support.');
    }

    const creds = await authRepository.findCredentialsByCustomerId(customer.id);
    if (!creds) {
      throw new InvalidCredentialsError('Invalid email address or password');
    }

    const isValid = await verifyPassword(data.password, creds.passwordHash);
    if (!isValid) {
      throw new InvalidCredentialsError('Invalid email address or password');
    }

    // Reset rate limiter on successful authentication
    await rateLimiter.reset(`login:${email}:${ip}`);

    // Create new session token (session rotation)
    const rawSessionToken = generateToken(32);
    const tokenHash = hashToken(rawSessionToken);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    await authRepository.createSession({
      tokenHash,
      customerId: customer.id,
      expiresAt,
    });

    // Perform guest cart merge
    if (guestSessionToken) {
      try {
        await cartMergeService.mergeGuestCart(guestSessionToken, customer.id, rawSessionToken);
      } catch {
        // Do not fail login if cart merge fails
      }
    }

    return {
      customer: this.toSafeCustomer(customer),
      rawSessionToken,
    };
  }

  /**
   * Invalidate authenticated session upon logout.
   */
  async logout(rawSessionToken: string): Promise<void> {
    if (!rawSessionToken) return;
    const tokenHash = hashToken(rawSessionToken);
    await authRepository.deleteSessionByTokenHash(tokenHash);
  }

  /**
   * Validates a raw session token and resolves the authenticated customer identity.
   */
  async validateSession(
    rawSessionToken: string
  ): Promise<{ customer: SafeCustomer; session: SessionRecord } | null> {
    if (!rawSessionToken) return null;
    const tokenHash = hashToken(rawSessionToken);

    const session = await authRepository.findSessionByTokenHash(tokenHash);
    if (!session) return null;

    const customer = await customerRepository.findById(session.customerId);
    if (!customer || customer.accountStatus === 'SUSPENDED') {
      await authRepository.deleteSessionByTokenHash(tokenHash);
      return null;
    }

    // Touch session for activity tracking (idle rotation check)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    if (session.lastActiveAt.getTime() < oneDayAgo) {
      await authRepository.touchSession(tokenHash);
    }

    return {
      customer: this.toSafeCustomer(customer),
      session,
    };
  }

  /**
   * Generates a password reset token (generic success to prevent account enumeration).
   */
  async forgotPassword(data: ForgotPasswordInput, ip = '127.0.0.1'): Promise<{ success: true; message: string }> {
    const email = normalizeEmail(data.email);

    // Rate limiting: max 3 reset attempts per 15 mins
    const rateCheck = await rateLimiter.check(`forgot-password:${email}:${ip}`, 3, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      throw new RateLimitedError('Too many password reset requests. Please try again later.');
    }

    const customer = await customerRepository.findByEmail(email);
    if (customer && customer.accountStatus !== 'SUSPENDED') {
      const rawToken = generateToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      await authRepository.createPasswordResetToken({
        tokenHash,
        customerId: customer.id,
        expiresAt,
      });

      // In production, dispatch email here. In dev/test, token is created safely.
    }

    // Generic safe response preventing account enumeration
    return {
      success: true,
      message: 'If an account exists for this email address, a password reset link has been dispatched.',
    };
  }

  /**
   * Consumes a password reset token and updates the customer's password.
   */
  async resetPassword(data: ResetPasswordInput): Promise<{ success: true; message: string }> {
    const tokenHash = hashToken(data.token);
    const resetTokenRecord = await authRepository.findPasswordResetToken(tokenHash);

    if (!resetTokenRecord) {
      throw new InvalidTokenError('Password reset token is invalid, expired, or has already been used.');
    }

    const newPasswordHash = await hashPassword(data.password);

    // Update credentials
    await authRepository.updatePassword(resetTokenRecord.customerId, newPasswordHash);

    // Mark reset token as used
    await authRepository.markPasswordResetTokenUsed(tokenHash);

    // Invalidate all active sessions for account security
    await authRepository.deleteAllCustomerSessions(resetTokenRecord.customerId);

    return {
      success: true,
      message: 'Password successfully updated. Please log in with your new credentials.',
    };
  }
}

export const authService = new AuthService();

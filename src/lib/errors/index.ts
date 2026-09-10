/**
 * @file errors/index.ts
 * @description Standardized Domain and Operational Error Classes for Yaperz E-commerce Backend.
 * Prevents raw database or stack trace exposure to API clients and provides structured error codes.
 */

export type ErrorCode =
  | 'PRODUCT_NOT_FOUND'
  | 'VARIANT_NOT_FOUND'
  | 'OUT_OF_STOCK'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_QUANTITY'
  | 'INVALID_COUPON'
  | 'CART_NOT_FOUND'
  | 'ORDER_NOT_FOUND'
  | 'PRICE_MISMATCH'
  | 'IDEMPOTENCY_CONFLICT'
  | 'VALIDATION_ERROR'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REQUIRED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  | 'DUPLICATE_ACCOUNT'
  | 'ACCOUNT_SUSPENDED'
  | 'INVALID_TOKEN'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: ErrorCode = 'INTERNAL_ERROR', statusCode = 500, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = 'PRODUCT_NOT_FOUND') {
    super(message, code, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class OutOfStockError extends AppError {
  constructor(message = 'Requested variant is out of stock', details?: unknown) {
    super(message, 'OUT_OF_STOCK', 409, details);
  }
}

export class InsufficientStockError extends AppError {
  constructor(message = 'Insufficient inventory available to fulfill quantity', details?: unknown) {
    super(message, 'INSUFFICIENT_STOCK', 409, details);
  }
}

export class InvalidCouponError extends AppError {
  constructor(message = 'The specified coupon code is invalid, expired, or does not meet criteria') {
    super(message, 'INVALID_COUPON', 400);
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(message = 'An order is already being processed or completed with this idempotency key') {
    super(message, 'IDEMPOTENCY_CONFLICT', 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required to access this resource') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid email address or password') {
    super(message, 'INVALID_CREDENTIALS', 401);
  }
}

export class DuplicateAccountError extends AppError {
  constructor(message = 'An account with this email address already exists') {
    super(message, 'DUPLICATE_ACCOUNT', 409);
  }
}

export class AccountSuspendedError extends AppError {
  constructor(message = 'Account has been suspended. Please contact customer support') {
    super(message, 'ACCOUNT_SUSPENDED', 403);
  }
}

export class InvalidTokenError extends AppError {
  constructor(message = 'Token is invalid, expired, or has already been used') {
    super(message, 'INVALID_TOKEN', 400);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please try again later') {
    super(message, 'RATE_LIMITED', 429);
  }
}


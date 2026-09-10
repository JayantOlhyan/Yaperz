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

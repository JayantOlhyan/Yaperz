/**
 * @file validation.test.ts
 * @description Unit Tests for Server-Side Zod Input Validation Schemas.
 * Enforces strict boundaries on PIN codes, mobile numbers, email addresses, and payload integrity.
 */

import { describe, it, expect } from 'vitest';
import { addressSchema, checkoutQuoteSchema } from '@/lib/validation/checkout.schema';
import { createOrderSchema } from '@/lib/validation/order.schema';

describe('Server-Side Zod Validation Schemas', () => {
  describe('Address Schema', () => {
    it('accepts valid Indian residential address', () => {
      const validAddress = {
        firstName: 'Jayant',
        lastName: 'Olhyan',
        phone: '9876543210',
        addressLine1: 'M-81, Block M, Greater Kailash-II',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110048',
        country: 'IN',
      };

      const result = addressSchema.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('rejects invalid PIN codes (letters, short length, long length)', () => {
      const base = {
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        addressLine1: 'Street 1',
        city: 'Delhi',
        state: 'Delhi',
        country: 'IN',
      };

      expect(addressSchema.safeParse({ ...base, postalCode: '11004' }).success).toBe(false); // 5 digits
      expect(addressSchema.safeParse({ ...base, postalCode: '1100488' }).success).toBe(false); // 7 digits
      expect(addressSchema.safeParse({ ...base, postalCode: 'PINCOD' }).success).toBe(false); // letters
      expect(addressSchema.safeParse({ ...base, postalCode: '110048' }).success).toBe(true); // valid 6 digits
    });

    it('rejects invalid mobile numbers', () => {
      const base = {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: 'Street 1',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110048',
        country: 'IN',
      };

      expect(addressSchema.safeParse({ ...base, phone: '12345' }).success).toBe(false); // too short
      expect(addressSchema.safeParse({ ...base, phone: '98765432101' }).success).toBe(false); // 11 digits
      expect(addressSchema.safeParse({ ...base, phone: '98765-43210' }).success).toBe(false); // formatting symbols
      expect(addressSchema.safeParse({ ...base, phone: '9876543210' }).success).toBe(true);
    });
  });

  describe('Checkout Quote Schema', () => {
    it('accepts valid quote request', () => {
      const validQuote = {
        items: [{ variantId: 'var-1-brn-m', quantity: 2 }],
        shippingMethod: 'standard',
        couponCode: 'WELCOME10',
      };

      const result = checkoutQuoteSchema.safeParse(validQuote);
      expect(result.success).toBe(true);
    });

    it('rejects empty items array', () => {
      const emptyQuote = {
        items: [],
        shippingMethod: 'standard',
      };

      const result = checkoutQuoteSchema.safeParse(emptyQuote);
      expect(result.success).toBe(false);
    });

    it('rejects quantity exceeding maximum SKU threshold (> 10)', () => {
      const overlimitQuote = {
        items: [{ variantId: 'var-1-brn-m', quantity: 15 }],
      };

      const result = checkoutQuoteSchema.safeParse(overlimitQuote);
      expect(result.success).toBe(false);
    });
  });

  describe('Order Creation Schema', () => {
    it('validates complete order placement payload', () => {
      const payload = {
        customerEmail: 'jayant@yaperz.com',
        customerPhone: '9876543210',
        shippingAddress: {
          firstName: 'Jayant',
          lastName: 'Olhyan',
          phone: '9876543210',
          addressLine1: 'M-81, Block M, GK-II',
          city: 'New Delhi',
          state: 'Delhi',
          postalCode: '110048',
          country: 'IN',
        },
        items: [{ variantId: 'var-1-brn-m', quantity: 1 }],
        shippingMethod: 'express',
        paymentMethod: 'RAZORPAY',
        idempotencyKey: 'idem-key-84920192',
      };

      const result = createOrderSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email formatting in order placement', () => {
      const invalidPayload = {
        customerEmail: 'not-an-email',
        customerPhone: '9876543210',
        shippingAddress: {
          firstName: 'Jayant',
          lastName: 'Olhyan',
          phone: '9876543210',
          addressLine1: 'M-81, Block M, GK-II',
          city: 'New Delhi',
          state: 'Delhi',
          postalCode: '110048',
          country: 'IN',
        },
        items: [{ variantId: 'var-1-brn-m', quantity: 1 }],
      };

      const result = createOrderSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});

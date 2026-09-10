/**
 * @file order.schema.ts
 * @description Zod Validation Schema for Order Placement Requests.
 * Validates buyer contact information, delivery address, item selections, and optional idempotency keys.
 */

import { z } from 'zod';
import { addressSchema, quoteItemSchema } from './checkout.schema';

export const createOrderSchema = z.object({
  customerEmail: z.string().trim().email('Valid email address is required'),
  customerPhone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Valid 10-digit Indian mobile number is required'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(), // Falls back to shipping address if omitted
  items: z.array(quoteItemSchema).min(1, 'Order must contain at least one item'),
  shippingMethod: z.enum(['standard', 'express', 'hand']).default('standard'),
  paymentMethod: z.enum(['RAZORPAY', 'COD', 'MOCK']).default('MOCK'),
  couponCode: z.string().trim().toUpperCase().optional(),
  idempotencyKey: z.string().trim().min(8).max(128).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

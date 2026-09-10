/**
 * @file checkout.schema.ts
 * @description Centralized Zod Validation Schemas for Shipping Addresses and Checkout Requests.
 * Enforces strict input validation on server boundaries: 6-digit Indian PIN codes, 10-digit mobile numbers,
 * and valid item line requests.
 */

import { z } from 'zod';

export const addressSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Must be a valid 10-digit Indian mobile number'),
  addressLine1: z.string().trim().min(3, 'Address line 1 must be at least 3 characters').max(255),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(2, 'City is required').max(100),
  state: z.string().trim().min(2, 'State is required').max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Must be a valid 6-digit Indian PIN code'),
  country: z.string().trim().default('IN'),
  landmark: z.string().trim().max(150).optional(),
});

export const quoteItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Max 10 items per SKU'),
});

export const checkoutQuoteSchema = z.object({
  items: z.array(quoteItemSchema).min(1, 'At least one item is required in cart'),
  shippingMethod: z.enum(['standard', 'express', 'hand']).default('standard'),
  couponCode: z.string().trim().toUpperCase().optional(),
  postalCode: z.string().trim().regex(/^\d{6}$/).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type CheckoutQuoteInput = z.infer<typeof checkoutQuoteSchema>;

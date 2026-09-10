/**
 * @file cart.schema.ts
 * @description Zod Validation Schemas for Server-Side Cart Item Additions and Updates.
 */

import { z } from 'zod';

export const addToCartSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 items per SKU'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(10, 'Maximum 10 items per SKU'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

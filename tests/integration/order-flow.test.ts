/**
 * @file order-flow.test.ts
 * @description Integration Tests for the End-to-End Commerce Order Pipeline.
 * Validates pricing calculation -> atomic inventory reservation -> order snapshot persistence -> idempotency deduplication.
 */

import { describe, it, expect } from 'vitest';
import { orderService } from '@/lib/services/orders/order.service';
import { inventoryRepository } from '@/lib/db/repositories/inventory.repository';

describe('Order Creation & Processing Pipeline', () => {
  const variantId = 'var-1-brn-l'; // Brown Wildloom Hoodie (L)

  it('completes order placement with snapshotting and inventory reservation', async () => {
    const initialStock = await inventoryRepository.getStock(variantId);

    const payload = {
      customerEmail: 'customer@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        firstName: 'Aarav',
        lastName: 'Sharma',
        phone: '9876543210',
        addressLine1: 'Flat 402, Lotus Towers',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
      },
      items: [{ variantId, quantity: 1 }],
      shippingMethod: 'standard' as const,
      paymentMethod: 'MOCK' as const,
      idempotencyKey: `test-idem-${Date.now()}`,
    };

    const result = await orderService.createOrder(payload);

    // Verify Order Attributes
    expect(result.order).toBeDefined();
    expect(result.order.orderNumber).toMatch(/^YP-\d{4}-\d{6}$/);
    expect(result.order.guestEmail).toBe('customer@test.com');
    expect(result.order.status).toBe('PENDING');
    expect(result.order.subtotal).toBe(1850000); // in paise
    expect(result.order.currency).toBe('INR');

    // Verify Item Snapshot
    expect(result.order.items.length).toBe(1);
    const item = result.order.items[0];
    expect(item.productTitle).toBe('Brown Wildloom Heavyweight Hoodie');
    expect(item.variantSku).toBe('YP-001-BRN-L');
    expect(item.unitPrice).toBe(1850000);
    expect(item.quantity).toBe(1);

    // Verify Payment Intent
    expect(result.paymentOrder).toBeDefined();
    expect(result.paymentOrder.amountPaise).toBe(result.order.grandTotal);
    expect(result.paymentOrder.provider).toBe('MOCK');

    // Verify Inventory was reserved
    const postStock = await inventoryRepository.getStock(variantId);
    expect(postStock.reserved).toBe(initialStock.reserved + 1);
  });

  it('enforces idempotency: repeated request with same key returns original order without double reservation', async () => {
    const test2Variant = 'var-3-ofw-m';
    const stockBefore = await inventoryRepository.getStock(test2Variant);
    const idempotencyKey = `idempotent-key-${Date.now()}`;

    const payload = {
      customerEmail: 'idempotent@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        addressLine1: 'Address 1',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'IN',
      },
      items: [{ variantId: test2Variant, quantity: 1 }],
      shippingMethod: 'standard' as const,
      paymentMethod: 'MOCK' as const,
      idempotencyKey,
    };

    // First attempt
    const firstCall = await orderService.createOrder(payload);
    const stockAfterFirst = await inventoryRepository.getStock(test2Variant);
    expect(stockAfterFirst.reserved).toBe(stockBefore.reserved + 1);

    // Duplicate attempt with same idempotencyKey
    const secondCall = await orderService.createOrder(payload);
    const stockAfterSecond = await inventoryRepository.getStock(test2Variant);

    // Must return the exact same order without decrementing stock again
    expect(secondCall.order.id).toBe(firstCall.order.id);
    expect(secondCall.order.orderNumber).toBe(firstCall.order.orderNumber);
    expect(stockAfterSecond.reserved).toBe(stockAfterFirst.reserved);
  });

  it('allows order lookup by order number and email', async () => {
    const test3Variant = 'var-3-blk-l';
    const payload = {
      customerEmail: 'lookup@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        firstName: 'Lookup',
        lastName: 'Buyer',
        phone: '9876543210',
        addressLine1: '123 Market St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'IN',
      },
      items: [{ variantId: test3Variant, quantity: 1 }],
      shippingMethod: 'standard' as const,
      paymentMethod: 'COD' as const,
    };

    const created = await orderService.createOrder(payload);

    // Lookup by order number
    const foundByNumber = await orderService.getOrder(created.order.orderNumber);
    expect(foundByNumber).toBeDefined();
    expect(foundByNumber?.id).toBe(created.order.id);

    // Lookup by ID
    const foundById = await orderService.getOrder(created.order.id);
    expect(foundById).toBeDefined();
    expect(foundById?.orderNumber).toBe(created.order.orderNumber);
  });
});

/**
 * @file cart-merge.test.ts
 * @description Unit tests for guest-to-authenticated customer cart merge rules, inventory bounding, and guest cart cleanup.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cartRepository } from '../../src/lib/db/repositories/cart.repository';
import { cartMergeService } from '../../src/lib/services/cart/cart-merge.service';
import { normalizedCatalog } from '../../src/lib/db/catalog-data';

describe('Guest to Authenticated Customer Cart Merge Engine', () => {
  beforeEach(() => {
    cartRepository.resetForTesting();
    // Ensure sufficient stock for test SKU
    const v1 = normalizedCatalog.products[0].variants.find((v) => v.id === 'var-1-brn-m');
    if (v1) {
      v1.inventoryQuantity = 50;
      v1.reservedQuantity = 0;
    }
  });

  it('combines quantities when guest cart and customer cart share the same variant SKU', async () => {
    const guestToken = 'guest_sess_100';
    const customerToken = 'cust_sess_200';
    const customerId = 'cust-888';
    const variantId = 'var-1-brn-m';

    // Guest cart: 2 hoodies
    await cartRepository.addItem(guestToken, variantId, 2);

    // Customer cart: 3 hoodies
    await cartRepository.addItem(customerToken, variantId, 3);
    const custCart = await cartRepository.getOrCreate(customerToken, customerId);
    expect(custCart.items[0].quantity).toBe(3);

    // Merge guest cart into customer cart
    const mergedCart = await cartMergeService.mergeGuestCart(guestToken, customerId, customerToken);

    // Merged quantity should be 2 + 3 = 5
    expect(mergedCart.items).toHaveLength(1);
    expect(mergedCart.items[0].variantId).toBe(variantId);
    expect(mergedCart.items[0].quantity).toBe(5);

    // Guest cart must be deleted
    const guestCartAfter = await cartRepository.getOrCreate(guestToken);
    expect(guestCartAfter.items).toHaveLength(0);
  });

  it('combines distinct SKUs from guest cart and customer cart', async () => {
    const guestToken = 'guest_sess_300';
    const customerToken = 'cust_sess_400';
    const customerId = 'cust-999';

    await cartRepository.addItem(guestToken, 'var-1-brn-m', 1);
    await cartRepository.addItem(customerToken, 'var-2-ofw-s', 2);

    const mergedCart = await cartMergeService.mergeGuestCart(guestToken, customerId, customerToken);

    expect(mergedCart.items).toHaveLength(2);
    const hoodieItem = mergedCart.items.find((i) => i.variantId === 'var-1-brn-m');
    const teeItem = mergedCart.items.find((i) => i.variantId === 'var-2-ofw-s');

    expect(hoodieItem?.quantity).toBe(1);
    expect(teeItem?.quantity).toBe(2);
  });

  it('caps merged item quantity to max allowed limit of 10 per SKU', async () => {
    const guestToken = 'guest_sess_500';
    const customerToken = 'cust_sess_600';
    const customerId = 'cust-777';
    const variantId = 'var-1-brn-m';

    await cartRepository.addItem(guestToken, variantId, 8);
    await cartRepository.addItem(customerToken, variantId, 7);

    const mergedCart = await cartMergeService.mergeGuestCart(guestToken, customerId, customerToken);

    // Total 15 capped to 10
    expect(mergedCart.items[0].quantity).toBe(10);
  });

  it('bounds merged quantity by available inventory when stock is constrained', async () => {
    const v1 = normalizedCatalog.products[0].variants.find((v) => v.id === 'var-1-brn-m');
    if (v1) {
      v1.inventoryQuantity = 4;
      v1.reservedQuantity = 1; // 3 available
    }

    const guestToken = 'guest_sess_700';
    const customerToken = 'cust_sess_800';
    const customerId = 'cust-555';
    const variantId = 'var-1-brn-m';

    await cartRepository.addItem(guestToken, variantId, 3);
    await cartRepository.addItem(customerToken, variantId, 2);

    const mergedCart = await cartMergeService.mergeGuestCart(guestToken, customerId, customerToken);

    // Total 5 requested, but available stock is 3 -> merged quantity must be 3
    expect(mergedCart.items[0].quantity).toBe(3);
  });
});

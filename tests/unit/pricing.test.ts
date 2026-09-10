/**
 * @file pricing.test.ts
 * @description Unit Tests for Authoritative Server-Side Pricing Engine.
 * Tests GST computations, tiered shipping thresholds, coupon reductions, and minor units (paise).
 */

import { describe, it, expect } from 'vitest';
import { pricingService } from '@/lib/services/pricing/pricing.service';
import { InvalidCouponError, NotFoundError } from '@/lib/errors';

describe('Pricing Engine (Server-Side)', () => {
  const hoodieVariantId = 'var-1-brn-m'; // Brown Wildloom Hoodie (M) - ₹18,500 (1850000 paise)
  const teeVariantId = 'var-3-ofw-l'; // Basics Tee (L) - ₹3,500 (350000 paise)

  it('calculates correct subtotal in paise and formatted INR for single item', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: hoodieVariantId, quantity: 1 }],
      shippingMethod: 'standard',
    });

    expect(quote.subtotalPaise).toBe(1850000);
    expect(quote.subtotalInr).toBe(18500);
    expect(quote.itemCount).toBe(1);
    expect(quote.items[0].sku).toBe('YP-001-BRN-M');
  });

  it('calculates multiple line items with subtotal aggregation', async () => {
    const quote = await pricingService.calculateQuote({
      items: [
        { variantId: hoodieVariantId, quantity: 1 }, // 18,500
        { variantId: teeVariantId, quantity: 2 }, // 3,500 * 2 = 7,000
      ],
      shippingMethod: 'standard',
    });

    // 18,500 + 7,000 = 25,500 (2550000 paise)
    expect(quote.subtotalPaise).toBe(2550000);
    expect(quote.subtotalInr).toBe(25500);
    expect(quote.itemCount).toBe(3);
  });

  it('applies free shipping for subtotal >= ₹5,000 on standard shipping', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: hoodieVariantId, quantity: 1 }], // 18,500 > 5,000
      shippingMethod: 'standard',
    });

    expect(quote.isEligibleForFreeShipping).toBe(true);
    expect(quote.shippingFeePaise).toBe(0);
    expect(quote.shippingFeeFormatted).toBe('FREE');
    expect(quote.grandTotalPaise).toBe(1850000);
  });

  it('charges ₹150 standard shipping for orders below ₹5,000', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: teeVariantId, quantity: 1 }], // 3,500 < 5,000
      shippingMethod: 'standard',
    });

    expect(quote.isEligibleForFreeShipping).toBe(false);
    expect(quote.shippingFeePaise).toBe(15000);
    expect(quote.amountNeededForFreeShippingPaise).toBe(150000); // Needs ₹1,500 more
    expect(quote.grandTotalPaise).toBe(350000 + 15000); // 365000 paise = ₹3,650
  });

  it('charges ₹350 for express shipping regardless of subtotal', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: hoodieVariantId, quantity: 1 }],
      shippingMethod: 'express',
    });

    expect(quote.shippingFeePaise).toBe(35000);
    expect(quote.grandTotalPaise).toBe(1850000 + 35000);
  });

  it('charges ₹6,000 for luxury white-glove hand delivery', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: hoodieVariantId, quantity: 1 }],
      shippingMethod: 'hand',
    });

    expect(quote.shippingFeePaise).toBe(600000);
    expect(quote.grandTotalPaise).toBe(1850000 + 600000);
  });

  it('calculates 12% GST breakdown accurately', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: hoodieVariantId, quantity: 1 }],
    });

    // Subtotal: 1850000 paise. 12% GST = 222000 paise (₹2,220)
    expect(quote.taxRatePercent).toBe(12);
    expect(quote.taxPaise).toBe(222000);
    expect(quote.taxInr).toBe(2220);
  });

  it('applies WELCOME10 percentage coupon with maximum savings cap', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: hoodieVariantId, quantity: 1 }], // 18,500 -> 10% is 1,850, capped at 1,000
      couponCode: 'WELCOME10',
    });

    expect(quote.discountPaise).toBe(100000); // ₹1,000 max cap
    expect(quote.grandTotalPaise).toBe(1850000 - 100000); // 17,500
  });

  it('applies FLAT500 fixed coupon correctly', async () => {
    const quote = await pricingService.calculateQuote({
      items: [{ variantId: teeVariantId, quantity: 1 }], // 3,500 > 3,000 min
      shippingMethod: 'standard',
      couponCode: 'FLAT500',
    });

    // 3,500 - 500 = 3,000 + 150 shipping (since 3,000 < 5,000)
    expect(quote.discountPaise).toBe(50000);
    expect(quote.grandTotalPaise).toBe(300000 + 15000);
  });

  it('rejects coupon when subtotal does not meet minimum threshold', async () => {
    await expect(
      pricingService.calculateQuote({
        items: [{ variantId: teeVariantId, quantity: 1 }], // 3,500 < 5,000 threshold for YAPERZ20
        couponCode: 'YAPERZ20',
      })
    ).rejects.toThrow(InvalidCouponError);
  });

  it('rejects nonexistent coupon codes', async () => {
    await expect(
      pricingService.calculateQuote({
        items: [{ variantId: hoodieVariantId, quantity: 1 }],
        couponCode: 'FAKECOUPON99',
      })
    ).rejects.toThrow(InvalidCouponError);
  });

  it('rejects nonexistent variant IDs', async () => {
    await expect(
      pricingService.calculateQuote({
        items: [{ variantId: 'nonexistent-sku-xyz', quantity: 1 }],
      })
    ).rejects.toThrow(NotFoundError);
  });
});

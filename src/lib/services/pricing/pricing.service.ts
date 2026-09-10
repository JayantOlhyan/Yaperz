/**
 * @file pricing.service.ts
 * @description Authoritative Server-Side Pricing and Tax Engine for Yaperz E-commerce.
 * Solves Phase 1 P0 Production Blocker: Browser totals and client-supplied prices are NEVER trusted.
 * All computations are performed in integer minor units (paise) to eliminate floating-point inaccuracies.
 */

import { productRepository } from '../../db/repositories/product.repository';
import { NotFoundError, InvalidCouponError } from '../../errors';
import { formatPaise, paiseToInr } from '../../currency';

export interface PricingItemInput {
  variantId: string;
  quantity: number;
}

export interface CalculatedLineItem {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  size: string;
  color: string;
  unitPricePaise: number;
  unitPriceFormatted: string;
  quantity: number;
  lineTotalPaise: number;
  lineTotalFormatted: string;
}

export interface PricingQuoteOutput {
  items: CalculatedLineItem[];
  itemCount: number;
  subtotalPaise: number;
  subtotalInr: number;
  subtotalFormatted: string;
  discountPaise: number;
  discountInr: number;
  discountFormatted: string;
  appliedCoupon?: {
    code: string;
    description: string;
    savingsPaise: number;
  };
  shippingFeePaise: number;
  shippingFeeInr: number;
  shippingFeeFormatted: string;
  shippingMethod: 'standard' | 'express' | 'hand';
  taxPaise: number;
  taxInr: number;
  taxFormatted: string;
  taxRatePercent: number;
  grandTotalPaise: number;
  grandTotalInr: number;
  grandTotalFormatted: string;
  isEligibleForFreeShipping: boolean;
  amountNeededForFreeShippingPaise: number;
}

// Shipping constants in paise
export const FREE_SHIPPING_THRESHOLD_PAISE = 500000; // ₹5,000
export const STANDARD_SHIPPING_FEE_PAISE = 15000; // ₹150
export const EXPRESS_SHIPPING_FEE_PAISE = 35000; // ₹350
export const HAND_DELIVERED_FEE_PAISE = 600000; // ₹6,000

// Standard GST rate (12.00%)
export const GST_RATE_PERCENT = 12;

interface CouponRule {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; // percentage (e.g. 10) or paise
  minSubtotalPaise: number;
  maxDiscountPaise?: number;
  description: string;
}

const ACTIVE_COUPONS: Record<string, CouponRule> = {
  WELCOME10: {
    code: 'WELCOME10',
    type: 'PERCENTAGE',
    value: 10,
    minSubtotalPaise: 250000, // ₹2,500
    maxDiscountPaise: 100000, // max ₹1,000 savings
    description: '10% off on orders above ₹2,500',
  },
  YAPERZ20: {
    code: 'YAPERZ20',
    type: 'PERCENTAGE',
    value: 20,
    minSubtotalPaise: 500000, // ₹5,000
    maxDiscountPaise: 250000, // max ₹2,500 savings
    description: '20% off on orders above ₹5,000',
  },
  FLAT500: {
    code: 'FLAT500',
    type: 'FIXED',
    value: 50000, // ₹500
    minSubtotalPaise: 300000, // ₹3,000
    description: 'Flat ₹500 off on orders above ₹3,000',
  },
};

export class PricingService {
  /**
   * Authoritatively computes order pricing, line items, taxes, shipping, and discounts.
   */
  async calculateQuote(params: {
    items: PricingItemInput[];
    shippingMethod?: 'standard' | 'express' | 'hand';
    couponCode?: string;
    postalCode?: string;
  }): Promise<PricingQuoteOutput> {
    const shippingMethod = params.shippingMethod || 'standard';
    const calculatedItems: CalculatedLineItem[] = [];
    let subtotalPaise = 0;
    let itemCount = 0;

    // 1. Authoritative Database Lookup per Variant
    for (const input of params.items) {
      if (input.quantity <= 0) continue;

      const variant = await productRepository.findVariantById(input.variantId);
      if (!variant) {
        throw new NotFoundError(`Product variant not found: ${input.variantId}`, 'VARIANT_NOT_FOUND');
      }

      const product = await productRepository.findById(variant.productId);
      const lineTotalPaise = variant.price * input.quantity;
      subtotalPaise += lineTotalPaise;
      itemCount += input.quantity;

      calculatedItems.push({
        variantId: variant.id,
        productId: variant.productId,
        title: product?.title || 'Yaperz Apparel',
        sku: variant.sku,
        size: variant.size,
        color: variant.colorName,
        unitPricePaise: variant.price,
        unitPriceFormatted: formatPaise(variant.price),
        quantity: input.quantity,
        lineTotalPaise,
        lineTotalFormatted: formatPaise(lineTotalPaise),
      });
    }

    // 2. Compute Discounts
    let discountPaise = 0;
    let appliedCoupon: PricingQuoteOutput['appliedCoupon'] = undefined;

    if (params.couponCode && params.couponCode.trim().length > 0) {
      const codeUpper = params.couponCode.trim().toUpperCase();
      const rule = ACTIVE_COUPONS[codeUpper];

      if (!rule) {
        throw new InvalidCouponError(`Coupon code '${codeUpper}' is invalid or expired.`);
      }

      if (subtotalPaise < rule.minSubtotalPaise) {
        throw new InvalidCouponError(
          `Coupon '${codeUpper}' requires a minimum cart subtotal of ${formatPaise(rule.minSubtotalPaise)}.`
        );
      }

      if (rule.type === 'PERCENTAGE') {
        let calculated = Math.round((subtotalPaise * rule.value) / 100);
        if (rule.maxDiscountPaise && calculated > rule.maxDiscountPaise) {
          calculated = rule.maxDiscountPaise;
        }
        discountPaise = calculated;
      } else if (rule.type === 'FIXED') {
        discountPaise = Math.min(subtotalPaise, rule.value);
      }

      appliedCoupon = {
        code: rule.code,
        description: rule.description,
        savingsPaise: discountPaise,
      };
    }

    // 3. Compute Shipping Fees
    let shippingFeePaise = 0;
    const isEligibleForFreeShipping = subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE;
    const amountNeededForFreeShippingPaise = Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise);

    if (shippingMethod === 'hand') {
      shippingFeePaise = HAND_DELIVERED_FEE_PAISE;
    } else if (shippingMethod === 'express') {
      shippingFeePaise = EXPRESS_SHIPPING_FEE_PAISE;
    } else {
      // standard
      shippingFeePaise = isEligibleForFreeShipping ? 0 : STANDARD_SHIPPING_FEE_PAISE;
    }

    // 4. Compute GST Tax (Included or Calculated)
    // 12% GST calculated on net taxable value (subtotal - discount)
    const taxableSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);
    const taxPaise = Math.round((taxableSubtotalPaise * GST_RATE_PERCENT) / 100);

    // 5. Grand Total (in paise)
    const grandTotalPaise = taxableSubtotalPaise + shippingFeePaise;

    return {
      items: calculatedItems,
      itemCount,
      subtotalPaise,
      subtotalInr: paiseToInr(subtotalPaise),
      subtotalFormatted: formatPaise(subtotalPaise),
      discountPaise,
      discountInr: paiseToInr(discountPaise),
      discountFormatted: formatPaise(discountPaise),
      appliedCoupon,
      shippingFeePaise,
      shippingFeeInr: paiseToInr(shippingFeePaise),
      shippingFeeFormatted: shippingFeePaise === 0 ? 'FREE' : formatPaise(shippingFeePaise),
      shippingMethod,
      taxPaise,
      taxInr: paiseToInr(taxPaise),
      taxFormatted: formatPaise(taxPaise),
      taxRatePercent: GST_RATE_PERCENT,
      grandTotalPaise,
      grandTotalInr: paiseToInr(grandTotalPaise),
      grandTotalFormatted: formatPaise(grandTotalPaise),
      isEligibleForFreeShipping,
      amountNeededForFreeShippingPaise,
    };
  }
}

export const pricingService = new PricingService();

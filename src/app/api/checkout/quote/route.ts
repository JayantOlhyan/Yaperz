/**
 * @file api/checkout/quote/route.ts
 * @description Server-Side Checkout Quote API Route Handler.
 * Computes authoritative pricing breakdown, GST (12%), tiered shipping, and verified discount deductions.
 * Solves Phase 1 P0 Blocker: Prevents client price-tampering attacks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkoutQuoteSchema } from '@/lib/validation/checkout.schema';
import { pricingService } from '@/lib/services/pricing/pricing.service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = checkoutQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { items, shippingMethod, couponCode, postalCode } = validation.data;

    const quote = await pricingService.calculateQuote({
      items,
      shippingMethod,
      couponCode,
      postalCode,
    });

    return NextResponse.json({
      success: true,
      data: quote,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          code: error.code,
          error: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error('Error in POST /api/checkout/quote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute checkout quote' },
      { status: 500 }
    );
  }
}

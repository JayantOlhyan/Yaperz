/**
 * @file api/cart/items/route.ts
 * @description Cart Item Mutation API Route Handler.
 * Supports adding variants, updating quantities, and deleting items with server stock checks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/lib/services/cart/cart.service';
import { addToCartSchema, updateCartItemSchema } from '@/lib/validation/cart.schema';
import { AppError } from '@/lib/errors';

function getSessionToken(request: NextRequest): string {
  let token = request.cookies.get('yaperz_session')?.value;
  if (!token) {
    token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    const body = await request.json();
    const validation = addToCartSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const { variantId, quantity } = validation.data;
    const cart = await cartService.addItem(sessionToken, variantId, quantity);

    const res = NextResponse.json({ success: true, data: cart });
    if (!request.cookies.get('yaperz_session')) {
      res.cookies.set('yaperz_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return res;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, code: error.code, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Error in POST /api/cart/items:', error);
    return NextResponse.json({ success: false, error: 'Failed to add item to cart' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    const body = await request.json();
    const { variantId, quantity } = body;

    if (!variantId || typeof quantity !== 'number') {
      return NextResponse.json({ success: false, error: 'variantId and quantity are required' }, { status: 400 });
    }

    const validation = updateCartItemSchema.safeParse({ quantity });
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 });
    }

    const cart = await cartService.updateQuantity(sessionToken, variantId, quantity);
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, code: error.code, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Error in PATCH /api/cart/items:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = getSessionToken(request);
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');

    if (!variantId) {
      return NextResponse.json({ success: false, error: 'variantId is required' }, { status: 400 });
    }

    const cart = await cartService.removeItem(sessionToken, variantId);
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error('Error in DELETE /api/cart/items:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove item' }, { status: 500 });
  }
}

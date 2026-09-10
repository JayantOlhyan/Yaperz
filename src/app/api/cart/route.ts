/**
 * @file api/cart/route.ts
 * @description Server-Side Cart Retrieval and Lifecycle API Route Handler.
 * Binds shopping cart to HTTP session cookie and returns enriched line item details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cartService } from '@/lib/services/cart/cart.service';

function getOrCreateSessionToken(request: NextRequest, response: NextResponse): string {
  let token = request.cookies.get('yaperz_session')?.value;
  if (!token) {
    token = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    response.cookies.set('yaperz_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return token;
}

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const sessionToken = getOrCreateSessionToken(request, response);
    const cart = await cartService.getDetailedCart(sessionToken);

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve server cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('yaperz_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: true, data: { items: [], itemCount: 0, subtotalPaise: 0 } });
    }
    const cart = await cartService.clear(sessionToken);
    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}

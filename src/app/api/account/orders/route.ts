/**
 * @file api/account/orders/route.ts
 * @description Customer Order History API Route Handler.
 * Returns authenticated customer orders derived strictly from verified server session identity.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';
import { orderRepository } from '@/lib/db/repositories/order.repository';
import { UnauthorizedError, AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!rawSessionToken) {
      throw new UnauthorizedError();
    }

    const sessionData = await authService.validateSession(rawSessionToken);
    if (!sessionData) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const orders = await orderRepository.findByCustomerId(
      sessionData.customer.id,
      sessionData.customer.email
    );

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Error in GET /api/account/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order history' },
      { status: 500 }
    );
  }
}

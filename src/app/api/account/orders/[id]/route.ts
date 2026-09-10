/**
 * @file api/account/orders/[id]/route.ts
 * @description Single Customer Order Detail API Route Handler.
 * Enforces ownership check (order.customerId === session.customerId) to eliminate IDOR vulnerability.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';
import { orderRepository } from '@/lib/db/repositories/order.repository';
import { UnauthorizedError, ForbiddenError, NotFoundError, AppError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!rawSessionToken) {
      throw new UnauthorizedError();
    }

    const sessionData = await authService.validateSession(rawSessionToken);
    if (!sessionData) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const { id: orderIdOrNumber } = await context.params;
    const order = await orderRepository.findByIdOrNumber(orderIdOrNumber);

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    // Ownership check (IDOR protection)
    const isOwner =
      order.customerId === sessionData.customer.id ||
      order.guestEmail.toLowerCase() === sessionData.customer.email.toLowerCase();

    if (!isOwner) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Error in GET /api/account/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
}

/**
 * @file api/orders/route.ts
 * @description Orders Collection API Route Handler.
 * POST: Places order with atomic inventory reservation, server pricing, and payment intent generation.
 * GET: Retrieves order history by customer email or identifier.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrderSchema } from '@/lib/validation/order.schema';
import { orderService } from '@/lib/services/orders/order.service';
import { orderRepository } from '@/lib/db/repositories/order.repository';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

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

    const result = await orderService.createOrder(validation.data);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 201 }
    );
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

    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal order processing error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const identifier = searchParams.get('identifier');

    if (identifier) {
      const order = await orderService.getOrder(identifier);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: order });
    }

    if (email) {
      const orders = await orderRepository.findByEmail(email);
      return NextResponse.json({ success: true, data: orders });
    }

    return NextResponse.json(
      { success: false, error: 'Provide an email or identifier query parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

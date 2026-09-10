/**
 * @file api/orders/[id]/route.ts
 * @description Single Order Detail API Route Handler.
 * Returns immutable historical snapshot of order items, shipping address, and fulfillment status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/services/orders/order.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await orderService.getOrder(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}

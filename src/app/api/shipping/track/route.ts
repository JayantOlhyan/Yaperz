/**
 * @file api/shipping/track/route.ts
 * @description Logistics and Live Courier Tracking API Route Handler.
 * Returns milestone progress and delivery estimates for orders and carrier tracking codes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { shippingProvider } from '@/lib/services/shipping/shipping.provider';
import { orderService } from '@/lib/services/orders/order.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber') || searchParams.get('orderId');

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number or order ID is required' },
        { status: 400 }
      );
    }

    // Check if identifier is an existing order
    const order = await orderService.getOrder(trackingNumber);
    const resolvedTrackingCode = order ? `AWB-${order.orderNumber}` : trackingNumber;

    const trackingData = await shippingProvider.getTracking(resolvedTrackingCode);

    return NextResponse.json({
      success: true,
      data: {
        ...trackingData,
        orderNumber: order?.orderNumber || trackingNumber,
        status: order?.status || trackingData.currentStatus,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/shipping/track:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tracking information' },
      { status: 500 }
    );
  }
}

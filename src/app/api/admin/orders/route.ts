import { NextRequest, NextResponse } from 'next/server';
import { getAdminOrders, saveAdminOrders } from '@/lib/data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const orders = getAdminOrders();
    const filtered = status
      ? orders.filter((o) => o.status.toLowerCase() === status.toLowerCase())
      : orders;

    return NextResponse.json({ success: true, data: filtered });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, trackingNumber, carrier } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const orders = getAdminOrders();
    const index = orders.findIndex((o) => o.id === id || o.orderNumber === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    orders[index] = {
      ...orders[index],
      status: status || orders[index].status,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : orders[index].trackingNumber,
      carrier: carrier !== undefined ? carrier : orders[index].carrier,
      updatedAt: new Date().toISOString(),
    };

    saveAdminOrders(orders);
    return NextResponse.json({ success: true, data: orders[index] });
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed request payload' }, { status: 400 });
  }
}

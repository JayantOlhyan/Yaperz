import { NextResponse } from 'next/server';
import { getCatalogProducts, getAdminOrders, getStories } from '@/lib/data-store';

export async function GET() {
  try {
    const products = getCatalogProducts();
    const orders = getAdminOrders();
    const stories = getStories();

    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.inventory < 5).length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    const activeStoriesCount = stories.filter((s) => s.isActive !== false).length;

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        totalOrders,
        totalRevenue,
        activeStoriesCount,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Error computing admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}

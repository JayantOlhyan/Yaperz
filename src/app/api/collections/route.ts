/**
 * @file api/collections/route.ts
 * @description Collections Listing API Route Handler.
 * Returns collection categories and product counts for navigation bars and collection portals.
 */

import { NextResponse } from 'next/server';
import { productRepository } from '@/lib/db/repositories/product.repository';

export async function GET() {
  try {
    const collections = await productRepository.getCollections();
    return NextResponse.json({
      success: true,
      data: collections,
    });
  } catch (error) {
    console.error('Error in GET /api/collections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve collections' },
      { status: 500 }
    );
  }
}

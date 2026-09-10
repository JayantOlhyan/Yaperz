/**
 * @file api/products/route.ts
 * @description Product Listing and Faceted Search API Route Handler.
 * Supports filtering by category, collection, price range (in paise/rupees), sizes, colors, and search keywords.
 */

import { NextRequest, NextResponse } from 'next/server';
import { productRepository } from '@/lib/db/repositories/product.repository';
import { inrToPaise } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const collection = searchParams.get('collection') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = (searchParams.get('sort') as 'featured' | 'price-asc' | 'price-desc' | 'newest') || 'featured';
    const inStockOnly = searchParams.get('inStock') === 'true';

    const minPriceRaw = searchParams.get('minPrice');
    const maxPriceRaw = searchParams.get('maxPrice');
    const minPrice = minPriceRaw ? inrToPaise(Number(minPriceRaw)) : undefined;
    const maxPrice = maxPriceRaw ? inrToPaise(Number(maxPriceRaw)) : undefined;

    const sizesParam = searchParams.get('sizes');
    const sizes = sizesParam ? sizesParam.split(',').filter(Boolean) : undefined;

    const colorsParam = searchParams.get('colors');
    const colors = colorsParam ? colorsParam.split(',').filter(Boolean) : undefined;

    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || 12));

    const result = await productRepository.findMany({
      category,
      collection,
      search,
      sortBy,
      inStockOnly,
      minPrice,
      maxPrice,
      sizes,
      colors,
      page,
      pageSize,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

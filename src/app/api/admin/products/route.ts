import { NextRequest, NextResponse } from 'next/server';
import { getCatalogProducts, saveCatalogProducts } from '@/lib/data-store';
import { Product } from '@/types';

export async function GET() {
  const products = getCatalogProducts();
  return NextResponse.json({ success: true, data: products });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, price, compare_at_price, category, collections, tags, sizes, colors, images, inventory, description, care } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, price, and category are required' },
        { status: 400 }
      );
    }

    const products = getCatalogProducts();
    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check slug collision
    if (products.some((p) => p.slug === generatedSlug)) {
      return NextResponse.json(
        { success: false, error: 'Product slug already exists' },
        { status: 409 }
      );
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      title,
      slug: generatedSlug,
      price: Number(price),
      compare_at_price: compare_at_price ? Number(compare_at_price) : null,
      category,
      collections: Array.isArray(collections) ? collections : ['new-in'],
      tags: Array.isArray(tags) ? tags : [],
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : ['Black'],
      images: Array.isArray(images) && images.length > 0 ? images : ['/images/products/hoodie-brown-1.jpg'],
      inventory: Number(inventory) || 10,
      description: description || 'Premium heavyweight streetwear crafted with bespoke precision.',
      care: care || 'Machine wash cold inside out with similar colors.',
    };

    products.unshift(newProduct);
    const saved = saveCatalogProducts(products);

    if (!saved) {
      return NextResponse.json({ success: false, error: 'Failed to persist product' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed request payload' }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const products = getCatalogProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    products[index] = {
      ...products[index],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : products[index].price,
      compare_at_price: updates.compare_at_price !== undefined ? (updates.compare_at_price ? Number(updates.compare_at_price) : null) : products[index].compare_at_price,
      inventory: updates.inventory !== undefined ? Number(updates.inventory) : products[index].inventory,
    };

    saveCatalogProducts(products);
    return NextResponse.json({ success: true, data: products[index] });
  } catch {
    return NextResponse.json({ success: false, error: 'Malformed request payload' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const products = getCatalogProducts();
    const filtered = products.filter((p) => p.id !== id);

    saveCatalogProducts(filtered);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete product' }, { status: 500 });
  }
}

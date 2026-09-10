/**
 * @file catalog-data.ts
 * @description Deterministic Normalization and Seed Generator for Yaperz Product Catalog.
 * Converts flat products.json into normalized relational entities:
 * Categories, Collections, Products, SKU-level Variants (Size × Color), and Images.
 */

import rawProducts from '../../data/products.json';
import { inrToPaise } from '../currency';

export interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface NormalizedCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
}

export interface NormalizedVariant {
  id: string;
  productId: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number; // in paise
  compareAtPrice: number | null; // in paise
  inventoryQuantity: number;
  reservedQuantity: number;
  weightGrams: number;
  isActive: boolean;
}

export interface NormalizedImage {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface NormalizedProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  careInstructions: string;
  categoryId: string;
  categoryName: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  brand: string;
  hsnCode: string;
  taxRateBps: number;
  variants: NormalizedVariant[];
  images: NormalizedImage[];
  collectionSlugs: string[];
  tags: string[];
}

export const COLOR_CODE_MAP: Record<string, string> = {
  Brown: 'BRN',
  Beige: 'BGE',
  Black: 'BLK',
  White: 'WHT',
  'Off-White': 'OFW',
  Grey: 'GRY',
  Blue: 'BLU',
  Navy: 'NVY',
  Red: 'RED',
  Green: 'GRN',
  Orange: 'ORG',
  Purple: 'PRP',
  Charcoal: 'CHR',
  Sand: 'SND',
  Khaki: 'KHK',
};

export const COLOR_HEX_MAP: Record<string, string> = {
  Brown: '#5c4033',
  Beige: '#f5f5dc',
  Black: '#000000',
  White: '#ffffff',
  'Off-White': '#faf9f6',
  Grey: '#808080',
  Blue: '#2563eb',
  Navy: '#1e3a8a',
  Red: '#dc2626',
  Green: '#16a34a',
  Orange: '#ea580c',
  Purple: '#9333ea',
  Charcoal: '#374151',
  Sand: '#d2b48c',
  Khaki: '#f0e68c',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildNormalizedCatalog() {
  const categoryMap = new Map<string, NormalizedCategory>();
  const collectionMap = new Map<string, NormalizedCollection>();
  const productsList: NormalizedProduct[] = [];

  for (const raw of rawProducts) {
    // 1. Process Category
    const catSlug = slugify(raw.category);
    if (!categoryMap.has(catSlug)) {
      categoryMap.set(catSlug, {
        id: `cat-${catSlug}`,
        name: raw.category,
        slug: catSlug,
        description: `Premium streetwear ${raw.category.toLowerCase()} crafted for luxury lifestyle.`,
      });
    }

    // 2. Process Collections
    for (const colSlug of raw.collections) {
      if (!collectionMap.has(colSlug)) {
        const colTitle = colSlug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        collectionMap.set(colSlug, {
          id: `col-${colSlug}`,
          name: colTitle,
          slug: colSlug,
          description: `Exclusive drop: ${colTitle}`,
          bannerUrl: raw.images[0] || '/images/hero-1.jpg',
        });
      }
    }

    // 3. Process Variants: Size × Color Permutation
    const variants: NormalizedVariant[] = [];
    // Calculate variant stock baseline (minimum 2 units per variant)
    const perVariantStock = Math.max(2, Math.ceil((raw.inventory || 10) / Math.max(1, raw.sizes.length)));

    for (const color of raw.colors) {
      const colorShort = COLOR_CODE_MAP[color] || color.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase();
      const colorHex = COLOR_HEX_MAP[color] || '#333333';

      for (const size of raw.sizes) {
        const sku = `YP-${raw.id.padStart(3, '0')}-${colorShort}-${size}`;
        const variantId = `var-${raw.id}-${colorShort.toLowerCase()}-${size.toLowerCase()}`;

        variants.push({
          id: variantId,
          productId: raw.id,
          sku,
          size,
          colorName: color,
          colorHex,
          price: inrToPaise(raw.price),
          compareAtPrice: raw.compare_at_price ? inrToPaise(raw.compare_at_price) : null,
          inventoryQuantity: perVariantStock,
          reservedQuantity: 0,
          weightGrams: raw.category === 'Jackets' ? 1200 : raw.category === 'Hoodies' ? 850 : 350,
          isActive: true,
        });
      }
    }

    // 4. Process Images
    const images: NormalizedImage[] = raw.images.map((url, idx) => ({
      id: `img-${raw.id}-${idx + 1}`,
      productId: raw.id,
      variantId: null,
      url,
      altText: `${raw.title} - View ${idx + 1}`,
      sortOrder: idx,
      isPrimary: idx === 0,
    }));

    productsList.push({
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      careInstructions: raw.care,
      categoryId: `cat-${catSlug}`,
      categoryName: raw.category,
      status: 'ACTIVE',
      brand: 'Yaperz',
      hsnCode: raw.category === 'Jackets' ? '6201' : raw.category === 'Hoodies' ? '6110' : '6109',
      taxRateBps: 1200, // 12% GST
      variants,
      images,
      collectionSlugs: raw.collections,
      tags: raw.tags,
    });
  }

  return {
    categories: Array.from(categoryMap.values()),
    collections: Array.from(collectionMap.values()),
    products: productsList,
  };
}

// Global cached instance of the normalized catalog
export const normalizedCatalog = buildNormalizedCatalog();

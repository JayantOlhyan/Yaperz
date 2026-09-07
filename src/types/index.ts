export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  collections: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  inventory: number;
  description: string;
  care: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface StoreInfo {
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapLink: string;
}

/**
 * Represents a product collection category key.
 */
export type ProductCategoryKey = 'streetwear' | 'oversized' | 'hoodies' | 'accessories' | 'all';

/**
 * Supported collection identifiers across the storefront.
 */
export type CollectionType = 'new-arrivals' | 'best-sellers' | 'trending' | 'sale';

/**
 * Represents an individual variant combination for inventory tracking.
 */
export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  inventory: number;
  inStock: boolean;
}

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

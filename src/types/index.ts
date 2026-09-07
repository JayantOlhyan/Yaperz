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

/**
 * Detailed cart line item with computed line pricing.
 */
export interface CartItemComputed extends CartItem {
  lineTotal: number;
  isAvailable: boolean;
}

/**
 * Customer review and rating structure for products.
 */
export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface RatingDistribution {
  averageRating: number;
  totalReviews: number;
  starCounts: Record<1 | 2 | 3 | 4 | 5, number>;
}

/**
 * Coupon or promotional discount code definition.
 */
export interface DiscountCode {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: string;
  isActive: boolean;
}

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

/**
 * Customer delivery destination address information.
 */
export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Available customer payment channels.
 */
export type PaymentMethodType = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'COD';

export type TransactionStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

/**
 * Order fulfillment progression states.
 */
export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderTrackingMilestone {
  status: OrderStatus;
  label: string;
  timestamp: string;
  location?: string;
  isCompleted: boolean;
}

/**
 * Full order summary for checkout and invoice generation.
 */
export interface OrderSummary {
  orderId: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethodType;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  createdAt: string;
}

/**
 * Customer account profile and notification preferences.
 */
export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  savedAddresses: ShippingAddress[];
  newsletterOptIn: boolean;
  orderHistoryIds: string[];
}

/**
 * Physical retail store location and contact details.
 */
export interface RetailLocation extends StoreInfo {
  id: string;
  latitude: number;
  longitude: number;
  isOpenToday: boolean;
}

/**
 * Day-by-day operating hours schedule for physical stores.
 */
export interface StoreHoursSchedule {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

/**
 * Breadcrumb navigation item for SEO and breadcrumb bars.
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

/**
 * Product catalog search and filtering options.
 */
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'discount';

export interface ProductFilterState {
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
  sortBy: SortOption;
}

/**
 * Generic paginated result wrapper for listing queries.
 */
export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * UI Toast notification message structure.
 */
export type AlertLevel = 'info' | 'success' | 'warning' | 'error';

export interface ToastNotification {
  id: string;
  message: string;
  type: AlertLevel;
  durationMs?: number;
}

/**
 * Common modal dialog and drawer component properties.
 */
export interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Storefront color theme and visual mode.
 */
export type ThemeMode = 'dark' | 'light' | 'system';

export interface DesignTokenPalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

/**
 * Telemetry and behavioral analytics event definition.
 */
export interface AnalyticsEvent {
  eventName: string;
  category: 'ecommerce' | 'engagement' | 'navigation' | 'search';
  properties?: Record<string, string | number | boolean | undefined>;
  timestamp: number;
}

/**
 * Standard API envelope pattern for endpoints.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Field-level form validation error mapping.
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Help center and Frequently Asked Questions items.
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'orders' | 'shipping' | 'returns' | 'sizing' | 'general';
}

/**
 * Legal terms and store policy sections.
 */
export interface PolicySection {
  id: string;
  heading: string;
  content: string;
}

/**
 * Social media and ephemeral brand story slide model.
 */
export interface StorySlide {
  id: string;
  title: string;
  thumbnail: string;
  mediaUrl: string;
  linkText?: string;
  linkHref?: string;
}

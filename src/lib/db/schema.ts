/**
 * @file schema.ts
 * @description Production PostgreSQL Relational Schema for Yaperz E-commerce Platform.
 * Built with Drizzle ORM. Enforces SKU-level variants, atomic inventory movements,
 * historical order snapshots, payment tracking, and integer minor units (paise) for currency.
 */

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const productStatusEnum = pgEnum('product_status', ['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', [
  'INITIAL_SEED',
  'ORDER_RESERVED',
  'ORDER_COMMITTED',
  'RESERVATION_RELEASED',
  'ORDER_CANCELLED',
  'RETURN_RESTOCKED',
  'DAMAGE_WRITEOFF',
  'MANUAL_ADJUSTMENT',
]);

export const customerAccountStatusEnum = pgEnum('customer_account_status', [
  'ACTIVE',
  'SUSPENDED',
  'GUEST',
]);

export const addressTypeEnum = pgEnum('address_type', ['HOME', 'WORK', 'OTHER']);

export const discountTypeEnum = pgEnum('discount_type', ['PERCENTAGE', 'FIXED']);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'PAYMENT_PENDING',
  'PAID',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUND_PENDING',
  'REFUNDED',
  'FAILED',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'REFUNDED',
]);

export const shipmentStatusEnum = pgEnum('shipment_status', [
  'MANIFESTED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RTO_INITIATED',
  'RTO_DELIVERED',
  'CANCELLED',
]);

export const returnStatusEnum = pgEnum('return_status', [
  'REQUESTED',
  'APPROVED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'INSPECTED',
  'REJECTED',
  'COMPLETED',
]);

export const refundStatusEnum = pgEnum('refund_status', ['PENDING', 'PROCESSED', 'FAILED']);

// ============================================================================
// CATALOG: CATEGORIES & COLLECTIONS
// ============================================================================

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const collections = pgTable('collections', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  bannerUrl: text('banner_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// CATALOG: PRODUCTS & VARIANTS
// ============================================================================

export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description').notNull(),
    careInstructions: text('care_instructions').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    status: productStatusEnum('status').notNull().default('ACTIVE'),
    brand: text('brand').notNull().default('Yaperz'),
    hsnCode: text('hsn_code').default('6109'), // Indian GST HSN code
    taxRateBps: integer('tax_rate_bps').notNull().default(1200), // 12.00% GST in basis points
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_products_slug').on(table.slug),
    index('idx_products_category').on(table.categoryId),
    index('idx_products_status').on(table.status),
  ]
);

export const productVariants = pgTable(
  'product_variants',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull().unique(),
    size: text('size').notNull(),
    colorName: text('color_name').notNull(),
    colorHex: text('color_hex'),
    price: integer('price').notNull(), // in paise (e.g. 1850000 = ₹18,500)
    compareAtPrice: integer('compare_at_price'), // in paise
    inventoryQuantity: integer('inventory_quantity').notNull().default(0),
    reservedQuantity: integer('reserved_quantity').notNull().default(0),
    weightGrams: integer('weight_grams').notNull().default(500),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_variants_sku').on(table.sku),
    index('idx_variants_product').on(table.productId),
    index('idx_variants_size_color').on(table.size, table.colorName),
  ]
);

export const productImages = pgTable(
  'product_images',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    url: text('url').notNull(),
    altText: text('alt_text').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isPrimary: boolean('is_primary').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_images_product').on(table.productId),
    index('idx_images_variant').on(table.variantId),
  ]
);

export const productCollections = pgTable(
  'product_collections',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.collectionId] }),
    index('idx_prod_col_product').on(table.productId),
    index('idx_prod_col_collection').on(table.collectionId),
  ]
);

export const productTags = pgTable(
  'product_tags',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
  },
  (table) => [
    index('idx_product_tags_tag').on(table.tag),
    index('idx_product_tags_prod').on(table.productId),
  ]
);

// ============================================================================
// INVENTORY MOVEMENTS
// ============================================================================

export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: text('id').primaryKey(),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    movementType: inventoryMovementTypeEnum('movement_type').notNull(),
    quantity: integer('quantity').notNull(), // signed delta (e.g. +10, -1)
    referenceId: text('reference_id'), // e.g. orderId or shipmentId
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_inv_movements_variant').on(table.variantId),
    index('idx_inv_movements_ref').on(table.referenceId),
  ]
);

// ============================================================================
// CUSTOMERS & ADDRESSES
// ============================================================================

export const customers = pgTable(
  'customers',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    phone: text('phone'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    marketingConsent: boolean('marketing_consent').notNull().default(false),
    accountStatus: customerAccountStatusEnum('account_status').notNull().default('ACTIVE'),
    externalAuthId: text('external_auth_id').unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_customers_email').on(table.email),
    uniqueIndex('idx_customers_external_auth').on(table.externalAuthId),
  ]
);

export const customerAddresses = pgTable(
  'customer_addresses',
  {
    id: text('id').primaryKey(),
    customerId: text('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone').notNull(),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    city: text('city').notNull(),
    state: text('state').notNull(),
    postalCode: text('postal_code').notNull(),
    country: text('country').notNull().default('IN'),
    landmark: text('landmark'),
    addressType: addressTypeEnum('address_type').notNull().default('HOME'),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_cust_addr_customer').on(table.customerId),
    index('idx_cust_addr_pincode').on(table.postalCode),
  ]
);

// ============================================================================
// CARTS (SERVER-SIDE)
// ============================================================================

export const carts = pgTable(
  'carts',
  {
    id: text('id').primaryKey(),
    sessionToken: text('session_token').notNull().unique(),
    customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('idx_carts_session').on(table.sessionToken)]
);

export const cartItems = pgTable(
  'cart_items',
  {
    id: text('id').primaryKey(),
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_cart_items_cart').on(table.cartId),
    index('idx_cart_items_variant').on(table.variantId),
  ]
);

// ============================================================================
// DISCOUNTS & COUPONS
// ============================================================================

export const discounts = pgTable(
  'discounts',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    discountType: discountTypeEnum('discount_type').notNull(),
    value: integer('value').notNull(), // percentage (e.g. 10 for 10%) or paise
    minSubtotal: integer('min_subtotal').default(0), // in paise
    maxDiscount: integer('max_discount'), // in paise
    usageLimit: integer('usage_limit'),
    usedCount: integer('used_count').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('idx_discounts_code').on(table.code)]
);

// ============================================================================
// ORDERS & HISTORICAL SNAPSHOTS
// ============================================================================

export const orderAddresses = pgTable('order_addresses', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull().default('IN'),
  landmark: text('landmark'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').notNull().unique(),
    customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
    guestEmail: text('guest_email').notNull(),
    guestPhone: text('guest_phone').notNull(),
    status: orderStatusEnum('status').notNull().default('PENDING'),
    subtotal: integer('subtotal').notNull(), // in paise
    discountTotal: integer('discount_total').notNull().default(0), // in paise
    discountId: text('discount_id').references(() => discounts.id, { onDelete: 'set null' }),
    shippingFee: integer('shipping_fee').notNull().default(0), // in paise
    shippingMethod: text('shipping_method').notNull().default('standard'),
    taxTotal: integer('tax_total').notNull().default(0), // in paise
    grandTotal: integer('grand_total').notNull(), // in paise
    currency: text('currency').notNull().default('INR'),
    shippingAddressId: text('shipping_address_id')
      .notNull()
      .references(() => orderAddresses.id, { onDelete: 'restrict' }),
    billingAddressId: text('billing_address_id')
      .notNull()
      .references(() => orderAddresses.id, { onDelete: 'restrict' }),
    idempotencyKey: text('idempotency_key').unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_orders_number').on(table.orderNumber),
    uniqueIndex('idx_orders_idempotency').on(table.idempotencyKey),
    index('idx_orders_customer').on(table.customerId),
    index('idx_orders_email').on(table.guestEmail),
    index('idx_orders_status').on(table.status),
  ]
);

export const orderItems = pgTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id').notNull(),
    variantId: text('variant_id').notNull(),
    productTitle: text('product_title').notNull(), // historical snapshot
    variantSku: text('variant_sku').notNull(), // historical snapshot
    size: text('size').notNull(),
    color: text('color').notNull(),
    unitPrice: integer('unit_price').notNull(), // in paise
    quantity: integer('quantity').notNull(),
    discountAmount: integer('discount_amount').notNull().default(0), // in paise
    taxAmount: integer('tax_amount').notNull().default(0), // in paise
    lineTotal: integer('line_total').notNull(), // in paise
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_order_items_order').on(table.orderId)]
);

// ============================================================================
// PAYMENTS
// ============================================================================

export const payments = pgTable(
  'payments',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull().default('MOCK'), // 'RAZORPAY' | 'MOCK' | 'COD'
    providerOrderId: text('provider_order_id'),
    providerPaymentId: text('provider_payment_id'),
    amount: integer('amount').notNull(), // in paise
    currency: text('currency').notNull().default('INR'),
    status: paymentStatusEnum('status').notNull().default('PENDING'),
    method: text('method').notNull().default('UPI'),
    capturedAt: timestamp('captured_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_payments_order').on(table.orderId),
    index('idx_payments_provider_order').on(table.providerOrderId),
  ]
);

export const paymentEvents = pgTable(
  'payment_events',
  {
    id: text('id').primaryKey(),
    paymentId: text('payment_id')
      .notNull()
      .references(() => payments.id, { onDelete: 'cascade' }),
    eventName: text('event_name').notNull(),
    eventPayload: jsonb('event_payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_pay_events_payment').on(table.paymentId)]
);

// ============================================================================
// SHIPMENTS & LOGISTICS
// ============================================================================

export const shipments = pgTable(
  'shipments',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    carrier: text('carrier').notNull().default('SHIPROCKET'),
    trackingNumber: text('tracking_number'),
    awbCode: text('awb_code'),
    shippingLabelUrl: text('shipping_label_url'),
    status: shipmentStatusEnum('status').notNull().default('MANIFESTED'),
    estimatedDeliveryDate: timestamp('estimated_delivery_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_shipments_order').on(table.orderId),
    index('idx_shipments_awb').on(table.awbCode),
  ]
);

export const shipmentEvents = pgTable(
  'shipment_events',
  {
    id: text('id').primaryKey(),
    shipmentId: text('shipment_id')
      .notNull()
      .references(() => shipments.id, { onDelete: 'cascade' }),
    status: shipmentStatusEnum('status').notNull(),
    location: text('location'),
    message: text('message'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_ship_events_shipment').on(table.shipmentId)]
);

// ============================================================================
// RETURNS & REFUNDS
// ============================================================================

export const returns = pgTable(
  'returns',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: returnStatusEnum('status').notNull().default('REQUESTED'),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_returns_order').on(table.orderId)]
);

export const returnItems = pgTable(
  'return_items',
  {
    id: text('id').primaryKey(),
    returnId: text('return_id')
      .notNull()
      .references(() => returns.id, { onDelete: 'cascade' }),
    orderItemId: text('order_item_id')
      .notNull()
      .references(() => orderItems.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull().default(1),
    conditionNotes: text('condition_notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_ret_items_return').on(table.returnId)]
);

export const refunds = pgTable(
  'refunds',
  {
    id: text('id').primaryKey(),
    returnId: text('return_id').references(() => returns.id, { onDelete: 'set null' }),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    paymentId: text('payment_id')
      .notNull()
      .references(() => payments.id, { onDelete: 'restrict' }),
    amount: integer('amount').notNull(), // in paise
    status: refundStatusEnum('status').notNull().default('PENDING'),
    providerRefundId: text('provider_refund_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_refunds_order').on(table.orderId)]
);

// ============================================================================
// IDEMPOTENCY & AUDIT LOGS
// ============================================================================

export const idempotencyKeys = pgTable('idempotency_keys', {
  key: text('key').primaryKey(),
  scope: text('scope').notNull(),
  responseBody: text('response_body').notNull(),
  statusCode: integer('status_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    actor: text('actor').notNull().default('SYSTEM'),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id').notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_logs_entity').on(table.entity, table.entityId),
    index('idx_audit_logs_created').on(table.createdAt),
  ]
);

// ============================================================================
// RELATIONS
// ============================================================================

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  collections: many(productCollections),
  tags: many(productTags),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  images: many(productImages),
  movements: many(inventoryMovements),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(productCollections),
}));

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, {
    fields: [productCollections.productId],
    references: [products.id],
  }),
  collection: one(collections, {
    fields: [productCollections.collectionId],
    references: [collections.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  shippingAddress: one(orderAddresses, {
    fields: [orders.shippingAddressId],
    references: [orderAddresses.id],
  }),
  billingAddress: one(orderAddresses, {
    fields: [orders.billingAddressId],
    references: [orderAddresses.id],
  }),
  items: many(orderItems),
  payments: many(payments),
  shipments: many(shipments),
  returns: many(returns),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

/**
 * @file order.repository.ts
 * @description Order Repository managing transactional order persistence, historical item snapshots,
 * delivery address records, customer order history lookups, and idempotency guarantees.
 */

import { NotFoundError } from '../../errors';

export interface PersistedOrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productTitle: string;
  variantSku: string;
  size: string;
  color: string;
  unitPrice: number; // in paise
  quantity: number;
  discountAmount: number; // in paise
  taxAmount: number; // in paise
  lineTotal: number; // in paise
  createdAt: Date;
}

export interface PersistedOrderAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
}

export interface PersistedOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  guestEmail: string;
  guestPhone: string;
  status:
    | 'PENDING'
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURN_REQUESTED'
    | 'RETURNED'
    | 'REFUND_PENDING'
    | 'REFUNDED'
    | 'FAILED';
  subtotal: number; // in paise
  discountTotal: number; // in paise
  shippingFee: number; // in paise
  shippingMethod: string;
  taxTotal: number; // in paise
  grandTotal: number; // in paise
  currency: string;
  shippingAddress: PersistedOrderAddress;
  items: PersistedOrderItem[];
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory order persistence store
const ordersStore = new Map<string, PersistedOrder>();
const idempotencyStore = new Map<string, string>(); // idempotencyKey -> orderId

export class OrderRepository {
  /**
   * Generates a human-readable order number (e.g. YP-2026-849201).
   */
  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `YP-${year}-${randomSuffix}`;
  }

  /**
   * Persists a new order with atomic item and address snapshots.
   */
  async create(data: {
    customerId?: string;
    guestEmail: string;
    guestPhone: string;
    status?: PersistedOrder['status'];
    subtotal: number;
    discountTotal: number;
    shippingFee: number;
    shippingMethod: string;
    taxTotal: number;
    grandTotal: number;
    shippingAddress: Omit<PersistedOrderAddress, 'id'>;
    items: Array<{
      productId: string;
      variantId: string;
      productTitle: string;
      variantSku: string;
      size: string;
      color: string;
      unitPrice: number;
      quantity: number;
      discountAmount: number;
      taxAmount: number;
      lineTotal: number;
    }>;
    idempotencyKey?: string;
  }): Promise<PersistedOrder> {
    // Idempotency check: prevent duplicate orders on network retries
    if (data.idempotencyKey && idempotencyStore.has(data.idempotencyKey)) {
      const existingOrderId = idempotencyStore.get(data.idempotencyKey)!;
      const existingOrder = ordersStore.get(existingOrderId);
      if (existingOrder) {
        return existingOrder;
      }
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const orderNumber = this.generateOrderNumber();
    const now = new Date();

    const addressRecord: PersistedOrderAddress = {
      id: `addr-${Date.now()}`,
      ...data.shippingAddress,
    };

    const itemRecords: PersistedOrderItem[] = data.items.map((item, idx) => ({
      id: `item-${orderId}-${idx + 1}`,
      orderId,
      productId: item.productId,
      variantId: item.variantId,
      productTitle: item.productTitle,
      variantSku: item.variantSku,
      size: item.size,
      color: item.color,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discountAmount: item.discountAmount,
      taxAmount: item.taxAmount,
      lineTotal: item.lineTotal,
      createdAt: now,
    }));

    const newOrder: PersistedOrder = {
      id: orderId,
      orderNumber,
      customerId: data.customerId,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      status: data.status || 'CONFIRMED',
      subtotal: data.subtotal,
      discountTotal: data.discountTotal,
      shippingFee: data.shippingFee,
      shippingMethod: data.shippingMethod,
      taxTotal: data.taxTotal,
      grandTotal: data.grandTotal,
      currency: 'INR',
      shippingAddress: addressRecord,
      items: itemRecords,
      idempotencyKey: data.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    };

    ordersStore.set(orderId, newOrder);

    if (data.idempotencyKey) {
      idempotencyStore.set(data.idempotencyKey, orderId);
    }

    return newOrder;
  }

  /**
   * Finds order by unique order ID or human-readable order number.
   */
  async findByIdOrNumber(identifier: string): Promise<PersistedOrder | null> {
    if (ordersStore.has(identifier)) {
      return ordersStore.get(identifier)!;
    }

    for (const order of ordersStore.values()) {
      if (order.orderNumber.toUpperCase() === identifier.toUpperCase()) {
        return order;
      }
    }

    return null;
  }

  /**
   * Looks up an existing order by its unique idempotency key.
   */
  async findByIdempotencyKey(key: string): Promise<PersistedOrder | null> {
    const orderId = idempotencyStore.get(key);
    if (!orderId) return null;
    return ordersStore.get(orderId) || null;
  }

  /**
   * Finds all orders placed by a customer ID or associated email.
   */
  async findByCustomerId(customerId: string, email?: string): Promise<PersistedOrder[]> {
    const targetEmail = email ? email.toLowerCase().trim() : null;
    const matching: PersistedOrder[] = [];
    for (const order of ordersStore.values()) {
      if (
        order.customerId === customerId ||
        (targetEmail && order.guestEmail.toLowerCase() === targetEmail)
      ) {
        matching.push(order);
      }
    }
    return matching.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Finds all orders placed by an email address.
   */
  async findByEmail(email: string): Promise<PersistedOrder[]> {
    const target = email.toLowerCase().trim();
    const matching: PersistedOrder[] = [];
    for (const order of ordersStore.values()) {
      if (order.guestEmail.toLowerCase() === target) {
        matching.push(order);
      }
    }
    return matching.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Updates an order's status.
   */
  async updateStatus(
    orderId: string,
    status: PersistedOrder['status']
  ): Promise<PersistedOrder> {
    const order = ordersStore.get(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`, 'ORDER_NOT_FOUND');
    }

    order.status = status;
    order.updatedAt = new Date();
    ordersStore.set(orderId, order);
    return order;
  }

  /**
   * Resets orders store for testing.
   */
  public resetForTesting() {
    ordersStore.clear();
    idempotencyStore.clear();
  }
}

export const orderRepository = new OrderRepository();

/**
 * @file order.service.ts
 * @description Central Order Management and Transaction Orchestration Service.
 * Coordinates Zod validation, authoritative server-side pricing recalculation,
 * atomic inventory reservation, payment provider initiation, and order persistence.
 */

import { orderRepository, PersistedOrder } from '../../db/repositories/order.repository';
import { pricingService } from '../pricing/pricing.service';
import { inventoryService } from '../inventory/inventory.service';
import { paymentProvider } from '../payments/payment.provider';
import { customerRepository } from '../../db/repositories/customer.repository';
import { CreateOrderInput } from '../../validation/order.schema';

export interface OrderCreationResult {
  order: PersistedOrder;
  paymentOrder: {
    provider: string;
    providerOrderId: string;
    amountPaise: number;
    currency: string;
  };
}

export class OrderService {
  /**
   * Transactionally creates a new customer order with server-calculated totals
   * and atomic inventory reservations.
   */
  async createOrder(input: CreateOrderInput): Promise<OrderCreationResult> {
    // 0. Idempotency Check: Return existing order if key was already submitted
    if (input.idempotencyKey) {
      const existing = await orderRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existing) {
        return {
          order: existing,
          paymentOrder: {
            provider: 'MOCK',
            providerOrderId: `mock_order_${existing.id}`,
            amountPaise: existing.grandTotal,
            currency: existing.currency,
          },
        };
      }
    }

    // 1. Authoritatively recalculate order totals on the server (Zero Client Trust)
    const quote = await pricingService.calculateQuote({
      items: input.items,
      shippingMethod: input.shippingMethod,
      couponCode: input.couponCode,
      postalCode: input.shippingAddress.postalCode,
    });

    // 2. Atomically reserve inventory for all items
    await inventoryService.reserveItems(input.items);

    try {
      // 3. Persist order and capture historical product snapshots
      const order = await orderRepository.create({
        guestEmail: input.customerEmail,
        guestPhone: input.customerPhone,
        status: input.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        subtotal: quote.subtotalPaise,
        discountTotal: quote.discountPaise,
        shippingFee: quote.shippingFeePaise,
        shippingMethod: input.shippingMethod,
        taxTotal: quote.taxPaise,
        grandTotal: quote.grandTotalPaise,
        shippingAddress: input.shippingAddress,
        items: quote.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productTitle: item.title,
          variantSku: item.sku,
          size: item.size,
          color: item.color,
          unitPrice: item.unitPricePaise,
          quantity: item.quantity,
          discountAmount: 0,
          taxAmount: Math.round((item.lineTotalPaise * 12) / 112),
          lineTotal: item.lineTotalPaise,
        })),
        idempotencyKey: input.idempotencyKey,
      });

      // 4. Upsert customer profile and address record for future reference
      await customerRepository.upsertFromCheckout({
        email: input.customerEmail,
        phone: input.customerPhone,
        firstName: input.shippingAddress.firstName,
        lastName: input.shippingAddress.lastName,
        address: input.shippingAddress,
      });

      // 5. Initiate Payment Intent via payment provider
      const paymentOrder = await paymentProvider.createPaymentOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amountPaise: order.grandTotal,
        currency: order.currency,
        customerEmail: order.guestEmail,
        customerPhone: order.guestPhone,
      });

      return {
        order,
        paymentOrder: {
          provider: paymentOrder.provider,
          providerOrderId: paymentOrder.providerOrderId,
          amountPaise: paymentOrder.amountPaise,
          currency: paymentOrder.currency,
        },
      };
    } catch (error) {
      // In case of database error after reservation, release reserved inventory
      await inventoryService.releaseItems(input.items);
      throw error;
    }
  }

  /**
   * Retrieves an order by ID or order number.
   */
  async getOrder(identifier: string): Promise<PersistedOrder | null> {
    return orderRepository.findByIdOrNumber(identifier);
  }
}

export const orderService = new OrderService();

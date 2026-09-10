# Yaperz — Order Architecture & Lifecycle State Machine

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Order States**: 15 Strict Postgres Enums  
> **Idempotency Standard**: Unique idempotency keys on checkout submissions  

---

## 1. The 15-State Order Lifecycle

To eliminate ad-hoc string comparisons scattered throughout the codebase, order progression is governed by strict, centralized state enums:

```
                  [Customer Submits Checkout]
                               │
                               ▼
                           PENDING
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
          PAYMENT_PENDING                 FAILED
                  │                         ▲
                  ▼                         │
                 PAID ──────────────────────┘
                  │
                  ▼
              CONFIRMED
                  │
                  ▼
              PROCESSING
                  │
                  ▼
                PACKED
                  │
                  ▼
               SHIPPED
                  │
                  ▼
          OUT_FOR_DELIVERY
                  │
                  ▼
              DELIVERED
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    COMPLETED       RETURN_REQUESTED
                            │
                            ▼
                         RETURNED
                            │
                            ▼
                     REFUND_PENDING
                            │
                            ▼
                         REFUNDED
```

---

## 2. Historical Snapshot Preservation

Orders must never depend on current product catalog records:
1. If a product title is renamed from `"Brown Wildloom Heavyweight Hoodie"` to `"Wildloom Loopback Hoodie"`, past orders must retain the exact title displayed when the customer purchased it.
2. If a product's price increases from ₹18,500 to ₹22,000, historical orders must preserve the ₹18,500 unit price.
3. If a customer moves houses, previous orders must preserve the delivery address entered for that specific parcel.

### Snapshot Implementation
In `order_items` and `order_addresses`:
- `order_items.product_title`: Copy of product title at purchase.
- `order_items.variant_sku`: Copy of variant SKU.
- `order_items.unit_price`: Exact unit price in paise charged.
- `order_addresses`: Dedicated immutable row per order, decoupled from customer profile changes.

---

## 3. Idempotency & Double-Click Protection

### The Double-Submission Problem
In e-commerce checkouts, customers frequently double-click the "Place Order" button, or mobile networks drop and retry HTTP requests. Without idempotency protection, two distinct orders are created, stock is decremented twice, and the customer is charged twice.

### The Yaperz Solution
1. The checkout client generates an `idempotencyKey` (UUIDv4).
2. Before beginning order creation or inventory reservation, `OrderService.createOrder()` checks `orderRepository.findByIdempotencyKey(key)`.
3. If a matching order exists:
   - The existing order record is returned immediately with HTTP 200/201.
   - Zero stock is re-reserved.
   - Zero duplicate payment intents are created.

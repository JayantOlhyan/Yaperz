# Yaperz — Inventory Architecture & Concurrency Specification

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Granularity**: SKU-Level (Product × Color × Size)  
> **Concurrency Model**: Atomic Row-Level Reservation with Rollback Protection  

---

## 1. The Multi-Variant Inventory Challenge

In Phase 1, the product catalog stored a single scalar integer:
```json
{
  "title": "Brown Wildloom Heavyweight Hoodie",
  "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
  "colors": ["Brown", "Beige"],
  "inventory": 8
}
```
**Fatal Flaw**: If a customer purchased size "M" in Brown, the entire product inventory decremented to 7. Sizes "XS" and "XXL" also lost inventory, and out-of-stock sizes could not be disabled independently.

### Phase 2 Architecture: Dedicated Variant SKUs
Each combination of size and colorway is an independent row in `product_variants`:
- `YP-001-BRN-XS` (Brown / XS)
- `YP-001-BRN-S` (Brown / S)
- `YP-001-BRN-M` (Brown / M)
- `YP-001-BGE-M` (Beige / M)

Each row maintains:
- `inventory_quantity`: Physical units located in warehouse.
- `reserved_quantity`: Units allocated to active checkout sessions.
- **Available Stock Formula**:
  $$\text{Available} = \max(0, \text{inventory\_quantity} - \text{reserved\_quantity})$$

---

## 2. The Inventory Lifecycle State Machine

```
               [Customer Enters Checkout]
                           │
                           ▼
               ┌───────────────────────┐
               │    ORDER_RESERVED     │
               │  reserved_quantity += Q│
               └───────────┬───────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [Payment Confirmed]          [Payment Fails / Timeout]
             │                           │
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     ORDER_COMMITTED     │ │  RESERVATION_RELEASED   │
│  reserved_quantity -= Q │ │  reserved_quantity -= Q │
│  inventory_quantity -= Q│ └─────────────────────────┘
└────────────┬────────────┘
             │
      [Order Cancelled]
             │
             ▼
┌─────────────────────────┐
│     ORDER_CANCELLED     │
│  inventory_quantity += Q│
└─────────────────────────┘
```

---

## 3. Race Condition & Overselling Mitigation

In high-heat streetwear drops (e.g. 500 customers competing for 10 bomber jackets), standard read-modify-write patterns (`const stock = getStock(); updateStock(stock - 1)`) result in severe overselling.

### 3.1 The Atomic SQL Reservation Query
Yaperz executes reservations atomically at the PostgreSQL level:
```sql
UPDATE product_variants
SET 
    reserved_quantity = reserved_quantity + :qty,
    updated_at = NOW()
WHERE 
    id = :variantId 
    AND (inventory_quantity - reserved_quantity) >= :qty
RETURNING *;
```
- **If units are available**: The row is updated and returned in a single atomic cycle.
- **If units are insufficient**: The query returns 0 rows, immediately triggering `InsufficientStockError` without altering stock.

### 3.2 Rollback Protection for Multi-Item Carts
If a cart contains Item A (2 units) and Item B (1 unit), and Item B fails the reservation check, all reservations already made for Item A are atomically released via `inventoryService.releaseItems()`.

---

## 4. Immutable Inventory Movements Ledger (`inventory_movements`)

Every single change to inventory is audited in the `inventory_movements` table:
- `movement_type`:
  - `INITIAL_SEED`: Initial catalog import.
  - `ORDER_RESERVED`: Temporary allocation during checkout.
  - `ORDER_COMMITTED`: Permanent deduction upon payment capture.
  - `RESERVATION_RELEASED`: Returned to pool on payment abort.
  - `ORDER_CANCELLED`: Restocked upon order cancellation.
  - `RETURN_RESTOCKED`: Restocked after physical warehouse return inspection.
  - `DAMAGE_WRITEOFF`: Damaged garment removed from stock.
  - `MANUAL_ADJUSTMENT`: Warehouse manager stock audit.
- `quantity`: Signed integer delta (+10, -1).
- `reference_id`: Associated `order_id` or `shipment_id`.

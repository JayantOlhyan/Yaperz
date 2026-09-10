# Yaperz — Guest to Customer Cart Merge Architecture

## Overview
When an anonymous guest customer authenticates (via login or registration), any active guest shopping cart associated with their guest session cookie (`yaperz_session`) is automatically merged into their server-authoritative customer cart.

## Merge Algorithm & Inventory Rules

```text
[Guest Session Cookie] ──> Read Guest Cart
                               │
                               ▼
                   [Loop Over Guest Line Items]
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[Check Variant Active & Stock]           [Look Up SKU in Customer Cart]
       │                                               │
       ▼                                               ▼
[stock.available > 0?]                  [Combine Quantities: Qty_guest + Qty_cust]
       │                                               │
       ▼                                               ▼
[Calculate Bound Qty = min(Requested, stock.available, 10)]
       │
       ▼
[Upsert into Customer Cart] ──> [Delete Guest Cart] ──> [Recalculate Prices]
```

## Invariants
1. **Quantity Combination**: Items with matching variant SKUs have their quantities added together (`guestQty + customerQty`).
2. **Stock Limit Bounding**: The combined quantity can never exceed available variant stock (`inventoryQuantity - reservedQuantity`).
3. **Max Cap per SKU**: Quantities are capped at the maximum allowance of 10 items per SKU.
4. **Zero-Trust Pricing**: Prices are recalculated from the database catalog; guest-submitted prices are completely ignored.
5. **Guest Cart Deletion**: Once merged, the guest cart is permanently cleared to prevent duplicate item merging.

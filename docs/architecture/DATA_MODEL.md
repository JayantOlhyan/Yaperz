# Yaperz — Data Model & Schema Specification

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Currency Representation**: Integer Minor Units (INR Paise: 1 INR = 100 paise)  
> **Timestamp Representation**: UTC (ISO-8601) internally, IST (+05:30) customer-facing  

---

## 1. Relational Entity Specifications

### 1.1 Products (`products`)
Represents the parent merchandising entity for an apparel item.
- `id`: Unique identifier (text/UUID).
- `title`: Merchandised title (e.g., `"Brown Wildloom Heavyweight Hoodie"`).
- `slug`: Human-readable unique URL slug (`"brown-wildloom-heavyweight-hoodie"`).
- `description`: Editorial copywriting detailing fabric GSM, silhouette, and design accents.
- `care_instructions`: Washing, bleaching, and ironing guidelines.
- `category_id`: Foreign key referencing `categories.id`.
- `status`: Lifecycle enum (`'DRAFT'` | `'ACTIVE'` | `'ARCHIVED'`).
- `brand`: Brand identifier (default `'Yaperz'`).
- `hsn_code`: Indian GST Harmonized System of Nomenclature code (`'6109'` for tees, `'6110'` for hoodies, `'6201'` for jackets).
- `tax_rate_bps`: GST rate in basis points (`1200` = 12.00%).

### 1.2 Product Variants (`product_variants`)
**Critical Production Resolution**: Solves the Phase 1 limitation where inventory was scalar at the parent product level. Every sellable combination of (Size × Color) is an independent variant.
- `id`: Unique identifier (e.g., `"var-1-brn-m"`).
- `product_id`: Foreign key to `products.id`.
- `sku`: Global unique Stock Keeping Unit (e.g., `"YP-001-BRN-M"`).
- `size`: Standard apparel size (`'XS'`, `'S'`, `'M'`, `'L'`, `'XL'`, `'XXL'`).
- `color_name`: Commercial colorway name (e.g., `"Brown"`, `"Beige"`).
- `color_hex`: Hexadecimal preview code (e.g., `"#5c4033"`).
- `price`: Authoritative unit selling price stored in **integer paise** (`1850000` = ₹18,500).
- `compare_at_price`: Original MSRP before markdown in **integer paise** (`2200000` = ₹22,000).
- `inventory_quantity`: Total physical stock units held in warehouse.
- `reserved_quantity`: Active checkout session reservations awaiting payment.
- `weight_grams`: Garment physical weight for logistics calculation (e.g., `850` grams).
- `is_active`: Boolean flag to pause individual variant sales.

### 1.3 Product Images (`product_images`)
- `id`: Image record identifier.
- `product_id`: Foreign key to parent `products.id`.
- `variant_id`: Optional foreign key to `product_variants.id` (enables gallery switching on color selection).
- `url`: CDN asset URL or static path (`/images/products/...`).
- `alt_text`: Descriptive accessibility and SEO alt string.
- `sort_order`: Zero-indexed display position.
- `is_primary`: Flag denoting primary thumbnail.

---

## 2. Monetary Representation: Integer Minor Units (Paise)

### Why Float Values (`number`) Are Prohibited
In standard JavaScript and floating-point arithmetic (IEEE-754), fractional arithmetic produces catastrophic rounding errors:
```javascript
// Floating point flaw:
0.1 + 0.2 === 0.30000000000000004
18500 * 0.12 === 2220.0000000000005
```

### The Yaperz Integer Minor Unit Standard
All financial amounts (subtotals, discounts, taxes, shipping fees, and grand totals) are strictly stored and computed as **integer paise**:
- ₹18,500 is stored as `1850000` paise.
- ₹150 shipping is stored as `15000` paise.
- ₹2,220 GST is stored as `222000` paise.

Conversion utilities (`src/lib/currency.ts`):
```typescript
export function paiseToInr(paise: number): number {
  return Math.round(paise) / 100;
}

export function inrToPaise(inr: number): number {
  return Math.round(inr * 100);
}

export function formatPaise(paise: number): string {
  return formatINR(paiseToInr(paise));
}
```

---

## 3. Historical Order Snapshots

An order must remain completely immutable once created. If an admin edits a product's price from ₹18,500 to ₹24,000 in 2027, an order placed in 2026 must continue displaying ₹18,500.

`order_items` snapshots:
- `product_title`: Title at purchase time.
- `variant_sku`: SKU code at purchase time.
- `size` & `color`: Variant attributes at purchase time.
- `unit_price`: Authoritative price in paise charged at purchase time.
- `tax_amount` & `line_total`: Computed line pricing in paise.

`order_addresses` snapshots:
- Full recipient name, phone, street lines, city, state, postal code, and country at the instant of order placement.

# Yaperz — Data Model & Product Schema Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Source Files Audited**: `src/data/products.json` & `src/types/index.ts`  
> **Catalog Scope**: 17 products across 8 categories  

---

## 1. Existing Product Entity Architecture

In the current codebase, product information is loaded synchronously from a local static file ([src/data/products.json](src/data/products.json)) and typed via the `Product` interface in [src/types/index.ts](src/types/index.ts):

```typescript
export interface Product {
  id: string;                      // e.g. "1"
  title: string;                   // e.g. "Brown Wildloom Heavyweight Hoodie"
  slug: string;                    // e.g. "brown-wildloom-heavyweight-hoodie"
  price: number;                   // e.g. 18500
  compare_at_price: number | null; // e.g. 22000 or null
  category: string;                // e.g. "Hoodies"
  collections: string[];           // e.g. ["new-in", "winter-collection"]
  tags: string[];                  // e.g. ["brown", "winter", "heavyweight"]
  sizes: string[];                 // e.g. ["XS", "S", "M", "L", "XL", "XXL"]
  colors: string[];                // e.g. ["Brown", "Beige"]
  images: string[];                // e.g. ["/images/products/hoodie-brown-1.jpg"]
  inventory: number;               // e.g. 8 (scalar product-level inventory)
  description: string;             // Editorial copy
  care: string;                    // Washing instructions
}
```

---

## 2. Field-by-Field Production Safety Audit

| Field | Current Type & Sample Value | Production Safety Status | Critical Limitations & Deficiencies |
| :--- | :--- | :--- | :--- |
| **`id`** | `string` (`"1"` to `"17"`) | **UNSAFE FOR PROD** | Sequential numeric strings. In production, this causes enumerable URL attacks and collisions across environments. Must use UUIDv4 (`cuid2` or Postgres UUID). |
| **`slug`** | `string` (`"brown-wildloom-..."`) | **ACCEPTABLE** | Clean, human-readable, and URL-friendly. However, there is no database unique constraint to prevent duplicate slugs during product creation. |
| **`price`** | `number` (`18500`) | **UNSAFE FOR PROD** | Stored as raw integer in INR. No currency attribute attached to the record, no tax inclusion/exclusion flag, and no support for fractional currencies (e.g. cents/pence) if multi-currency is enabled. |
| **`compare_at_price`** | `number \| null` (`22000`) | **ACCEPTABLE** | Correctly nullable. Enables automated discount % calculation via `calculateDiscountPercentage()`. |
| **`category`** | `string` (`"Hoodies"`) | **PARTIALLY SAFE** | Freeform string rather than foreign key or strict enum. Prone to case-sensitivity typos (e.g. `"T-shirts"` vs `"t-shirts"`). |
| **`collections`** | `string[]` | **PARTIALLY SAFE** | Denormalized array of strings. Contains references to external brand names (`"bluorng-racing-club"`, `"bluorng-iconics"`). Should be a many-to-many relational join table in SQL. |
| **`tags`** | `string[]` | **ACCEPTABLE** | Useful for client-side search filtering. In production, needs a dedicated indexed search tag table. |
| **`sizes`** | `string[]` (`["XS", "S", "M"...]`) | **UNSAFE FOR PROD** | Simple string array. Does NOT link to stock levels or variant SKUs. If size "S" sells out, the entire product still lists "S" as selectable. |
| **`colors`** | `string[]` (`["Brown", "Beige"]`) | **UNSAFE FOR PROD** | List of color names without hex codes or color-specific image mappings. Customer selecting "Beige" does not see the image gallery switch to the beige garment. |
| **`images`** | `string[]` | **PARTIALLY SAFE** | Local static asset paths (`/images/products/...`). In production, must be CDN-hosted URLs (Cloudflare R2 / AWS S3) with width/height dimensions and blur hash placeholders. |
| **`inventory`** | `number` (`8`) | **CRITICAL DEFECT** | Scalar count at the parent product level. It cannot track which size or color has stock. Sells out all variants simultaneously. |
| **`description`** | `string` | **ACCEPTABLE** | High-quality editorial product copy. Ready for production. |
| **`care`** | `string` | **ACCEPTABLE** | Specific washing and garment maintenance advice. Ready for production. |

---

## 3. Capabilities Current Model CANNOT Represent

The current mock schema in `products.json` cannot support essential production e-commerce operations:

1. **SKU-Level Inventory**: Cannot track stock per individual SKU (e.g. `YP-HOOD-BRN-M` vs `YP-HOOD-BRN-XL`).
2. **Size-Specific Inventory**: Out-of-stock sizes cannot be disabled independently while keeping in-stock sizes purchasable.
3. **Color-Specific Inventory**: If one color sells out, all colors are treated as having the parent product's inventory.
4. **Variant-Specific Pricing**: Cannot charge more for larger sizes (e.g. XXL heavyweight cotton) or premium leather variants.
5. **Variant-Specific Imagery**: Selecting a color variant cannot automatically filter the gallery to show that colorway.
6. **Unique Barcode / UPC / EAN**: No standard retail identifiers for warehouse barcode scanners.
7. **Product Status Lifecycle**: No state machine for `DRAFT`, `ACTIVE`, `SCHEDULED_DROP`, `OUT_OF_STOCK`, or `ARCHIVED`.
8. **Draft & Staging Products**: Every item in `products.json` is immediately visible and crawlable by search engines.
9. **Taxation & HSN Codes**: Indian GST compliance requires HSN codes (e.g., `6109` for knitted shirts, `6110` for jerseys) and applicable GST slab rates (5%, 12%, 18%).
10. **Logistics Dimensions**: Missing garment weight (e.g., 500g vs 1.2kg) and package dimensions (Length × Width × Height), preventing live volumetric rate calculation via Shiprocket/Delhivery APIs.

---

## 4. Phase 2 Target Schema Direction (Preview)

In Phase 2, this flat schema must be migrated to a relational schema (PostgreSQL with Prisma/Drizzle):

```
Product (Parent)
  ├── id (UUID)
  ├── title, slug, description, care
  ├── status (DRAFT | ACTIVE | ARCHIVED)
  ├── basePrice, compareAtPrice
  ├── hsnCode, taxRate
  │
  ├── ProductVariant (1-to-many)
  │     ├── id (UUID)
  │     ├── sku (e.g. YP-WLD-BRN-M)
  │     ├── size (XS, S, M, L, XL)
  │     ├── colorName, colorHex
  │     ├── inventoryQuantity
  │     ├── weightGrams
  │     └── priceOverride (optional)
  │
  └── ProductImage (1-to-many)
        ├── url, altText, isPrimary
        └── variantId (optional mapping)
```

*(Note: No database will be implemented in Phase 1; this documents the required architectural baseline).*

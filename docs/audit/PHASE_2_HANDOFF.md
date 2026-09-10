# Yaperz — Phase 2 Architectural Blueprint & Developer Handoff

> **Phase 1 Baseline Completed**: All existing routes, components, and client flows audited, stabilized, and verified with zero build/lint errors.  
> **Phase 2 Status**: **COMPLETED & VERIFIED (PASS)**. Relational database schema (20 tables), Drizzle ORM, SKU-level variants, atomic inventory reservations, zero-trust server-side pricing engine, API route handlers, and Vitest test suite (29 tests) are implemented. See [docs/architecture/](file:///Users/jayantolhyan/Desktop/my%20projects/clint%20/yaperz/docs/architecture/) for exhaustive architectural specifications.  
> **Next Progression**: Phase 3 — Customer Authentication & Session Management.  

---

## 1. Architectural Progression Path

```
┌─────────────────────────────────────────────────────────────┐
│               EXISTING YAPERZ FRONTEND (PHASE 1)            │
│    Next.js 16 App Router · CSS Modules · PWA · CartContext  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          PHASE 2: PRODUCTION DATA ARCHITECTURE & DB         │
│     PostgreSQL (Supabase/Neon) · Prisma / Drizzle ORM       │
│     Normalized Tables: Products, Variants, Inventory, Orders│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER API & AUTHENTICATION LAYER              │
│    Next.js Route Handlers · Server Actions · NextAuth.js    │
│    Customer Sessions · Role-Based Admin · Rate Limiting     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               PAYMENTS & ORDER STATE MACHINE                │
│    Razorpay India API · Webhook Verification · HMAC SHA256  │
│    ACID Transactional Checkout · Automated Invoicing        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             SHIPPING, LOGISTICS & NOTIFICATIONS             │
│    Shiprocket / Delhivery Courier API · Live AWB Tracking   │
│    Resend Email Receipts · WhatsApp Business Cloud API      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 2 Implementation Sequence (Milestones)

### Milestone 2.1: Relational Database & ORM Provisioning
* **Technology**: PostgreSQL (via Supabase or Neon Serverless) with Prisma or Drizzle ORM.
* **Schema Tables to Implement**:
  1. `users` (id, email, phone, role, password_hash, created_at)
  2. `customer_addresses` (id, user_id, recipient_name, phone, street, city, state, pincode, is_default)
  3. `products` (id, title, slug, description, care_instructions, base_price, compare_at_price, category_id, status, created_at)
  4. `product_variants` (id, product_id, sku, size, color_name, color_hex, inventory_quantity, weight_grams)
  5. `product_images` (id, product_id, variant_id, image_url, alt_text, display_order)
  6. `orders` (id, order_number, user_id, guest_email, status, payment_status, subtotal, shipping_fee, tax_amount, grand_total, shipping_address_json, tracking_number, created_at)
  7. `order_items` (id, order_id, variant_id, product_title, variant_sku, quantity, unit_price, line_total)
* **Migration Script**: Write a seed script migrating the 17 products in `src/data/products.json` into the relational tables.

---

### Milestone 2.2: Server API & Data Querying Layer
* Convert dynamic routes (`/collections/[slug]`, `/products/[slug]`) to React Server Components with streaming data fetching:
  * `GET /api/products` (faceted filtering, pagination, sorting)
  * `GET /api/products/[slug]` (fetch product with variants and images)
  * `GET /api/collections` (fetch collection categories and counts)
* Implement `generateMetadata()` in PDP and collection pages for dynamic SEO titles, descriptions, and OpenGraph tags.
* Embed Google Product JSON-LD structured data in PDP server rendering.

---

### Milestone 2.3: Secure Customer Authentication (NextAuth.js / Auth.js)
* Configure NextAuth.js in `src/app/api/auth/[...nextauth]/route.ts`.
* Support authentication providers:
  1. Passwordless Email Magic Link / OTP.
  2. Mobile Phone SMS OTP (via Twilio or MSG91).
  3. Google OAuth 2.0.
* Wire `/account` portal to real session token:
  * Display authentic order history queried from `orders` table.
  * Allow real CRUD operations on saved shipping addresses.

---

### Milestone 2.4: Razorpay India Payment Integration
* **Checkout API**:
  * `POST /api/checkout/create-session`: Accepts variant IDs and quantities. Recalculates all pricing server-side, validates inventory availability, and creates a Razorpay Order (`rzp.orders.create({ amount, currency: 'INR' })`).
* **Frontend Modal**:
  * Mount Razorpay Standard Checkout (`https://checkout.razorpay.com/v1/checkout.js`) with Razorpay Order ID.
* **Webhook Receiver**:
  * `POST /api/webhooks/razorpay`: Validates incoming HMAC SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`.
  * On `payment.captured`: Creates confirmed record in `orders` table, decrements `product_variants.inventory_quantity` within a database transaction, and triggers order confirmation notifications.

---

### Milestone 2.5: Logistics & Post-Purchase Fulfillment
* **Shiprocket / Delhivery API**:
  * `POST /api/shipping/calculate-rate`: Live pincode serviceability and shipping fee calculation.
  * Auto-create shipping shipment and generate AWB label upon payment confirmation.
* **Live Order Tracking**:
  * Wire `src/app/track-order/page.tsx` to carrier tracking API (`GET /api/shipping/track?orderId=...`).
* **Customer Communications**:
  * Trigger automated transactional email receipt via Resend.
  * Trigger automated WhatsApp message via WhatsApp Cloud API with order ID and carrier tracking link.

---

## 3. Developer Guidance & Rules for Phase 2

1. **Preserve Front-End Aesthetics**: The UI design, typography tokens in `globals.css`, and CSS Modules are battle-tested and approved. Do not alter styling tokens when connecting real data.
2. **Never Trust the Client**: Always recompute prices and taxes on the server. Never accept price parameters from client requests.
3. **Environment Security**: All credentials must be placed in `.env.local` based on `.env.example`. Never commit real secrets to GitHub.

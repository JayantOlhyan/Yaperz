# Yaperz — Production Gap Analysis

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Prioritization Scheme**:  
> * **P0 — Blocking**: Must be solved before real customers can transact.  
> * **P1 — High Priority**: Required for a serious, commercially credible launch.  
> * **P2 — Important**: Solved shortly after initial launch.  
> * **P3 — Enhancement**: Optional post-launch optimizations.  

---

## 1. P0 — Blocking Issues (Must Be Solved Before Launch)

### Issue 1: Lack of Real Payment Gateway Integration
* **Current Behavior**: Checkout form submits and immediately marks order as placed without charging a card, UPI intent, or netbanking session.
* **Expected Behavior**: Checkout should mount Razorpay standard modal or create Razorpay order on server, capture payment, and confirm order only upon receiving verified webhook signature.
* **Evidence**: `src/app/checkout/page.tsx` line 87 (`setIsOrdered(true)` invoked directly in form submit handler).
* **Impact**: Zero revenue collection possible; cannot process real customer orders.
* **Priority**: **P0 — Blocking**
* **Recommended Solution**: Implement server-side Razorpay order creation (`POST /api/checkout/razorpay/create-order`) and verified webhook listener (`/api/webhooks/razorpay`).
* **Phase**: Phase 2 (Backend & Payments)
* **Dependencies**: Razorpay Merchant Account, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.

---

### Issue 2: Lack of Persistent Database for Products, Orders & Inventory
* **Current Behavior**: Catalog is a static JSON file (`src/data/products.json`). Completed orders disappear upon page refresh. Inventory counts never decrement.
* **Expected Behavior**: Products, variants, orders, customers, and inventory must persist in a relational database with transactional ACID guarantees.
* **Evidence**: `src/data/products.json` (static 17 items); order confirmation stored only in component state (`orderId` state in `checkout/page.tsx`).
* **Impact**: Total data loss on refresh; no order fulfillment possible; multiple customers can purchase the same item.
* **Priority**: **P0 — Blocking**
* **Recommended Solution**: Provision PostgreSQL database (Supabase / Neon / AWS RDS) with Prisma or Drizzle ORM schemas for `Product`, `ProductVariant`, `Order`, `OrderItem`, and `Customer`.
* **Phase**: Phase 2 (Data Architecture)
* **Dependencies**: `DATABASE_URL`, PostgreSQL instance.

---

### Issue 3: Client-Side Price & Total Calculation Vulnerability
* **Current Behavior**: Subtotal, shipping fees, and taxes are calculated entirely in the browser and passed to order creation.
* **Expected Behavior**: Client submits only variant IDs and quantities. The server calculates unit prices, discounts, shipping tiers, and GST based on database records.
* **Evidence**: `src/app/checkout/page.tsx` line 48 (`const grandTotal = cartSubtotal + shippingCost`).
* **Impact**: High financial risk. An attacker can tamper with client variables to purchase high-value jackets (₹32,000) for ₹1.
* **Priority**: **P0 — Blocking**
* **Recommended Solution**: Enforce strict server-side price calculation and total verification before creating payment intents.
* **Phase**: Phase 2 (Commerce Backend)
* **Dependencies**: PostgreSQL Product Catalog.

---

### Issue 4: Variant-Level Inventory Deficiency
* **Current Behavior**: Product schema has a single `inventory: number` integer per product. If someone buys size "M", sizes "XS", "S", "L", "XL" also lose stock.
* **Expected Behavior**: Inventory must be tracked per individual SKU (size + color combination).
* **Evidence**: `src/data/products.json` line 17 (`"inventory": 8` for Brown Wildloom Hoodie across 6 sizes).
* **Impact**: Inaccurate stock tracking, overselling, and stockouts.
* **Priority**: **P0 — Blocking**
* **Recommended Solution**: Create `ProductVariant` table with SKU, size, color, and `inventory_quantity` fields.
* **Phase**: Phase 2 (Data Architecture)
* **Dependencies**: PostgreSQL Database.

---

## 2. P1 — High Priority Issues (Required for Serious Launch)

### Issue 5: Real Customer Authentication & Session Management
* **Current Behavior**: Login in `src/app/account/page.tsx` accepts any string and displays hardcoded mock orders.
* **Expected Behavior**: Secure customer authentication via email magic links, Google OAuth, or phone SMS OTP with HttpOnly session cookies.
* **Evidence**: `src/app/account/page.tsx` lines 19–27 (`handleLogin` sets `setIsLoggedIn(true)` without credentials check).
* **Impact**: Customers cannot securely view real purchase history or manage saved delivery addresses.
* **Priority**: **P1 — High Priority**
* **Recommended Solution**: Implement NextAuth.js (Auth.js) or Supabase Auth.
* **Phase**: Phase 2 (Authentication)
* **Dependencies**: `AUTH_SECRET`.

---

### Issue 6: Real Courier & Live Shipping Integration
* **Current Behavior**: Flat shipping rates calculated via hardcoded thresholds; `/track-order` displays static mock timeline.
* **Expected Behavior**: Live shipping serviceability check by pincode via Shiprocket or Delhivery API, generating real AWBs and live tracking updates.
* **Evidence**: `src/app/checkout/page.tsx` lines 38–45 and `src/app/track-order/page.tsx` lines 61–100.
* **Impact**: High shipping cost variance and inability for customers to track real packages.
* **Priority**: **P1 — High Priority**
* **Recommended Solution**: Integrate Shiprocket REST API for automated order push, label generation, and webhook tracking updates.
* **Phase**: Phase 2 (Logistics Integration)
* **Dependencies**: `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`.

---

### Issue 7: Automated Transactional Notifications
* **Current Behavior**: No confirmation emails or SMS/WhatsApp messages sent when an order is placed.
* **Expected Behavior**: Immediate automated email receipt and WhatsApp notification with order ID, summary, and tracking link.
* **Evidence**: `checkout/page.tsx` lines 87–90 (clears cart without calling notification APIs).
* **Impact**: High customer anxiety and increased support volume.
* **Priority**: **P1 — High Priority**
* **Recommended Solution**: Integrate Resend for transactional HTML email receipts and WhatsApp Cloud API for dispatch alerts.
* **Phase**: Phase 2 (Communications)
* **Dependencies**: Resend API Key, WhatsApp Business Account.

---

### Issue 8: Dynamic Route SEO Metadata & JSON-LD Rich Snippets
* **Current Behavior**: PDP and Collection pages are client components that inherit generic homepage title tags; structured JSON-LD schemas in `src/lib/seo.ts` are never rendered.
* **Expected Behavior**: Every PDP should dynamically export product title, price, OpenGraph image, and `<script type="application/ld+json">` for Google Shopping rich snippets.
* **Evidence**: `src/app/products/[slug]/page.tsx` (lacks `generateMetadata`).
* **Impact**: Reduced organic search visibility and poor social media share previews.
* **Priority**: **P1 — High Priority**
* **Recommended Solution**: Extract PDP into Server Component wrapper with `generateMetadata()` and render structured schema.
* **Phase**: Phase 2 (SEO Polish)
* **Dependencies**: Database product querying.

---

## 3. P2 — Important Issues (Shortly After Launch)

### Issue 9: Automated Test Suite
* **Current Behavior**: No automated unit, integration, or end-to-end tests exist (`npm test` does not exist).
* **Expected Behavior**: Vitest for unit tests (cart math, validators) and Playwright for core checkout smoke tests.
* **Evidence**: `package.json` scripts (`"test"` missing).
* **Impact**: Increased risk of regression during code updates.
* **Priority**: **P2 — Important**
* **Recommended Solution**: Install Vitest and write tests for `CartContext`, currency calculations, and form validators.
* **Phase**: Phase 2/3
* **Dependencies**: Vitest.

---

### Issue 10: Modal & Drawer Focus Trapping (Accessibility)
* **Current Behavior**: Cart drawer and search overlay lock scrolling, but keyboard Tab focus cycles into the background page.
* **Expected Behavior**: Focus must be constrained within open modal or drawer until dismissed.
* **Evidence**: `src/components/CartDrawer.tsx` (no focus trap ref).
* **Impact**: Accessibility barrier for keyboard-only and screen-reader users.
* **Priority**: **P2 — Important**
* **Recommended Solution**: Implement `@radix-ui/react-dialog` or lightweight `focus-trap-react`.
* **Phase**: Phase 2 (Accessibility Polish)
* **Dependencies**: None.

---

## 4. P3 — Enhancement (Optional Post-Launch)

### Issue 11: Real-Time Multi-Currency FX Engine
* **Current Behavior**: Location modal allows selecting USD/GBP/EUR, but prices remain in INR.
* **Expected Behavior**: Live conversion of prices using current FX exchange rates.
* **Evidence**: `src/components/LocationModal.tsx`.
* **Impact**: Cosmetic feature for international visitors.
* **Priority**: **P3 — Enhancement**
* **Recommended Solution**: Integrate Open Exchange Rates API.
* **Phase**: Phase 3
* **Dependencies**: Currency API key.

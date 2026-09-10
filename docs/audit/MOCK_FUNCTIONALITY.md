# Yaperz — Mock Functionality Audit & Replacement Roadmap

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Purpose**: Catalog all simulated capabilities across the repository and define their future production replacements.  

---

## 1. Inventory of Simulated Behaviors

| Feature Area | File & Exact Location | Current Mock Behavior | Production Replacement (Phase 2 & 3) |
| :--- | :--- | :--- | :--- |
| **Product Inventory** | `src/data/products.json` (Lines 17, 36, 55, etc.) | Static integer `inventory` on each product (e.g. `8`, `3`, `25`, `0`). Values never decrease upon order completion. | PostgreSQL `product_variants` table with transactional row-level locking (`SELECT ... FOR UPDATE`) during checkout. |
| **Order Number Generation** | `src/app/checkout/page.tsx` (Lines 72–73) | Generated on client via `YP-${Math.floor(100000 + Math.random() * 900000)}`. | PostgreSQL sequential or distributed order numbering sequence (`YP-YYYY-NNNNNN`) generated securely by server upon payment capture. |
| **Delivery Date Calculation** | `src/app/checkout/page.tsx` (Lines 76–85) | `new Date()` + `daysToAdd` (1, 2, or 5 days) formatted using Indian locale. | Shiprocket / Delhivery Courier Serviceability API (`/api/v1/courier/serviceability`) using origin & destination pincodes. |
| **Demo Address Autofill** | `src/app/checkout/page.tsx` (Lines 92–99) | Hardcoded button autofilling: `"Jayant", "Olhyan", "M-81, Block M, GK-II", "New Delhi", "110048"`. | Browser native autocomplete (`autoComplete="shipping address-line1"`) and Google Places Address Autocomplete API. |
| **Payment Gateway** | `src/app/checkout/page.tsx` (Lines 32, 50–90) | Radio buttons for `"razorpay"` and `"cod"`. Submitting form immediately sets `isOrdered(true)` without contacting payment APIs. | Server-side Razorpay Order API (`POST /v1/orders`) + Razorpay standard checkout modal (`Checkout.js`) + Server Webhook signature verification (`crypto.hmac_sha256`). |
| **Order Tracking Status** | `src/app/track-order/page.tsx` (Lines 61–100) | Form submits and immediately displays hardcoded stepper: *"In Transit via Delhivery in New Delhi"*, regardless of what ID was typed. | Carrier Webhook / REST query (`GET /api/v1/track?awb=...`) querying live tracking events from Delhivery or Shiprocket. |
| **Customer Authentication** | `src/app/account/page.tsx` (Lines 19–27) | `handleLogin` checks `!email || !password` and immediately sets `setIsLoggedIn(true)` without password verification. | NextAuth.js (Auth.js) / Supabase Auth with secure bcrypt hashing, session cookies (`HttpOnly; Secure; SameSite=Lax`), or WhatsApp SMS OTP. |
| **Account Order History** | `src/app/account/page.tsx` (Lines 29–44) | Hardcoded mock array of orders: `YP-882319` (Delivered, ₹18,500) and `YP-821903` (Processing, ₹3,500). | Authenticated API endpoint (`GET /api/account/orders`) querying orders associated with the authenticated customer's UUID. |
| **Saved Customer Addresses** | `src/app/account/page.tsx` (Lines 105–180) | Hardcoded address: *"Jayant Olhyan, Greater Kailash Part 2, New Delhi 110048"*. | Relational `customer_addresses` table linked to user profile with default address flags. |
| **Cart Persistence** | `src/context/CartContext.tsx` (Lines 30–53) | Cart items saved directly to unencrypted browser `localStorage` key `'yaperz-cart'`. | Server-synchronized cart: guest cart in `localStorage` + session cookie merged with database cart upon user login. |
| **Currency Switching** | `src/components/LocationModal.tsx` & `Header.tsx` | Allows selecting currencies (USD, GBP, EUR, INR) and stores in `localStorage`, but catalog prices remain hardcoded in INR. | Dynamic FX rate conversion API or region-specific price books in database. |
| **Simulated Catalog Loading** | `src/app/collections/[slug]/page.tsx` (Lines 39–48) | Explicit `setTimeout(..., 800)` to force `<SkeletonLoader />` visibility. | Native React 19 Server Components with streaming SSR (`Suspense` boundaries) during real database fetching. |
| **Client Analytics** | `src/lib/analytics.ts` (Lines 4–8) | `trackEvent()` outputs to `console.log('[Analytics]', ...)` in development mode only. | Production Google Analytics 4 (Measurement Protocol) and Meta Conversions API (server-side tracking). |

---

## 2. Retention Strategy for Phase 1

All mock behaviors documented above remain functional in Phase 1 as part of the established baseline. They will NOT be removed until their corresponding backend services (Database, Authentication, Payment Gateway, Shipping APIs) are introduced in Phase 2.

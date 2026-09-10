# Yaperz — End-to-End Commerce Flow Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Customer Journey Evaluated**:  
> Homepage → Collection → Product → Variant Selection → Add to Bag → Cart Drawer → Checkout → Payment → Order Confirmation → Tracking → Account Portal  

---

## 1. Step-by-Step Transition Matrix

| Stage | Action / Transition | Implementation Status | Classification | Technical Mechanism & Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **1. Discovery** | Home to Collection (`/collections/new-in`) | Functional | **REAL** | Client-side routing via `next/link`. Instant navigation with zero layout shift. |
| **2. Browsing** | Filter collection by size, color, price | Functional | **REAL** | In-memory filtering across `products.json`. Synchronizes state to URL query parameters via `useSearchParams()`. |
| **3. Product Selection** | Card click to PDP (`/products/[slug]`) | Functional | **REAL** | Dynamic route segment matching product slug in `products.json`. |
| **4. Variant Selection** | Pick size and color on PDP | Functional | **REAL** | State managed locally in PDP. Size validation fires error banner if user clicks Add to Bag without selecting size. |
| **5. Add to Cart** | Click "Add to Bag" | Functional | **REAL** | Dispatches to `CartContext.tsx`, updates state, automatically opens `<CartDrawer />`. |
| **6. Cart Management** | Increment, decrement, remove line item | Functional | **REAL** | Live total recomputation in INR. Removes item automatically when quantity drops to zero. |
| **7. Cart Persistence** | Refresh page or close browser | Functional | **REAL** | Synchronizes state with browser `localStorage.getItem('yaperz-cart')`. Restores cart on initial client mount. |
| **8. Checkout Transition** | Drawer CTA to `/checkout` | Functional | **REAL** | Navigates to `/checkout` carrying active cart subtotal and line items. |
| **9. Address Validation** | Customer fills shipping details | Functional | **REAL** | Client-side regex checks for valid email, 10-digit Indian phone, and 6-digit postal PIN code. Demo 1-click autofill functional. |
| **10. Shipping Calculation** | Pick Standard, Express, or Hand Delivery | Functional | **SIMULATED** | Calculates dynamic shipping cost: Standard free over ₹5,000 (else ₹150); Express ₹350; Hand delivery ₹6,000. Calculated purely in component state without courier API validation. |
| **11. Tax Calculation** | 12% GST simulation | Functional | **SIMULATED** | Computes `Math.round(subtotal * 0.12)`. Displayed as part of summary, but not verified by backend tax compliance service. |
| **12. Payment Processing** | Select Razorpay or COD and submit | Functional | **SIMULATED** | Does not open actual Razorpay checkout modal or process real currency. Simulates successful transaction immediately. |
| **13. Order Creation** | Generate order ID and delivery date | Functional | **SIMULATED** | Generates random ID: `YP-XXXXXX` (e.g., `YP-482190`) and delivery date (today + 1 to 5 days). Clears cart state. |
| **14. Order Persistence** | Retrieve order in database | Not Functional | **MISSING** | Generated order is NOT saved to a database or local storage. Reloading the checkout page discards the confirmation. |
| **15. Order Tracking** | Search order on `/track-order` | Functional | **SIMULATED** | Accepts any input and shows a hardcoded 5-step delivery milestone stepper ("In Transit via Delhivery"). |
| **16. Customer Portal** | Login and view past orders on `/account` | Functional | **SIMULATED** | Accepts any email/password input; displays two hardcoded mock orders (`YP-882319` and `YP-821903`). |

---

## 2. Classification Summary

### REAL (Fully Implemented & Persistent on Client)
* Complete client catalog browsing across all 17 items.
* Interactive multi-faceted filtering (size, color, category, price, stock).
* Product detail page interactive zoom and variant picking.
* Size selection enforcement validation.
* Shopping cart line item manipulations (add, quantity changes, removal, subtotal).
* Bidirectional `localStorage` state synchronization across browser tabs and refreshes.
* Client-side form input validation for email, phone, and pincode.
* Responsive drawer overlays and keyboard Escape-key dismissals.

### SIMULATED (Functional Appearance, Mock Backend)
* **Shipping Rates**: Static tier thresholds rather than live Shiprocket/Delhivery courier serviceability API.
* **Taxes**: Static 12% GST estimate rather than itemized HSN-based tax engine.
* **Payment Gateway**: Simulated radio buttons for Razorpay/COD without payment gateway handshakes.
* **Order ID Generation**: Math.random() random prefix without transactional order table insertion.
* **Delivery Dates**: `Date()` additions without carrier transit schedules.
* **Order Tracking**: Static milestone stepper disconnected from carrier AWB tracking.
* **Authentication**: Simulated login accepting any credential.

### BROKEN (Confirmed Defects)
* **Stories Bar Store Link**: Previously pointed to `/store`, which returned a 404 error. *(Fixed in Phase 1: Routed to `/about-us`)*.
* **Footer Careers Link**: Previously pointed to `/careers`, which returned a 404 error. *(Fixed in Phase 1: Replaced with `mailto:careers@yaperz.com`)*.
* **Unescaped Entities**: Caused ESLint failures across multiple pages. *(Fixed in Phase 1)*.

### MISSING (Required for Production Launch)
* Server-side inventory reservation (prevents two users purchasing the same last item).
* Real Razorpay webhook handler to confirm authorized transactions before order generation.
* PostgreSQL database schema for Orders, LineItems, Customers, and Addresses.
* Automated transactional notifications (WhatsApp Cloud API / Resend transactional email).
* Courier API integration (Shiprocket / Delhivery AWB dispatch).

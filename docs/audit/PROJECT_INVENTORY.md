# Yaperz — Project Inventory & Route Registry

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Repository**: [https://github.com/JayantOlhyan/Yaperz](https://github.com/JayantOlhyan/Yaperz)  
> **Live Target**: [https://yaperz.netlify.app/](https://yaperz.netlify.app/)  
> **Verified Date**: September 2026  

---

## 1. Technical Architecture Summary

| Dimension | Specification / Implementation | Verified State |
| :--- | :--- | :--- |
| **Application Name** | Yaperz (Streetwear E-Commerce Storefront) | Verified in `package.json` |
| **Framework** | Next.js (App Router, Turbopack) | `16.2.9` |
| **React Runtime** | React 19 / React DOM | `19.2.4` |
| **Language** | TypeScript (Strict mode enabled) | `^5.0` (`tsconfig.json`) |
| **Build Tooling** | `next build` (Turbopack optimization) | Compiles in ~1.2s across 18 routes |
| **CSS Architecture** | CSS Modules (`*.module.css`) + Global CSS custom properties | Fluid clamp typography (`--text-xs` to `--text-5xl`) in `src/app/globals.css` |
| **State Management** | React Context API (`CartContext.tsx`) + `localStorage` | Cart key: `'yaperz-cart'`, Location key: `'yaperz_location'` |
| **Data Architecture** | Static JSON datastore (`src/data/products.json`) | Read-only client catalog containing 17 products |
| **PWA Architecture** | Service Worker (`public/sw.js`) + Manifest (`public/manifest.webmanifest`) | Offline route (`/offline`), Install prompt listener in `PWAProvider.tsx` |
| **Deployment Target** | Netlify (`yaperz.netlify.app`) | Auto-build from GitHub `main` branch |
| **Icons Library** | `lucide-react` | `^1.17.0` |
| **Image Processing** | `sharp` | `^0.35.2` |

---

## 2. Verified Route Registry (18 Routes Audited)

Every route in the repository has been inspected directly from disk and verified against build output.

| # | Route | Source File | Rendering Mode | Data Dependencies | Interactive Features | Forms | External Dependencies | Current Status | Known Limitations |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | `src/app/page.tsx` | Client (`'use client'`) | `src/data/products.json` | Stories reel, Hero CTA, Horizontal scroll grid, Collection spotlights, SEO accordion toggle | None | `lucide-react` | **PASS** | Marked `'use client'`, preventing server-side metadata export. |
| 2 | `/collections` | `src/app/collections/page.tsx` | Client (`'use client'`) | `src/data/products.json` | Collection directory navigation cards with dynamic item counts | None | None | **PASS** | Hardcoded collections list mapped against static JSON. |
| 3 | `/collections/[slug]` | `src/app/collections/[slug]/page.tsx` | Dynamic (`ƒ`) | `src/data/products.json`, URL query params | Simulated skeleton loader (800ms), multi-select size filter, color swatches, category pills, price range slider, sort dropdown, URL sync | Filter controls | `next/navigation`, `lucide-react` | **PASS** | Filtering runs client-side on 17 products; no server pagination or faceted query engine. |
| 4 | `/products/[slug]` | `src/app/products/[slug]/page.tsx` | Dynamic (`ƒ`) | `src/data/products.json`, URL params | Interactive mouse-coordinate image zoom, size/color variant selection, quantity counter, pincode checker, Size Guide modal, accordions, related items | Pincode delivery lookup, size selector | `next/navigation`, `lucide-react` | **PASS** | Client-side only; no dynamic OpenGraph image or server-generated JSON-LD rendered. |
| 5 | `/checkout` | `src/app/checkout/page.tsx` | Client (`'use client'`) | `CartContext` (`localStorage`) | Contact details, shipping address validation, 1-click demo autofill, dynamic shipping calculation, Razorpay/COD selection, order receipt generation | Full multi-step checkout form | `lucide-react` | **PASS** | Payment and order creation are fully simulated. No server payment webhook or order storage. |
| 6 | `/account` | `src/app/account/page.tsx` | Client (`'use client'`) | Mock orders & addresses in component state | Mock login form, tabbed navigation (Order History, Saved Addresses, Profile Settings), address add/edit modals | Login form, address creation form | `lucide-react` | **PASS** | Authentication is simulated; accepts any email/password without backend validation. |
| 7 | `/track-order` | `src/app/track-order/page.tsx` | Client (`'use client'`) | Component state | Tracking lookup form, dynamic 5-step delivery milestone timeline | Order tracking lookup form | None | **PASS** | Delivery status is static mock; not connected to courier AWB tracking API. |
| 8 | `/about-us` | `src/app/about-us/page.tsx` | Client (`'use client'`) | Hardcoded editorial copy | Brand narrative, manifesto quote, milestone chronology (2020–2026) | None | None | **PASS** | Static page could be Server Component. |
| 9 | `/collaborations` | `src/app/collaborations/page.tsx` | Client (`'use client'`) | Hardcoded partnership list | Creator capsules showcase (Samay Raina, Racing Club), drop link navigation | None | None | **PASS** | Static page could be Server Component. |
| 10 | `/faq` | `src/app/faq/page.tsx` | Client (`'use client'`) | Hardcoded FAQ array | Accordion toggle (Sizing, drops, COD, tracking, returns, retail stores) | None | `lucide-react` | **PASS** | Static page could be Server Component. |
| 11 | `/sitemap` | `src/app/sitemap/page.tsx` | Client (`'use client'`) | Hardcoded link registry | Grouped directory of all storefront collections, customer tools, company info, and legal policies | None | None | **PASS** | HTML sitemap only; missing standard `sitemap.xml` and `robots.txt` endpoints. |
| 12 | `/policies/privacy` | `src/app/policies/privacy/page.tsx` | Client (`'use client'`) | Static policy text | Legal disclosure reading view | None | None | **PASS** | Static page could be Server Component. |
| 13 | `/policies/terms` | `src/app/policies/terms/page.tsx` | Client (`'use client'`) | Static policy text | User agreement terms reading view | None | None | **PASS** | Static page could be Server Component. |
| 14 | `/policies/shipping` | `src/app/policies/shipping/page.tsx` | Client (`'use client'`) | Static policy text | Delivery rates, carriers, same-day cutoff reading view | None | None | **PASS** | Static page could be Server Component. |
| 15 | `/policies/refund` | `src/app/policies/refund/page.tsx` | Client (`'use client'`) | Static policy text | Return inspection, bank refund timelines reading view | None | None | **PASS** | Static page could be Server Component. |
| 16 | `/policies/returns` | `src/app/policies/returns/page.tsx` | Client (`'use client'`) | Static policy text | 7-day return conditions, hygiene restrictions reading view | None | None | **PASS** | Static page could be Server Component. |
| 17 | `/offline` | `src/app/offline/page.tsx` | Static (`force-static`) | Component state | Offline network alert, automated reconnection listener, manual "Try Again" network test | None | `lucide-react` | **PASS** | Fully cached in Service Worker app shell. |
| 18 | `/_not-found` | `src/app/not-found.tsx` | Client (`'use client'`) | None | 404 error header, back to shop navigation button | None | None | **PASS** | Custom fallback page. |
| — | `error.tsx` | `src/app/error.tsx` | Client Error Boundary | Runtime error context | Error code display (`500`), error logging, `reset()` recovery action | None | None | **PASS** | Captures React runtime errors. |

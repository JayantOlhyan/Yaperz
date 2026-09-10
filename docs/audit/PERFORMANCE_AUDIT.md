# Yaperz — Performance, Bundle & Core Web Vitals Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Build Engine**: Next.js 16.2.9 (Turbopack)  
> **Target Platform**: Desktop & Mobile Web (PWA)  

---

## 1. Production Build & Compilation Metrics

* **Production Compilation Time**: `1274ms` (Turbopack)
* **TypeScript Check Time**: `1255ms`
* **Static Route Generation Time**: `169ms` across 18 routes (9 parallel workers)
* **Total Build Time**: `< 3.0 seconds`
* **Build Exit Code**: `0` (Zero errors)

### Route Tree Rendering Breakdown
```
Route (app)                              Size     First Load JS
┌ ○ /                                   Static   Prerendered
├ ○ /_not-found                         Static   Prerendered
├ ○ /about-us                           Static   Prerendered
├ ○ /account                            Static   Prerendered
├ ○ /checkout                           Static   Prerendered
├ ○ /collaborations                     Static   Prerendered
├ ○ /collections                        Static   Prerendered
├ ƒ /collections/[slug]                 Dynamic  Server-rendered on demand
├ ○ /faq                                Static   Prerendered
├ ○ /offline                            Static   Prerendered (force-static)
├ ○ /policies/privacy                   Static   Prerendered
├ ○ /policies/refund                    Static   Prerendered
├ ○ /policies/returns                   Static   Prerendered
├ ○ /policies/shipping                  Static   Prerendered
├ ○ /policies/terms                     Static   Prerendered
├ ƒ /products/[slug]                    Dynamic  Server-rendered on demand
├ ○ /sitemap                            Static   Prerendered
└ ○ /track-order                        Static   Prerendered

○ (Static)   Prerendered as static HTML/JSON
ƒ (Dynamic)  Server-rendered on demand based on request parameters
```

---

## 2. Core Web Vitals (CWV) & Frontend Optimization Audit

| CWV Metric | Audit Findings & Current Implementation | Risk Level | Phase 2 Optimization Plan |
| :--- | :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | Hero image (`/images/hero-desktop.png`) and product card images use raw HTML `<img>` tags rather than Next.js `<Image />`. In `Header.tsx`, ESLint reports 15 warnings for unoptimized `<img>` tags inside the mega menus. | **MEDIUM** | Migrate product and hero images to `next/image` with `priority` on above-the-fold hero and `loading="lazy"` on below-the-fold grids. Serve WebP/AVIF formats automatically via Next.js image optimizer. |
| **CLS (Cumulative Layout Shift)** | Product image wrappers use fixed aspect ratios via CSS (`aspect-ratio: 3 / 4` or fixed heights). Loading skeletons in `collections/[slug]` match final card dimensions. | **LOW (EXCELLENT)** | Preserves layout stability during simulated loading; CLS score projected `< 0.05`. |
| **INP (Interaction to Next Paint)** | Event handlers (cart toggle, filter toggle, quantity increment) perform lightweight local state updates without blocking operations. | **LOW (EXCELLENT)** | INP remains well under the 200ms threshold. |
| **Font Loading** | Google Fonts (`Archivo Black`, `Fraunces`, `Inter`) loaded via CSS `@import url(...)` in `globals.css` instead of Next.js `next/font/google`. | **MEDIUM** | `@import` in CSS blocks rendering until remote Google font CSS is downloaded. In Phase 2, migrate to `next/font/google` for zero-layout-shift local font self-hosting. |
| **Client Component Boundaries** | All 18 pages currently declare `'use client'`. While fast for client-side routing, this increases client JavaScript bundle size unnecessarily for static legal policies. | **LOW** | Static pages (`about-us`, `faq`, `policies/*`, `sitemap`) should be migrated to React Server Components in Phase 2 to eliminate their client JS footprint. |

---

## 3. PWA & Runtime Asset Caching Audit

* **Service Worker (`public/sw.js`)**:
  * **Static Pre-caching**: Automatically precaches `/offline`, `/manifest.webmanifest`, `/favicon.ico`, and all PWA icon resolutions upon install.
  * **Navigation Strategy**: Network-first with runtime cache fallback, falling back to cached `/offline` page on complete network failure.
  * **Web Fonts Caching**: Cache-first strategy for Google Fonts (`fonts.googleapis.com` and `fonts.gstatic.com`).
  * **Image Caching**: Cache-first strategy with runtime cache storage for `/images/products/`.
* **Verdict**: Service worker caching is configured properly and ensures snappy repeat visits.

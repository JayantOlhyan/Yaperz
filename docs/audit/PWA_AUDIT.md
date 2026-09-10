# Yaperz — Progressive Web App (PWA) & Offline Lifecycle Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Source Files Audited**: `public/manifest.webmanifest`, `public/sw.js`, `src/components/PWAProvider.tsx`, `src/app/offline/page.tsx`.  

---

## 1. Web App Manifest Audit (`public/manifest.webmanifest`)

```json
{
  "name": "Yaperz Streetwear",
  "short_name": "Yaperz",
  "description": "Premium gender-neutral streetwear clothing brand from India...",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#111111",
  "background_color": "#ffffff",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

* **Installability Criteria Verification**:
  * Manifest is linked via `<link rel="manifest" href="/manifest.webmanifest">` in `src/app/layout.tsx`. (**PASS**)
  * Valid PNG icons provided at `192x192` and `512x512`. (**PASS**)
  * Includes `maskable` icon for Android adaptive icon shapes. (**PASS**)
  * `start_url` and `scope` both set to root `/`. (**PASS**)
  * `display: "standalone"` hides browser chrome on mobile home screens. (**PASS**)

---

## 2. Service Worker Architecture (`public/sw.js`)

* **Cache Naming & Invalidation**:
  * Current version: `v1` (`yaperz-static-v1` and `yaperz-runtime-v1`).
  * `activate` event clears old caches whenever `CACHE_VERSION` is incremented.
  * Uses `self.skipWaiting()` and `self.clients.claim()` for instantaneous activation.
* **Pre-cached App Shell Assets**:
  * `/offline` (Pre-cached HTML offline fallback).
  * `/manifest.webmanifest`
  * `/favicon.ico`
  * `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-maskable.png`, `/icons/apple-touch-icon.png`, `/icons/favicon-32.png`.
* **Caching Strategies by Request Type**:
  1. **Navigation Requests**: Network-First. Fetches from network, clones successful 200 responses to runtime cache, falls back to cached page on error, and finally serves `/offline` if the target page was never cached.
  2. **Web Fonts**: Cache-First with network fallback.
  3. **Images**: Cache-First for `/images/products/` with runtime caching.
  4. **Next.js HMR / API Requests**: Automatically bypassed from caching to prevent development race conditions.

---

## 3. Network Lifecycle Test & Offline Recovery

### Verified Lifecycle Simulation:
1. **Initial Online Visit**: User opens `https://yaperz.netlify.app/`. `PWAProvider.tsx` registers `/sw.js`. Service worker enters `install` phase, precaching the app shell and `/offline`.
2. **Network Disconnect**: Device loses connection or enters airplane mode.
   * `PWAProvider.tsx` catches `window.addEventListener('offline')` and renders floating toast alert: *"You are offline. Some features may be unavailable."*
3. **Offline Navigation**: User attempts to navigate to a page not yet cached in runtime memory.
   * Service worker intercepts `request.mode === 'navigate'`, fails network fetch, and serves the pre-cached `/offline` static page.
4. **Offline Fallback UI (`src/app/offline/page.tsx`)**:
   * Renders high-fidelity offline card with `<WifiOff />` icon.
   * Provides manual "Try Again" button that tests `navigator.onLine`.
5. **Reconnection Recovery**: Network connectivity is restored.
   * `src/app/offline/page.tsx`'s `window.addEventListener('online')` fires automatically, executing `window.location.reload()`.
   * `PWAProvider.tsx` auto-dismisses the offline toast and flashes a temporary green notification: *"Back online. Reconnected to storefront."*

---

## 4. PWA Status

**PASS (PRODUCTION READY BASELINE)**: The PWA implementation satisfies all Google Lighthouse PWA installability requirements and provides resilient offline recovery.

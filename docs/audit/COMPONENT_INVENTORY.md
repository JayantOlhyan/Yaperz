# Yaperz — Component Inventory & Lifecycle Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Target Directory**: `src/components/` & key route sub-components  
> **Total Key Components Audited**: 14  

---

## 1. Master Component Registry

### 1. `Header`
* **File Path**: `src/components/Header.tsx` ([Header.module.css](src/components/Header.module.css))
* **Responsibility**: Global sticky navigation bar, brand identity logo, desktop mega menu triggers (Men, Women, Accessories, About Us), mobile accordion drawer, location/currency trigger, search overlay trigger, cart drawer toggle with dynamic badge counter.
* **Props**: `{ onSearchOpen: () => void }`
* **Internal State**: `isMenuOpen` (boolean), `isCollectionsOpen` (boolean), `isLocationOpen` (boolean), `selectedLocation` (`Location` object).
* **Context Dependencies**: `useCart()` (`CartContext`) for `openCart`, `cartCount`.
* **External Dependencies**: `lucide-react` (`Search`, `User`, `ShoppingBag`, `Menu`, `X`, `ChevronDown`, `ChevronUp`), `next/link`, `next/navigation` (`usePathname`).
* **Routes Used**: Global (rendered in `LayoutShell.tsx` on all 18 routes).
* **Potential Issues**: Mega menus use CSS `:hover`, making keyboard-only navigation difficult without `:focus-within` styling. Unoptimized `<img>` tags inside visual mega menu cards.
* **Production Recommendation**: **SURVIVE (Retain & Refactor in Phase 2)**: Add keyboard focus traps, migrate images to `next/image`, and extract mega menu datasets into server-configurable navigation schemas.

---

### 2. `Footer`
* **File Path**: `src/components/Footer.tsx` ([Footer.module.css](src/components/Footer.module.css))
* **Responsibility**: Multi-column storefront footer containing SEO keyword tag cloud, customer support navigation, brand story links, direct phone/WhatsApp/email contact links, copyright, and policy links.
* **Props**: None (`React.FC`).
* **Internal State**: None (stateless).
* **Context Dependencies**: None.
* **External Dependencies**: `next/link`.
* **Routes Used**: Global (rendered in `LayoutShell.tsx` across all 18 routes).
* **Potential Issues**: Tag cloud search links trigger `/collections/all-products?search=...`, which runs a full client-side filter.
* **Production Recommendation**: **SURVIVE (Retain)**: Clean semantic HTML layout; ready for production.

---

### 3. `CartDrawer`
* **File Path**: `src/components/CartDrawer.tsx` ([CartDrawer.module.css](src/components/CartDrawer.module.css))
* **Responsibility**: Slide-out right shopping bag panel showing active line items, thumbnails, selected size/color badges, quantity increment/decrement controls, live subtotal in INR, empty state shortcuts, and checkout navigation button.
* **Props**: None (`React.FC`).
* **Internal State**: None (consumes cart state directly).
* **Context Dependencies**: `useCart()` (`cartItems`, `isCartOpen`, `closeCart`, `updateQuantity`, `removeFromCart`, `cartSubtotal`).
* **External Dependencies**: `lucide-react` (`X`, `Plus`, `Minus`, `ShoppingBag`), `next/link`, `next/navigation` (`useRouter`).
* **Routes Used**: Global (rendered in `LayoutShell.tsx` across all 18 routes).
* **Potential Issues**: Missing keyboard focus trap when drawer is open.
* **Production Recommendation**: **SURVIVE (Retain & Refactor in Phase 2)**: Add focus trapping and wire to backend checkout session validation.

---

### 4. `SearchOverlay`
* **File Path**: `src/components/SearchOverlay.tsx` ([SearchOverlay.module.css](src/components/SearchOverlay.module.css))
* **Responsibility**: Fullscreen modal search dialogue with auto-focus input, instant client-side debounced text filtering across product title, category, tags, and description, top search tags, and direct product navigation.
* **Props**: `{ isOpen: boolean, onClose: () => void }`
* **Internal State**: `query` (string), `results` (`Product[]`).
* **Context Dependencies**: None.
* **External Dependencies**: `lucide-react` (`X`, `Search`), `next/navigation` (`useRouter`).
* **Routes Used**: Global (mounted in `LayoutShell.tsx`).
* **Potential Issues**: Searches purely against static `products.json` client bundle; cannot scale to 10,000+ SKU catalogs without a server search endpoint (e.g. Algolia/Meilisearch/PostgreSQL Full Text).
* **Production Recommendation**: **SURVIVE (Retain & Connect in Phase 2)**: Keep UI structure; replace local filter with server search API endpoint.

---

### 5. `ProductCard`
* **File Path**: `src/components/ProductCard.tsx` ([ProductCard.module.css](src/components/ProductCard.module.css))
* **Responsibility**: Product preview grid card featuring primary/secondary image hover crossfade, status badges ("Sold Out", "New", "Sale"), quick-add size overlay grid, title, and formatted INR pricing.
* **Props**: `{ product: Product }`
* **Internal State**: None.
* **Context Dependencies**: `useCart()` (`addToCart`).
* **External Dependencies**: `next/navigation` (`useRouter`).
* **Routes Used**: Homepage (`/`), Collection Detail (`/collections/[slug]`), Related Products in PDP (`/products/[slug]`).
* **Potential Issues**: Quick-add automatically selects `product.colors[0]` without prompting for color if multi-color variants exist. Uses standard `<img>` tags instead of `next/image`.
* **Production Recommendation**: **SURVIVE (Retain & Enhance in Phase 2)**: Implement `next/image` with blur placeholder and add multi-color quick selection.

---

### 6. `StoriesBar`
* **File Path**: `src/components/StoriesBar.tsx` ([StoriesBar.module.css](src/components/StoriesBar.module.css))
* **Responsibility**: Instagram-style horizontal stories reel displaying circular avatars with unread gradient rings; opens a fullscreen modal story viewer with keyboard navigation (`ArrowLeft`, `ArrowRight`, `Escape`), slide indicators, and direct shop CTAs.
* **Props**: None (`React.FC`).
* **Internal State**: `activeStoryIndex` (`number | null`).
* **Context Dependencies**: None.
* **External Dependencies**: `lucide-react` (`X`, `ChevronLeft`, `ChevronRight`), `next/link`.
* **Routes Used**: Homepage (`/`).
* **Potential Issues**: Story slides and assets are hardcoded inside the component file rather than driven by CMS or API.
* **Production Recommendation**: **SURVIVE (Retain)**: Strong mobile engagement pattern; connect to dynamic CMS in Phase 3.

---

### 7. `LocationModal`
* **File Path**: `src/components/LocationModal.tsx` ([LocationModal.module.css](src/components/LocationModal.module.css))
* **Responsibility**: Modal dialogue allowing customers to select their preferred regional storefront and currency (India INR, United Kingdom GBP, European Union EUR, United States USD, Rest of World USD) with custom circular SVG flags and physical flagship retail addresses.
* **Props**: `{ isOpen: boolean, onClose: () => void, onSelect: (loc: Location) => void, activeCode: string }`
* **Internal State**: None.
* **Context Dependencies**: None.
* **External Dependencies**: `lucide-react` (`X`).
* **Routes Used**: Mounted in `Header.tsx`.
* **Potential Issues**: Switching currency does not dynamically re-calculate product prices via real-time FX rates (prices remain fixed in INR throughout the store).
* **Production Recommendation**: **SURVIVE (Retain & Wire in Phase 2)**: Connect currency choice to multi-currency pricing engine in backend.

---

### 8. `SkeletonLoader`
* **File Path**: `src/components/SkeletonLoader.tsx` ([SkeletonLoader.module.css](src/components/SkeletonLoader.module.css))
* **Responsibility**: Animated shimmer pulse placeholder cards simulating product catalog loading states during collection filtering and route transitions.
* **Props**: `{ count?: number }` (defaults to 8).
* **Internal State**: None.
* **Context Dependencies**: None.
* **External Dependencies**: None.
* **Routes Used**: Collection Detail (`/collections/[slug]`).
* **Potential Issues**: Hardcoded 800ms loading delay in `collections/[slug]/page.tsx` simulates loading even though data is already local.
* **Production Recommendation**: **SURVIVE (Retain)**: Will be naturally wired to React Suspense / Server Component data streaming in Phase 2.

---

### 9. `PWAProvider`
* **File Path**: `src/components/PWAProvider.tsx` ([PWAProvider.module.css](src/components/PWAProvider.module.css))
* **Responsibility**: Registers `/sw.js` service worker on mount, intercepts browser `beforeinstallprompt` event, displays custom install banner, and listens for browser `online` and `offline` events to render floating toast notifications.
* **Props**: `{ children: React.ReactNode }`
* **Internal State**: `showOfflineToast` (boolean), `showOnlineToast` (boolean), `onlineClosing` (boolean), `installPrompt` (event), `showInstallBtn` (boolean).
* **Context Dependencies**: None.
* **External Dependencies**: `lucide-react` (`Wifi`, `WifiOff`, `X`).
* **Routes Used**: Global (wraps root layout in `src/app/layout.tsx`).
* **Potential Issues**: Service worker registration can conflict with hot-module replacement during rapid local dev if caching headers are misconfigured.
* **Production Recommendation**: **SURVIVE (Retain)**: Production-ready PWA lifecycle manager.

---

### 10. `LayoutShell`
* **File Path**: `src/components/LayoutShell.tsx`
* **Responsibility**: Composes application frame (`Header`, `main`, `Footer`, `CartDrawer`, `SearchOverlay`) and wraps children with `CartProvider`.
* **Props**: `{ children: React.ReactNode }`
* **Internal State**: `isSearchOpen` (boolean).
* **Context Dependencies**: None (provides `CartProvider`).
* **External Dependencies**: None.
* **Routes Used**: Global (invoked in `RootLayout`).
* **Potential Issues**: Forces entire application body to be a client context provider.
* **Production Recommendation**: **SURVIVE (Retain)**: Standard App Router layout shell.

---

### 11. Product Image Magnifier (PDP Sub-Component)
* **File Path**: Embedded in `src/app/products/[slug]/page.tsx`
* **Responsibility**: Tracks mouse cursor coordinates (`getBoundingClientRect`) across the active product image and applies CSS background zoom magnification.
* **Props**: Internal to PDP.
* **Internal State**: `isZoomed` (boolean), `zoomPos` (`{ x: number, y: number }`).
* **Context Dependencies**: None.
* **External Dependencies**: None.
* **Routes Used**: Product Detail (`/products/[slug]`).
* **Potential Issues**: Does not support touch pinch-to-zoom on iOS/Android devices.
* **Production Recommendation**: **SURVIVE (Retain & Add Touch Zoom)**.

---

### 12. Size Guide Modal (PDP Sub-Component)
* **File Path**: Embedded in `src/app/products/[slug]/page.tsx`
* **Responsibility**: Modal dialogue displaying garment measurements (Chest, Length, Shoulder) across sizes `XS` through `XXL` with measurement instructions.
* **Props**: Internal to PDP.
* **Internal State**: `isSizeGuideOpen` (boolean).
* **Context Dependencies**: None.
* **External Dependencies**: `lucide-react` (`X`, `Ruler`).
* **Routes Used**: Product Detail (`/products/[slug]`).
* **Potential Issues**: Measurement chart is currently uniform across all product categories (hoodies, tees, caps, and jackets share similar numbers).
* **Production Recommendation**: **SURVIVE (Retain & Category-Specialize in Phase 2)**.

---

### 13. Tracking Milestone Timeline (Track Order Sub-Component)
* **File Path**: Embedded in `src/app/track-order/page.tsx`
* **Responsibility**: Visual 5-step vertical stepper depicting delivery progress ("Order Confirmed", "Dispatched", "In Transit", "Out for Delivery", "Delivered") with active node status.
* **Props**: Internal to Track Order.
* **Internal State**: `isTracked` (boolean).
* **Context Dependencies**: None.
* **External Dependencies**: None.
* **Routes Used**: Track Order (`/track-order`).
* **Potential Issues**: Stepper displays static hardcoded states; not dynamically parsed from real logistics carrier webhooks.
* **Production Recommendation**: **SURVIVE (Retain & Wire to Courier API in Phase 2)**.

---

### 14. Error Boundary Fallback (`ErrorPage`)
* **File Path**: `src/app/error.tsx`
* **Responsibility**: Intercepts unhandled runtime exceptions in the React tree, logs error digests to monitoring, displays user-friendly 500 error view, and provides a recovery `reset()` button.
* **Props**: `{ error: Error & { digest?: string }, reset: () => void }`
* **Internal State**: None.
* **Context Dependencies**: None.
* **External Dependencies**: `next/link`.
* **Routes Used**: Global Next.js App Router error handler.
* **Potential Issues**: Currently logs to `console.error` rather than Sentry/DataDog.
* **Production Recommendation**: **SURVIVE (Retain & Connect to Sentry in Phase 2)**.

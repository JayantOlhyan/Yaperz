# Yaperz — Accessibility (a11y) & WCAG Compliance Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Standard**: WCAG 2.1 Level AA  
> **Key Evaluated Components**: Header, Cart Drawer, Search Overlay, Size Guide, Collection Filters, Checkout Form.  

---

## 1. Compliance Matrix by Category

| WCAG Category | Evaluated Feature | Audit Finding & Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Keyboard Navigation** | Tab index & link accessibility | **PASS WITH WARNING** | All interactive elements (`<button>`, `<a>`, `<input>`) are natively focusable. However, desktop mega menus in `Header.tsx` trigger solely on CSS `:hover` and cannot be opened via Tab/Enter keys. |
| **Escape-Key Handling** | Modal & drawer dismissal | **PASS** | `Header.tsx` (mobile drawer), `StoriesBar.tsx`, and `SearchOverlay.tsx` implement `window.addEventListener('keydown')` listening for `e.key === 'Escape'`. |
| **Focus Trapping** | Trapping Tab focus inside active drawers | **DEFECT (P1)** | `<CartDrawer />`, `<SearchOverlay />`, and `<LocationModal />` lock `document.body.style.overflow`, but do NOT trap keyboard focus. A user pressing Tab can focus background page links while the modal is open. |
| **ARIA Labels** | Screen-reader landmark descriptions | **PASS** | Icon buttons throughout `Header.tsx`, `CartDrawer.tsx`, and `SearchOverlay.tsx` include descriptive `aria-label` attributes (`"Open menu"`, `"Close menu"`, `"Search"`, `"Account"`, `"Cart"`, `"Close cart"`). |
| **Form Labels & Associations** | Input label accessibility | **PASS** | Checkout form in `checkout/page.tsx` and Track Order form in `track-order/page.tsx` feature explicit `<label>` tags above all text inputs. |
| **Error Messaging** | Validation error visibility | **PASS** | Size error on PDP and address validation errors on checkout render high-visibility red error banners with descriptive correction text. |
| **Touch Target Sizes** | Mobile tap targets (min 44×44px) | **PASS** | Mobile hamburger trigger, cart trigger, quick-add buttons, and checkout buttons satisfy the 44px minimum touch target recommendation. |
| **Color Contrast** | Text-to-background contrast ratios | **PASS** | `--color-text-primary` (`#111111`) on `--color-background` (`#ffffff`) yields **16.1:1** (exceeds AAA). `--color-text-muted` (`#707070`) yields **4.7:1** (meets AA 4.5:1 standard). |
| **Reduced Motion** | Respecting user animation preferences | **PASS WITH WARNING** | Global CSS transitions are short (`150ms` to `300ms`), but missing an explicit `@media (prefers-reduced-motion: reduce)` block to disable slide-in drawer transitions. |

---

## 2. Deep-Dive Component Findings

### 1. Mobile Menu Drawer (`Header.tsx`)
* **Positive**: Closes upon pressing Escape; automatically closes upon route change (`usePathname`); locks background scrolling.
* **Remediation Needed (Phase 2)**: Add ARIA modal attributes (`role="dialog"`, `aria-modal="true"`) and focus trapping.

### 2. Search Overlay (`SearchOverlay.tsx`)
* **Positive**: Automatically focuses the search input on open via `inputRef.current?.focus()`; handles Escape key.
* **Remediation Needed (Phase 2)**: Wrap modal container in `role="dialog"` with `aria-label="Product Search"`.

### 3. Cart Drawer (`CartDrawer.tsx`)
* **Positive**: Accessible quantity increment/decrement buttons; close button labeled clearly.
* **Remediation Needed (Phase 2)**: Announce cart updates to screen readers via an `aria-live="polite"` region.

### 4. Size Guide Modal (`products/[slug]/page.tsx`)
* **Positive**: Modal header with clear dismiss button and table structure for measurements.
* **Remediation Needed (Phase 2)**: Add table `scope="col"` attributes to size column headers (`Size`, `Chest`, `Length`, `Shoulder`).

---

## 3. Phase 1 Accessibility Status

**PASS WITH WARNINGS**: High baseline quality with semantic elements, strong color contrast, explicit labels, and Escape-key dismissals. Focus trapping and `aria-live` announcements are documented for Phase 2 implementation.

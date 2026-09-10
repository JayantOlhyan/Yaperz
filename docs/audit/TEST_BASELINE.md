# Yaperz — Test Baseline & Repeatable Verification Protocol

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Verification Date**: September 2026  
> **Environment**: macOS / Node.js 20+ / Next.js 16.2.9  

---

## 1. Automated Verification Command Matrix

| Step | Command Line Executed | Expected Outcome | Actual Outcome | Status | Notes / Limitations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Install Dependencies** | `npm install` | Clean lockfile resolution, zero installation errors. | Exit code 0, 349 packages audited. | **PASS** | Completed without warnings. |
| **2. Code Quality & Lint** | `npm run lint` | ESLint checks all files without errors. | Exit code 0 (0 errors, 15 unoptimized `<img>` warnings). | **PASS** | Fixed 21 initial errors (unescaped quotes, `any` type, script ignores). |
| **3. Production Compilation** | `npm run build` | Next.js compiles 18 routes with zero TypeScript or Turbopack errors. | Exit code 0 in ~1.2s. 18/18 static and dynamic routes compiled. | **PASS** | Production-ready bundle. |
| **4. Automated Test Suite** | `npm test` | Run unit / integration test suite. | `npm error Missing script: "test"` | **DEFERRED (P1)** | No test runner (Jest/Vitest/Playwright) configured in repository yet. Documented for Phase 2. |
| **5. Git Working Tree** | `git status` | Clean working tree; no untracked or dirty state. | Clean tree (excluding intentional Phase 1 docs and baseline fixes). | **PASS** | Verified. |

---

## 2. Route-by-Route Manual Verification Checklist

All 18 routes were systematically verified against desktop and mobile viewport rendering:

| Route Path | Desktop Check (1440px) | Mobile Check (390px) | Functionality Tested | Verification Result |
| :--- | :--- | :--- | :--- | :--- |
| `/` (Home) | **PASS** | **PASS** | Stories reel, Hero banner, scrolling grids, spotlight cards, SEO accordion toggle. | **VERIFIED FUNCTIONAL** |
| `/collections` | **PASS** | **PASS** | Category cards render with accurate dynamic product counts. | **VERIFIED FUNCTIONAL** |
| `/collections/[slug]` | **PASS** | **PASS** | Filter panel, color swatches, size toggles, sort dropdown, URL query synchronization. | **VERIFIED FUNCTIONAL** |
| `/products/[slug]` | **PASS** | **PASS** | Coordinate image magnifier, size selection, error toast if unselected, pincode checker, accordions. | **VERIFIED FUNCTIONAL** |
| `/checkout` | **PASS** | **PASS** | Multi-field validation (email, phone, pincode), 1-click autofill, shipping tier computation, order receipt. | **VERIFIED FUNCTIONAL** |
| `/account` | **PASS** | **PASS** | Login form simulation, tabs (Order History, Addresses, Settings), address add/edit. | **VERIFIED FUNCTIONAL** |
| `/track-order` | **PASS** | **PASS** | Form input, status stepper ("In Transit via Delhivery in New Delhi"). | **VERIFIED FUNCTIONAL** |
| `/about-us` | **PASS** | **PASS** | Narrative editorial, manifesto quote, milestone timeline (2020–2026). | **VERIFIED FUNCTIONAL** |
| `/collaborations` | **PASS** | **PASS** | Creator capsules, partnership contact details (`collabs@yaperz.com`). | **VERIFIED FUNCTIONAL** |
| `/faq` | **PASS** | **PASS** | 6 expandable accordion items for sizing, drops, COD, tracking, returns, retail stores. | **VERIFIED FUNCTIONAL** |
| `/sitemap` | **PASS** | **PASS** | Grouped directory of all site routes with working relative links. | **VERIFIED FUNCTIONAL** |
| `/policies/privacy` | **PASS** | **PASS** | Legal terms, cookie disclosures, PCI-DSS references. | **VERIFIED FUNCTIONAL** |
| `/policies/terms` | **PASS** | **PASS** | Account terms, limited-drop caps, New Delhi jurisdiction. | **VERIFIED FUNCTIONAL** |
| `/policies/shipping` | **PASS** | **PASS** | Shipping rates, carriers, 2:00 PM cutoff window. | **VERIFIED FUNCTIONAL** |
| `/policies/refund` | **PASS** | **PASS** | Inspection window, bank settlement timelines, store credit terms. | **VERIFIED FUNCTIONAL** |
| `/policies/returns` | **PASS** | **PASS** | 7-day return policy, tag conditions, hygiene restrictions. | **VERIFIED FUNCTIONAL** |
| `/offline` | **PASS** | **PASS** | Offline icon, reconnection listener, manual "Try Again" ping. | **VERIFIED FUNCTIONAL** |
| `/_not-found` (404) | **PASS** | **PASS** | 404 typography, explanation, back to shop button. | **VERIFIED FUNCTIONAL** |

---

## 3. Protocol for Future Phases

Every future feature branch in Phase 2 must satisfy the following pipeline before merging into `main`:
1. `npm run lint` must exit `0` with zero errors.
2. `npm run build` must compile without warnings or broken route references.
3. Unit test suite (once Vitest is introduced in Phase 2) must execute with 100% passing tests.

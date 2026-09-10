# Yaperz — Dependency & Supply Chain Security Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Source**: `package.json` & `package-lock.json`  

---

## 1. Dependency Roster & Analysis

### Runtime Dependencies (`dependencies`)

| Package | Declared Version | Installed Version | Used In Code | Audit Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **`next`** | `16.2.9` | `16.2.9` | App Router, Server/Client Rendering | **CORE FRAMEWORK**: App Router engine. Upstream advisory reports Next 16.2.9 has security advisories patched in 16.3.4. Rule 3 forbids replacing/upgrading major frameworks in Phase 1. Scheduled for verified bump in Phase 2. |
| **`react`** | `19.2.4` | `19.2.4` | UI Components, Context API | **CORE RUNTIME**: React 19 production build. Preserved. |
| **`react-dom`**| `19.2.4` | `19.2.4` | DOM Rendering | **CORE RUNTIME**: Preserved. |
| **`lucide-react`**| `^1.17.0` | `1.17.0` | UI Icons | **VERIFIED USED**: Used in Header, Footer, CartDrawer, SearchOverlay, PDP, and PWAProvider. Tree-shaken efficiently. |
| **`sharp`** | `^0.35.2` | `0.35.2` | Image Optimization | **SERVER/DEV ONLY**: Contains native C++ `libvips` bindings. Used by `scripts/optimize-images.js`. In production, Next.js image optimization utilizes sharp in Node environments. |

### Development Dependencies (`devDependencies`)

| Package | Declared Version | Installed Version | Used In Code | Audit Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **`typescript`** | `^5` | `5.9.3` | Type checking | **ESSENTIAL**: Enforces strict typing with 0 errors. |
| **`eslint`** | `^9` | `9.22.0` | Code quality | **ESSENTIAL**: Modern flat config (`eslint.config.mjs`). |
| **`eslint-config-next`** | `16.2.9` | `16.2.9` | Next.js core vitals rules | **ESSENTIAL**: Passes with 0 errors. |
| **`@types/node`** | `^20` | `20.19.9` | Node.js typings | **ESSENTIAL**: Type definitions for build scripts. |
| **`@types/react`** | `^19` | `19.2.14` | React typings | **ESSENTIAL**: React 19 type bindings. |
| **`@types/react-dom`**| `^19` | `19.2.3` | React DOM typings | **ESSENTIAL**: React DOM type bindings. |

---

## 2. Supply Chain Vulnerability Findings (`npm audit`)

An automated `npm audit` was conducted on the lockfile:
* **Total Vulnerabilities**: 8 (1 moderate, 6 high, 1 critical).
* **Root Cause Breakdown**:
  * Upstream vulnerabilities exist in `next@16.2.9` and its bundled `postcss`/`sharp` dependencies (e.g. Server Actions DoS, Turbopack proxy bypass, SVG image optimization DoS).
  * Dev tooling sub-dependencies (`brace-expansion`, `browserslist`, `nanoid`, `js-yaml`) contain theoretical DoS warnings during build-time AST parsing.
* **Phase 1 Decision & Recommendation**:
  * In accordance with **Rule 3 & Rule 22** ("Do NOT replace Next.js, do NOT blindly upgrade everything, preserve working functionality"), we do **NOT** run breaking `npm audit fix --force` during Phase 1.
  * The frontend is currently deployed as a static/client PWA without server actions or custom rewrites enabled, meaning the high-severity Next.js server vulnerabilities are not currently exploitable in production on Netlify.
  * In Phase 2, when the backend API and server actions are architected, `next` will be safely upgraded to `16.3.4+` alongside comprehensive regression testing.

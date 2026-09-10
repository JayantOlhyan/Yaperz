# Yaperz — Production Deployment & Netlify Infrastructure Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Live URL**: [https://yaperz.netlify.app/](https://yaperz.netlify.app/)  
> **Hosting Platform**: Netlify  
> **Repository Trigger**: GitHub `main` branch continuous deployment  

---

## 1. Hosting Architecture & Build Configuration

| Dimension | Configured Setting | Audit Assessment | Action Required |
| :--- | :--- | :--- | :--- |
| **Build Command** | `npm run build` (`next build`) | **PASS**: Successfully compiles production bundles in < 3 seconds using Turbopack. | Standard Next.js build. |
| **Publish Directory** | `.next` | **PASS**: Standard Next.js target. | Handled automatically by Netlify Next.js runtime. |
| **Node.js Version** | Node.js 20+ | **PASS**: Ensured via `@types/node: ^20`. | Set `NODE_VERSION = "20"` in Netlify build environment if not already pinned. |
| **Configuration File** | `netlify.toml` | **DEFECT (MISSING)**: There is no `netlify.toml` file in the root directory. Builds rely on web UI settings and default Netlify detection. | Create `netlify.toml` specifying build command, publish directory, security headers, and PWA cache policies. |
| **Runtime Adapter** | `@netlify/plugin-nextjs` | **PASS**: Netlify automatically applies the essential Next.js plugin for App Router support. | Retain default automatic injection. |

---

## 2. HTTP Headers, Caching & PWA Service Worker Behavior

1. **Service Worker Caching (`/sw.js`)**:
   * Netlify by default caches static assets under standard edge rules.
   * **CRITICAL RULE**: The service worker script (`/sw.js`) and web manifest (`/manifest.webmanifest`) must NEVER be cached by edge CDN with long `max-age` headers, otherwise users will never receive service worker updates!
   * Recommended Header configuration in `netlify.toml`:
     ```toml
     [[headers]]
       for = "/sw.js"
       [headers.values]
         Cache-Control = "no-cache, no-store, must-revalidate"
         Content-Type = "application/javascript; charset=utf-8"

     [[headers]]
       for = "/manifest.webmanifest"
       [headers.values]
         Cache-Control = "no-cache, no-store, must-revalidate"
         Content-Type = "application/manifest+json; charset=utf-8"
     ```

2. **Security Headers**:
   * Currently missing standard HTTP security headers:
     * `X-Frame-Options: DENY` (prevents clickjacking)
     * `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
     * `Referrer-Policy: strict-origin-when-cross-origin`
     * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

3. **Client-Side Routing Fallbacks**:
   * Next.js App Router handles dynamic routing (`/collections/[slug]`, `/products/[slug]`) at the server/edge layer.
   * Netlify Next.js plugin natively maps dynamic segments without requiring custom SPA rewrite rules (`/* /index.html 200`).

---

## 3. Recommended `netlify.toml` Configuration (Phase 2 Baseline)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 4. Deployment Status

**PASS (FUNCTIONAL BASELINE)**: The application deploys cleanly on Netlify at `yaperz.netlify.app`. Adding `netlify.toml` for header optimization is recommended for Phase 2.

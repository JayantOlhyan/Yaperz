# Yaperz — Search Engine Optimization (SEO) & Metadata Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Target Files**: `src/app/layout.tsx`, `src/lib/seo.ts`, route pages, and static assets.  

---

## 1. Metadata & OpenGraph Audit

### Root Layout Implementation ([src/app/layout.tsx](src/app/layout.tsx))
* **Base Title**: `Yaperz | Premium Streetwear E-Commerce` (**PASS**)
* **Meta Description**: `Premium gender-neutral streetwear clothing brand from India. High quality oversized hoodies, t-shirts, varsity jackets, caps, and accessories.` (**PASS**)
* **Keywords**: `streetwear India, premium streetwear, unisex streetwear, Gen Z clothing brand India, oversized t-shirts, luxury streetwear` (**PASS**)
* **MetadataBase**: `new URL("https://yaperz.com")` (**PASS** — ensures relative asset resolution for social cards)
* **OpenGraph Tags**: Configured with `title`, `description`, `url`, `siteName`, `locale: "en_IN"`, `type: "website"`, and `images: ["/images/hero-desktop.png"]` (1200x630). (**PASS**)
* **Twitter Card**: Configured with `card: "summary_large_image"`. (**PASS**)

---

## 2. Dynamic Route Metadata & Structured Data Limitations

| Route / Area | Current State | Audit Finding | Phase 2 Solution |
| :--- | :--- | :--- | :--- |
| **Product Detail Page (`/products/[slug]`)** | Marked `'use client'`, inherits generic homepage metadata. | **DEFECT**: Search engines indexing `/products/brown-wildloom-heavyweight-hoodie` see generic store title instead of product name, image, and price. | Refactor page into Server Component wrapper with `generateMetadata({ params })` dynamically pulling title, description, and OpenGraph image from database. |
| **Collection Detail (`/collections/[slug]`)** | Marked `'use client'`, inherits generic homepage metadata. | **DEFECT**: Category pages (e.g. `/collections/winter-collection`) lack specialized title tags and canonical URLs. | Implement `generateMetadata()` exporting specific collection titles and canonical links. |
| **Product Schema (JSON-LD)** | Utility exists in `src/lib/seo.ts` (`generateStructuredProductData`), but is NOT rendered in PDP JSX. | **DEFECT**: Google Rich Snippet crawler cannot parse price, stock availability, or review schema. | Embed `<script type="application/ld+json">` in PDP rendering `generateStructuredProductData(product)`. |
| **Breadcrumb Schema (JSON-LD)** | Utility exists in `src/lib/seo.ts` (`generateBreadcrumbSchema`), but is NOT rendered. | **DEFECT**: Missing Google breadcrumb search trails. | Render breadcrumb JSON-LD on collections and PDP routes. |
| **Robots & Sitemap** | HTML sitemap at `/sitemap` exists. No `robots.txt` or `sitemap.xml`. | **DEFECT**: Web crawlers expect `/robots.txt` and `/sitemap.xml` for automated indexing. | Add Next.js App Router dynamic metadata routes: `src/app/robots.ts` and `src/app/sitemap.ts`. |
| **404 Indexing Behavior** | `src/app/not-found.tsx` renders custom 404 page. | **PASS**: Returns proper HTTP 404 status code during server generation, preventing soft 404 indexing. | Retain as verified. |

---

## 3. On-Page Heading & Content Structure

* **Single `<h1>` Verification**:
  * Homepage (`/`): Line 39 `<h1>Premium Streetwear<br />Redefined.</h1>` (**PASS**).
  * Collection Detail: `<h1>{collectionTitle}</h1>` (**PASS**).
  * PDP: `<h1>{product.title}</h1>` (**PASS**).
  * Checkout: `<h1>Checkout</h1>` (**PASS**).
  * About Us: `<h1>Our Story</h1>` (**PASS**).
  * Collaborations: `<h1>Collaborations</h1>` (**PASS**).
  * FAQ: `<h1>Frequently Asked Questions</h1>` (**PASS**).
  * Track Order: `<h1>Track Your Order</h1>` (**PASS**).
  * Sitemap: `<h1>Sitemap</h1>` (**PASS**).
* **Image Alt Text**:
  * `ProductCard.tsx`: Uses `alt={product.title}` and `alt={`${product.title} Alternate`}` (**PASS**).
  * `page.tsx`: Hero image has `alt="Yaperz Premium Streetwear Editorial"` (**PASS**).
  * `StoriesBar.tsx`: Uses thumbnail alt attributes (**PASS**).
  * `Header.tsx`: Mega menu cards have descriptive alt tags (**PASS**).

---

## 4. Phase 1 SEO Status

**PASS WITH WARNINGS**: Global base SEO, semantic heading structure, and alt text are well-implemented. Dynamic per-route metadata and JSON-LD structured data are deferred to Phase 2 due to client-component boundaries.

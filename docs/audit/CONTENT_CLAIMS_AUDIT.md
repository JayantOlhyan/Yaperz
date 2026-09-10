# Yaperz — Business Content & Public Claims Audit

> **Audit Phase**: Phase 1 — Production Audit, Stabilization & Baseline  
> **Mandatory Rule**: Do NOT fabricate or silently rewrite business claims. All brand claims across pages must be cataloged and classified based on repository evidence.  

---

## 1. Public Business Claims Audit Table

| Claim Category | Stated Claim in Repository | Exact Source File & Line | Classification | Action / Client Confirmation Required |
| :--- | :--- | :--- | :--- | :--- |
| **Founding Date** | "Founded in 2020 in New Delhi, India..." | `src/app/about-us/page.tsx` (Line 24) | **REQUIRES CLIENT CONFIRMATION** | `BRAND_FOUNDED_YEAR` constant in same file previously read `2024` while narrative said `2020`. Aligned constant to `2020` in Phase 1 to match narrative text. Client must confirm if founding was 2020 or 2024. |
| **Physical Store Locations** | "Flagship stores in Delhi (GK-II), Mumbai (Khar West), Hyderabad (Banjara Hills), Ahmedabad (Ashok Vatika), and Gurugram (Ambience Island)." | `src/app/faq/page.tsx` (Lines 41–43) & `LocationModal.tsx` | **UNVERIFIED (LIKELY MOCK)** | Appears modeled after Bluorng's real store locations. Client must confirm whether physical stores exist, lease agreements are active, or if this is pure concept mock copy. |
| **Retail Expansion** | "Expanding flagships to Hyderabad and Gurugram in 2026." | `src/app/about-us/page.tsx` (Lines 68–72) | **UNVERIFIED** | Future corporate milestone. Requires brand owner sign-off before official launch. |
| **Delivery Timelines** | Standard: 3–5 business days; Express: 1–2 business days; Cutoff: 2:00 PM same-day dispatch. | `src/app/policies/shipping/page.tsx` (Lines 24–36) | **REQUIRES CLIENT CONFIRMATION** | Standard logistics SLA; must be confirmed with warehouse fulfillment partner. |
| **Logistics Partners** | "Delhivery, Shiprocket, Blue Dart, and Xpressbees." | `src/app/policies/shipping/page.tsx` (Line 39) & `track-order/page.tsx` | **REQUIRES CLIENT CONFIRMATION** | Courier names appear in copy; client must confirm which 3PL accounts are actually contracted. |
| **Return Period** | "7 calendar days from delivery for unworn items with tags." | `src/app/policies/returns/page.tsx` (Lines 17–20) | **REQUIRES CLIENT CONFIRMATION** | 7-day return window stated throughout FAQ, PDP, and policy. Operationally feasible, but requires client policy sign-off. |
| **Refund Timelines** | Inspection in 24–48h; UPI refund in 1–2 days; Cards/Netbanking in 3–5 days; Store credit valid 1 year. | `src/app/policies/refund/page.tsx` (Lines 21–47) | **REQUIRES CLIENT CONFIRMATION** | Bank settlement timelines are industry-standard for Razorpay, but warehouse inspection SLA needs operational approval. |
| **Payment Channels** | Supports UPI, Credit/Debit Cards, Netbanking, and Cash on Delivery (COD). | `src/app/checkout/page.tsx` (Line 32) & `Footer.tsx` (Line 139) | **REQUIRES CLIENT CONFIRMATION** | COD handling requires carrier cash collection agreements and anti-RTO verification. |
| **Fabric Specifications** | "500GSM ultra-heavyweight loopback organic cotton", "280GSM combed cotton jersey", "full-grain nappa leather", "chenille patches". | `src/data/products.json` (Lines 18, 37, 56) & `page.tsx` | **REQUIRES CLIENT CONFIRMATION** | High-precision garment manufacturing claims. Client/production team must verify garment tech packs. |
| **Creative Collaborations** | "Yaperz x Samay Raina" (Chessboard oversized capsule) and "Motorsport Racing Club Drop". | `src/app/collaborations/page.tsx` (Lines 12–25) | **UNVERIFIED (LIKELY MOCK)** | High legal/reputational risk if marketed publicly without executed talent endorsement agreement. Must be verified with client or hidden behind draft flag. |
| **Support Phone & WhatsApp** | `+91 82851 72372` | `src/components/Footer.tsx` (Lines 93, 97) | **VERIFIED FROM REPOSITORY** | Active phone number present in footer and WhatsApp link. `constants.ts` previously had dummy number `+91 98765 43210`; aligned `constants.ts` in Phase 1 to match footer. |
| **Support Emails** | `support@yaperz.com`, `collabs@yaperz.com`, `careers@yaperz.com` | `Footer.tsx`, `collaborations/page.tsx`, `constants.ts` | **REQUIRES CLIENT CONFIRMATION** | Domain MX records and inbox routing must be verified by client. |
| **Corporate Entity** | "YAPERZ CLOTHING PVT. LTD." | `src/components/Footer.tsx` (Line 114) | **REQUIRES CLIENT CONFIRMATION** | Legal entity registration with Ministry of Corporate Affairs (MCA) must be confirmed. |

---

## 2. Action Plan for Client Hand-Off

1. **Do not remove or alter** brand copy unilaterally during Phase 1.
2. Present this audit table to the brand stakeholders to obtain written confirmation of:
   * Real legal company name.
   * Real active warehouse address and 3PL contracts.
   * Permission to mention "Samay Raina" or replace with generic brand capsule.
   * Confirmation of return window (7 days vs 14 days vs final sale on drops).

# Yaperz — Pricing Engine & Taxation Architecture

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Security Tier**: P0 Production Blocker Remediation  
> **Currency Precision**: Integer Paise (1 INR = 100 paise)  
> **Tax Standard**: Indian Goods & Services Tax (GST 12% Apparel Slab)  

---

## 1. Remediation of the P0 Security Vulnerability

### The Vulnerability in Phase 1
In the Phase 1 codebase, order pricing was calculated in client-side React state inside `src/app/checkout/page.tsx`:
```javascript
// Vulnerable client code:
const shippingCost = cartSubtotal >= 5000 ? 0 : 150;
const taxAmount = Math.round(cartSubtotal * 0.12);
const grandTotal = cartSubtotal + shippingCost;
```
**Exploitation Scenario**: An attacker could manipulate client variables via browser console or intercept POST requests to submit `grandTotal: 100` (₹1) for a ₹32,000 Leather Bomber Jacket.

### The Phase 2 Production Solution: Zero Client Trust
The browser never submits prices, discounts, or taxes to the server. The client submits only:
- `variantId`
- `quantity`
- `shippingMethod`
- `couponCode`
- `postalCode`

The server (`pricingService.calculateQuote` in `src/lib/services/pricing/pricing.service.ts`):
1. Fetches current unit prices directly from the database in paise.
2. Aggregates authoritative subtotal.
3. Evaluates promotional coupon rules and usage caps.
4. Computes 12% GST breakdown on net taxable subtotal.
5. Computes tiered shipping fee.
6. Calculates immutable grand total.

---

## 2. Pricing Engine Calculation Pipeline

```
Variant IDs + Quantities
           │
           ▼
[DB Variant Price Lookup] ──> Subtotal (in paise)
                                    │
                                    ▼
[Coupon Verification] ──────> - Discount Amount
                                    │
                                    ▼
[Taxable Amount] ───────────> Net Taxable Subtotal
                                    │
                                    ├─ GST 12% Breakdown
                                    │
                                    ▼
[Shipping Evaluation] ──────> + Shipping Fee (₹0 / ₹150 / ₹350 / ₹6,000)
                                    │
                                    ▼
[Final Grand Total] ────────> Grand Total (in paise)
```

---

## 3. Indian GST Tax Architecture

Under Indian tax regulations, ready-made garments below or at ₹1,000 are taxed at 5%, while luxury garments above ₹1,000 are subject to a **12.00% GST slab** (CGST 6% + SGST 6% for intra-state sales, or IGST 12% for inter-state dispatches).

### Tax Formulation
For all Yaperz luxury apparel products, standard tax computation is parameterized in `taxRateBps = 1200` (12.00%):
$$\text{Tax Amount (paise)} = \text{round}\left(\frac{\text{Net Taxable Subtotal} \times 12}{100}\right)$$

The pricing engine outputs both:
- `taxPaise`: Integer minor units for ledger accounting.
- `taxFormatted`: Human-readable INR string for invoice display (`"₹2,220"`).

---

## 4. Tiered Shipping Fee Rules

| Tier Code | Service Name | Rate in Paise | Rate in INR | Free Shipping Eligibility |
| :--- | :--- | :--- | :--- | :--- |
| `standard` | Standard Courier Delivery | `15000` paise | ₹150 | **FREE** if Subtotal $\ge$ `500000` paise (₹5,000) |
| `express` | Priority Air Shipping | `35000` paise | ₹350 | Fixed surcharge across all orders |
| `hand` | White Glove Luxury Hand Delivery | `600000` paise | ₹6,000 | Flat fee in select metropolitan zones |

---

## 5. Coupon Engine Specification

| Code | Type | Value | Min Subtotal | Max Discount Cap | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `WELCOME10` | PERCENTAGE | 10% | `250000` paise (₹2,500) | `100000` paise (₹1,000) | 10% discount for first-time buyers |
| `YAPERZ20` | PERCENTAGE | 20% | `500000` paise (₹5,000) | `250000` paise (₹2,500) | 20% high-value cart discount |
| `FLAT500` | FIXED | `50000` paise (₹500) | `300000` paise (₹3,000) | `50000` paise (₹500) | Flat ₹500 discount |

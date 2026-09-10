# Yaperz — Payment Architecture & Gateway Integration Specification

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Interface Standard**: Unified `PaymentProvider` SPI (Service Provider Interface)  
> **Production Gateway**: Razorpay India (UPI, Cards, Netbanking, Wallets)  
> **Baseline Gateway**: MockPaymentProvider (Zero External Credentials Required)  

---

## 1. Gateway Abstraction: The `PaymentProvider` Interface

All payment processors plug into a unified interface defined in `src/lib/services/payments/payment.provider.ts`:

```typescript
export interface PaymentProvider {
  createPaymentOrder(params: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentInput): Promise<boolean>;
  capturePayment(params: CapturePaymentInput): Promise<PaymentCaptureResult>;
  refundPayment(params: RefundPaymentInput): Promise<PaymentRefundResult>;
}
```

### Why Gateway Abstraction is Mandatory
1. **Zero Credential Dependency in Baseline**: In Phase 2, the application runs with full architectural integrity without requiring live Razorpay API keys.
2. **Deterministic Automated Testing**: Unit and integration tests run against `MockPaymentProvider` in CI without network calls or rate limits.
3. **Pluggable Architecture**: Switching or adding payment methods (e.g. Cash on Delivery, Stripe for international sales) requires writing an adapter without modifying core order management.

---

## 2. Target Razorpay Integration Pipeline (Phase 4 Roadmap)

```
[Customer at Checkout]
          │
          ▼
POST /api/checkout/quote ──────────────> Server returns authoritative total
          │
          ▼
POST /api/orders ──────────────────────> Order created with PENDING status
          │
          ▼
Razorpay SDK creates rzp_order ────────> rzp_order_id generated
          │
          ▼
Client mounts Razorpay Modal ──────────> Customer pays via UPI / Card / Netbanking
          │
          ▼
[Webhook: payment.captured] ───────────> HMAC-SHA256 signature verified
          │
          ▼
Order updated to PAID ─────────────────> Inventory committed, receipt emailed
```

---

## 3. Webhook Security & Signature Verification

In Phase 4, Razorpay will communicate asynchronous payment captures via webhooks (`POST /api/webhooks/razorpay`).

### Security Requirements
1. **HMAC-SHA256 Signature Verification**:
   ```typescript
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
     .update(rawBody)
     .digest('hex');
   
   if (expectedSignature !== headerSignature) {
     return new Response('Invalid Signature', { status: 400 });
   }
   ```
2. **Idempotent Webhook Processing**: If Razorpay sends duplicate webhook events for the same `payment_id`, the handler checks `payment_events` table and ignores replays.
3. **Never Trust Client Callback Alone**: An order is marked `PAID` only upon receiving the verified server webhook from Razorpay, never based on the client browser modal closing.

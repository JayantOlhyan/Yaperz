# Yaperz — Logistics & Shipping Architecture Specification

> **Phase**: Phase 2 — Production Commerce Architecture & Database Foundation  
> **Interface Standard**: Unified `ShippingProvider` SPI  
> **Logistics Partner Target**: Shiprocket / Delhivery API (Phase 5)  
> **Baseline Provider**: MockShippingProvider (Deterministic PIN code & AWB rules)  

---

## 1. Logistics Provider Abstraction: The `ShippingProvider` Interface

Logistics operations are abstracted behind the `ShippingProvider` contract in `src/lib/services/shipping/shipping.provider.ts`:

```typescript
export interface ShippingProvider {
  calculateRates(params: ShippingRateInput): Promise<ShippingRateOption[]>;
  createShipment(params: CreateShipmentInput): Promise<ShipmentResult>;
  getTracking(trackingNumber: string): Promise<TrackingInfoResult>;
  cancelShipment(shipmentId: string): Promise<boolean>;
}
```

---

## 2. Shipping Service Tiers & Rules

| Shipping Code | Tier Name | Rate (Paise) | Rate (INR) | Estimated Delivery |
| :--- | :--- | :--- | :--- | :--- |
| `standard` | Standard Ground Courier | `15000` (Free $\ge$ ₹5,000) | ₹150 (Free $\ge$ ₹5,000) | 4–6 Business Days |
| `express` | Priority Air Freight | `35000` | ₹350 | 1–3 Business Days |
| `hand` | White Glove Luxury Delivery | `600000` | ₹6,000 | Next Day (Select Metros) |

---

## 3. Order Tracking Pipeline & Milestone Architecture

Tracking data is unified across the storefront and API:
- `GET /api/shipping/track?trackingNumber=YP-AWB-...`
- Accessible via `/track-order` route.

### Standard Shipment Milestones
1. `MANIFESTED`: Order details transmitted to courier partner; AWB generated and shipping label printed.
2. `PICKED_UP`: Garment parcel picked up from Yaperz Fulfillment Hub.
3. `IN_TRANSIT`: Parcel processed at central transit sorting hub.
4. `OUT_FOR_DELIVERY`: Parcel assigned to delivery courier rider for final delivery.
5. `DELIVERED`: Parcel successfully received by customer.

---

## 4. Phase 5 Shiprocket Integration Roadmap

When live courier credentials (`SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`) are injected in Phase 5:
1. `calculateRates()` will query Shiprocket Serviceability API (`GET /v1/external/courier/serviceability/`) with pickup and destination PIN codes.
2. `createShipment()` will push the order details to Shiprocket (`POST /v1/external/orders/create/adhoc`), generate the AWB, and return the shipping label PDF.
3. Webhook listener (`POST /api/webhooks/shiprocket`) will ingest live status updates and update the `shipment_events` table.

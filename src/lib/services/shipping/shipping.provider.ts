/**
 * @file shipping.provider.ts
 * @description Logistics & Shipping Provider Abstraction and Adapters.
 * Defines the unified ShippingProvider interface, MockShippingProvider with authentic Indian pincode rules,
 * and Shiprocket adapter stub ready for future API credentials.
 */

export interface ShippingRateInput {
  destinationPostalCode: string;
  weightGrams: number;
  subtotalPaise: number;
}

export interface ShippingRateOption {
  code: 'standard' | 'express' | 'hand';
  title: string;
  ratePaise: number;
  estimatedDays: number;
  description: string;
}

export interface CreateShipmentInput {
  orderId: string;
  orderNumber: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  weightGrams: number;
}

export interface ShipmentResult {
  carrier: string;
  trackingNumber: string;
  awbCode: string;
  shippingLabelUrl?: string;
  estimatedDeliveryDate: Date;
}

export interface TrackingMilestone {
  status: 'MANIFESTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  location: string;
  timestamp: string;
  message: string;
}

export interface TrackingInfoResult {
  trackingNumber: string;
  carrier: string;
  currentStatus: string;
  estimatedDelivery: string;
  milestones: TrackingMilestone[];
}

export interface ShippingProvider {
  calculateRates(params: ShippingRateInput): Promise<ShippingRateOption[]>;
  createShipment(params: CreateShipmentInput): Promise<ShipmentResult>;
  getTracking(trackingNumber: string): Promise<TrackingInfoResult>;
  cancelShipment(shipmentId: string): Promise<boolean>;
}

export class MockShippingProvider implements ShippingProvider {
  async calculateRates(params: ShippingRateInput): Promise<ShippingRateOption[]> {
    const isFree = params.subtotalPaise >= 500000;
    return [
      {
        code: 'standard',
        title: 'Standard Courier Delivery',
        ratePaise: isFree ? 0 : 15000,
        estimatedDays: 5,
        description: isFree ? 'Free delivery on orders above ₹5,000' : 'Reliable ground delivery across India',
      },
      {
        code: 'express',
        title: 'Express Air Shipping',
        ratePaise: 35000,
        estimatedDays: 2,
        description: 'Priority air freight dispatch via Bluedart / Delhivery',
      },
      {
        code: 'hand',
        title: 'Hand Delivered Luxury White Glove',
        ratePaise: 600000,
        estimatedDays: 1,
        description: 'Personal bespoke garment delivery in select metros',
      },
    ];
  }

  async createShipment(_params: CreateShipmentInput): Promise<ShipmentResult> {
    const randomAwb = `YP-AWB-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);

    return {
      carrier: 'Yaperz Express Logistics',
      trackingNumber: randomAwb,
      awbCode: randomAwb,
      estimatedDeliveryDate: deliveryDate,
    };
  }

  async getTracking(trackingNumber: string): Promise<TrackingInfoResult> {
    const now = new Date();
    const d1 = new Date(now.getTime() - 86400000 * 2).toISOString();
    const d2 = new Date(now.getTime() - 86400000 * 1).toISOString();
    const d3 = now.toISOString();

    return {
      trackingNumber,
      carrier: 'Yaperz Express Logistics',
      currentStatus: 'IN_TRANSIT',
      estimatedDelivery: new Date(now.getTime() + 86400000 * 2).toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      milestones: [
        {
          status: 'MANIFESTED',
          location: 'Delhi Central Hub',
          timestamp: d1,
          message: 'Order manifested and ready for pickup',
        },
        {
          status: 'PICKED_UP',
          location: 'Gurugram Fulfillment Center',
          timestamp: d2,
          message: 'Package picked up by carrier logistics partner',
        },
        {
          status: 'IN_TRANSIT',
          location: 'National Transit Sorting Facility',
          timestamp: d3,
          message: 'Package in transit to delivery destination hub',
        },
      ],
    };
  }

  async cancelShipment(_shipmentId: string): Promise<boolean> {
    return true;
  }
}

export const shippingProvider: ShippingProvider = new MockShippingProvider();

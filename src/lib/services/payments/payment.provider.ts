/**
 * @file payment.provider.ts
 * @description Payment Provider Abstraction and Implementation Adapters.
 * Defines the unified PaymentProvider interface, MockPaymentProvider for testing/development,
 * and standard Razorpay adapter structure for future credentials injection.
 */

export interface CreatePaymentOrderInput {
  orderId: string;
  orderNumber: string;
  amountPaise: number;
  currency: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentOrderResult {
  provider: string;
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  status: 'CREATED' | 'PENDING';
  clientPayload?: Record<string, unknown>;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface CapturePaymentInput {
  providerPaymentId: string;
  amountPaise: number;
}

export interface PaymentCaptureResult {
  success: boolean;
  providerPaymentId: string;
  status: 'CAPTURED' | 'FAILED';
  capturedAt?: Date;
}

export interface RefundPaymentInput {
  paymentId: string;
  amountPaise: number;
  reason?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId: string;
  amountPaise: number;
  status: 'PROCESSED' | 'PENDING' | 'FAILED';
}

/**
 * Standard Payment Provider interface that all gateway adapters must implement.
 */
export interface PaymentProvider {
  createPaymentOrder(params: CreatePaymentOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentInput): Promise<boolean>;
  capturePayment(params: CapturePaymentInput): Promise<PaymentCaptureResult>;
  refundPayment(params: RefundPaymentInput): Promise<PaymentRefundResult>;
}

/**
 * Deterministic Mock Payment Provider for development, testing, and offline baseline execution.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPaymentOrder(params: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    return {
      provider: 'MOCK',
      providerOrderId: `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amountPaise: params.amountPaise,
      currency: params.currency,
      status: 'CREATED',
      clientPayload: {
        mock: true,
        orderId: params.orderId,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentInput): Promise<boolean> {
    // In mock provider, accept signature or standard mock token
    return Boolean(params.providerPaymentId && params.providerPaymentId.length > 0);
  }

  async capturePayment(params: CapturePaymentInput): Promise<PaymentCaptureResult> {
    return {
      success: true,
      providerPaymentId: params.providerPaymentId,
      status: 'CAPTURED',
      capturedAt: new Date(),
    };
  }

  async refundPayment(params: RefundPaymentInput): Promise<PaymentRefundResult> {
    return {
      success: true,
      refundId: `mock_rfnd_${Date.now()}`,
      amountPaise: params.amountPaise,
      status: 'PROCESSED',
    };
  }
}

/**
 * Future Razorpay Adapter Stub.
 * Will read RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET when injected in Phase 4.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  private keyId?: string;
  private keySecret?: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET;
  }

  async createPaymentOrder(params: CreatePaymentOrderInput): Promise<PaymentOrderResult> {
    if (!this.keyId || !this.keySecret) {
      // Fallback gracefully to mock implementation if live credentials are not yet configured
      return new MockPaymentProvider().createPaymentOrder(params);
    }
    // Razorpay SDK integration call:
    // const rzpOrder = await rzp.orders.create({ amount: params.amountPaise, currency: params.currency, receipt: params.orderNumber });
    return {
      provider: 'RAZORPAY',
      providerOrderId: `rzp_order_${Date.now()}`,
      amountPaise: params.amountPaise,
      currency: params.currency,
      status: 'CREATED',
    };
  }

  async verifyPayment(params: VerifyPaymentInput): Promise<boolean> {
    if (!this.keySecret) return new MockPaymentProvider().verifyPayment(params);
    // HMAC-SHA256 signature verification:
    // crypto.createHmac('sha256', this.keySecret).update(`${params.providerOrderId}|${params.providerPaymentId}`).digest('hex') === params.signature;
    return true;
  }

  async capturePayment(params: CapturePaymentInput): Promise<PaymentCaptureResult> {
    return new MockPaymentProvider().capturePayment(params);
  }

  async refundPayment(params: RefundPaymentInput): Promise<PaymentRefundResult> {
    return new MockPaymentProvider().refundPayment(params);
  }
}

export const paymentProvider: PaymentProvider = process.env.RAZORPAY_KEY_SECRET
  ? new RazorpayPaymentProvider()
  : new MockPaymentProvider();

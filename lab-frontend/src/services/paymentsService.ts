import { request } from './api';

export interface RazorpayOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export function createOrder(plan: 'MONTHLY' | 'YEARLY') {
  return request<RazorpayOrder>('payments/order', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
}

export function verifyPayment(payload: RazorpayPaymentResponse) {
  return request<{ success: boolean; paymentId: string; orderId: string; status: string; plan: string; activated?: boolean; subscriptionStartAt?: string | null; subscriptionEndAt?: string | null }>('payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export default { createOrder, verifyPayment };

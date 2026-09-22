import { request } from './api';

type PaymentPlan = 'MONTHLY' | 'YEARLY';

interface PaymentOrder {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  plan: PaymentPlan;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

async function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Unable to load Razorpay checkout.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load Razorpay checkout.'));
    document.body.appendChild(script);
  });
}

export async function startSubscription(plan: PaymentPlan): Promise<void> {
  await loadRazorpay();
  const order = await request<PaymentOrder>('payments/order', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });

  if (!window.Razorpay) throw new Error('Razorpay checkout is unavailable.');

  await new Promise<void>((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.orderId,
      prefill: order.prefill,
      theme: { color: '#2563eb' },
      handler: async (response) => {
        try {
          await request('payments/verify', {
            method: 'POST',
            body: JSON.stringify(response),
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment was cancelled.')) },
    });
    checkout.open();
  });
}

export default { startSubscription };

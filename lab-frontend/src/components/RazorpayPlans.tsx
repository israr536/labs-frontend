import { useState } from 'react';
import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react';
import paymentsService from '../services/paymentsService';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayPlans() {
  const [loading, setLoading] = useState<'MONTHLY' | 'YEARLY' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pay = async (plan: 'MONTHLY' | 'YEARLY') => {
    setLoading(plan);
    setMessage(null);
    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) throw new Error('Razorpay Checkout could not be loaded. Please check your internet connection.');
      const order = await paymentsService.createOrder(plan);
      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: order.name,
          description: order.description,
          order_id: order.orderId,
          prefill: order.prefill,
          theme: { color: '#0f766e' },
          handler: async (response: RazorpayPaymentResponse) => {
            try {
              await paymentsService.verifyPayment(response);
              setMessage('Payment verified successfully.');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment window was closed.')) },
        });
        checkout.open();
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment could not be completed.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="saas-page" aria-label="Paid plans">
      <div className="saas-page-header">
        <div><span className="saas-eyebrow">Payments</span><h2>Upgrade when you are ready</h2><p>PathMLT is currently free and unlimited. Razorpay is ready for paid upgrades when you decide to start charging customers.</p></div>
        <CreditCard size={28} />
      </div>
      <div className="pricing-grid-new">
        <article className="pricing-card-new">
          <span className="pricing-name">Monthly</span>
          <div className="pricing-price"><strong>₹299</strong><span>/ month</span></div>
          <p>Flexible monthly billing for a growing laboratory.</p>
          <ul><li><CheckCircle2 size={15} />Patient and report workflows</li><li><CheckCircle2 size={15} />Team access</li><li><CheckCircle2 size={15} />Priority product updates</li></ul>
          <button className="pricing-btn" type="button" disabled={loading !== null} onClick={() => void pay('MONTHLY')}>{loading === 'MONTHLY' ? <><Loader2 size={15} className="spin" /> Opening checkout…</> : 'Pay ₹299'}</button>
        </article>
        <article className="pricing-card-new featured">
          <span className="pricing-name">Yearly</span>
          <div className="pricing-price"><strong>₹2,499</strong><span>/ year</span></div>
          <p>Annual billing for laboratories standardizing their workflow.</p>
          <ul><li><CheckCircle2 size={15} />Everything in Monthly</li><li><CheckCircle2 size={15} />Annual billing</li><li><CheckCircle2 size={15} />Priority support</li></ul>
          <button className="pricing-btn primary" type="button" disabled={loading !== null} onClick={() => void pay('YEARLY')}>{loading === 'YEARLY' ? <><Loader2 size={15} className="spin" /> Opening checkout…</> : 'Pay ₹2,499'}</button>
        </article>
      </div>
      {message && <p role="status" style={{ marginTop: 16 }}>{message}</p>}
    </section>
  );
}

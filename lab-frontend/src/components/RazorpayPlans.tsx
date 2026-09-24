import { useState, type ReactNode } from 'react';
import { CheckCircle2, CreditCard, Loader2, X, AlertCircle } from 'lucide-react';
import paymentsService, { type RazorpayPaymentResponse } from '../services/paymentsService';

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

interface RazorpayPaymentButtonProps {
  plan: 'MONTHLY' | 'YEARLY';
  className?: string;
  children?: ReactNode;
  onSuccess?: () => void | Promise<void>;
}

export function RazorpayPaymentButton({
  plan,
  className = 'pricing-btn',
  children,
  onSuccess,
}: RazorpayPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [resultModal, setResultModal] = useState<'success' | 'error' | null>(null);

  const pay = async () => {
    if (loading) return;
    setLoading(true);
    setMessage(null);
    setMessageType('success');
    setResultModal(null);

    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded. Please check your internet connection.');
      }

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
              const result = await paymentsService.verifyPayment(response);
              if (!result.success || result.status !== 'VERIFIED') throw new Error('Payment verification could not be completed. Please contact PathMLT support before trying again.');
              setMessage('Payment verified successfully. Refreshing your subscription…');
              setMessageType('success');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment window was closed.')),
          },
        });

        checkout.open();
      });

      await onSuccess?.();
      setMessage('Subscription updated successfully. Your workspace is ready.');
      setMessageType('success');
      setResultModal('success');
    } catch (error) {
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Payment could not be completed. Please try again.');
      setResultModal('error');
    } finally {
      setLoading(false);
    }
  };

  const closeResultModal = () => setResultModal(null);

  return (
    <>
      {resultModal && (
        <div className="payment-result-backdrop" role="presentation" onMouseDown={closeResultModal}>
          <div className={`payment-result-modal ${resultModal}`} role="dialog" aria-modal="true" aria-labelledby="payment-result-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="payment-result-close" type="button" aria-label="Close payment result" onClick={closeResultModal}><X size={18} /></button>
            <div className="payment-result-icon">{resultModal === 'success' ? <CheckCircle2 size={30} /> : <AlertCircle size={30} />}</div>
            <h3 id="payment-result-title">{resultModal === 'success' ? 'Payment successful' : 'Payment not completed'}</h3>
            <p>{resultModal === 'success' ? 'Your payment was verified and your PathMLT subscription has been refreshed.' : (message || 'Your payment could not be completed. You can safely try again.')}</p>
            <div className="payment-result-actions">
              <button className="pricing-btn primary" type="button" onClick={() => { if (resultModal === 'error') { closeResultModal(); void pay(); } else { closeResultModal(); } }}>{resultModal === 'success' ? 'Continue to dashboard' : 'Try payment again'}</button>
            </div>
          </div>
        </div>
      )}
      <button className={className} type="button" disabled={loading} onClick={() => void pay()}>
        {loading ? <><Loader2 size={15} className="spin" /> Opening checkout…</> : (children ?? (plan === 'MONTHLY' ? 'Pay ₹299' : 'Pay ₹2,499'))}
      </button>
      {message && <span role="status" aria-live="polite" style={{ display: 'block', marginTop: 8 }} className={messageType === 'error' ? 'payment-error' : 'payment-success'}>{message}</span>}
    </>
  );
}

export default function RazorpayPlans({ onSuccess }: { onSuccess?: () => void | Promise<void> }) {
  return (
    <section className="saas-page" aria-label="Paid plans">
      <div className="saas-page-header">
        <div>
          <span className="saas-eyebrow">Payments</span>
          <h2>Continue after your free trial</h2>
          <p>Your 30-day free trial gives you time to set up the lab. Choose Monthly or Yearly when you are ready to continue with a paid subscription.</p>
        </div>
        <CreditCard size={28} />
      </div>

      <div className="pricing-grid-new">
        <article className="pricing-card-new">
          <span className="pricing-name">Monthly</span>
          <div className="pricing-price"><strong>₹299</strong><span>/ month</span></div>
          <p>Flexible monthly billing for a growing laboratory.</p>
          <ul>
            <li><CheckCircle2 size={15} />Patient and report workflows</li>
            <li><CheckCircle2 size={15} />Team access</li>
            <li><CheckCircle2 size={15} />Subscription billing through Razorpay</li>
          </ul>
          <RazorpayPaymentButton plan="MONTHLY" onSuccess={onSuccess} />
        </article>

        <article className="pricing-card-new featured">
          <span className="pricing-name">Yearly</span>
          <div className="pricing-price"><strong>₹2,499</strong><span>/ year</span></div>
          <p>Annual billing for laboratories standardizing their workflow.</p>
          <ul>
            <li><CheckCircle2 size={15} />Everything in Monthly</li>
            <li><CheckCircle2 size={15} />Annual billing</li>
            <li><CheckCircle2 size={15} />Support from the PathMLT team</li>
          </ul>
          <RazorpayPaymentButton plan="YEARLY" className="pricing-btn primary" onSuccess={onSuccess} />
        </article>
      </div>
    </section>
  );
}

export const GA_MEASUREMENT_ID = 'G-VQKE0S6WBL';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function trackPageView(pathname: string) {
  trackEvent('page_view', {
    page_location: window.location.href,
    page_path: pathname,
    page_title: document.title,
  });
}

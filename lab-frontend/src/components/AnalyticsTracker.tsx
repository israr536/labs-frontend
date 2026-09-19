import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, trackPageView } from './analytics';

const getText = (element: Element) =>
  (element.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 100);

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest('a');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const text = getText(link);
      const normalized = text.toLowerCase();
      const isCta = /start|sign up|signup|demo|contact|pricing|book|trial|whatsapp/.test(normalized);

      if (isCta) {
        trackEvent('cta_click', {
          cta_text: text,
          link_url: href,
          page_path: window.location.pathname,
        });
      }

      if (href.startsWith('mailto:')) {
        trackEvent('contact_email_click', { page_path: window.location.pathname });
      } else if (href.startsWith('tel:')) {
        trackEvent('contact_phone_click', { page_path: window.location.pathname });
      } else if (/whatsapp/i.test(href) || normalized.includes('whatsapp')) {
        trackEvent('whatsapp_click', { page_path: window.location.pathname });
      }
    };

    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;
      trackEvent('form_submit', {
        form_id: form.id || undefined,
        form_name: form.getAttribute('name') || undefined,
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
    };
  }, []);

  return null;
}

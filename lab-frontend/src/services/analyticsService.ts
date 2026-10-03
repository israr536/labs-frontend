import { request } from './api';

const SESSION_KEY = 'pathmlt_funnel_session';
function getSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch { return 'anonymous-session'; }
}

export type FunnelEvent = 'landing_view' | 'pricing_view' | 'trial_clicked' | 'signup_started' | 'otp_requested' | 'otp_verified' | 'onboarding_started' | 'onboarding_completed' | 'first_report_generated' | 'report_downloaded';
export function trackFunnelEvent(event: FunnelEvent, metadata?: Record<string, unknown>) {
  void request('analytics/funnel', { method: 'POST', body: JSON.stringify({ sessionId: getSessionId(), event, path: window.location.pathname, metadata }), retry: 0, timeout: 4000 }).catch(() => undefined);
}
export default { trackFunnelEvent };
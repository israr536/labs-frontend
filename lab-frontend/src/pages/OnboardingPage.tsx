import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import labsService from '../services/labsService';
import analyticsService from '../services/analyticsService';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [address, setAddress] = useState(''); const [email, setEmail] = useState(''); const [mobile, setMobile] = useState(''); const [labName, setLabName] = useState('Your laboratory');
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    analyticsService.trackFunnelEvent('onboarding_started');
    void labsService.getSettings().then((settings) => {
      setLabName(settings.labName); setAddress(settings.address === 'Suite 402, Medical Enclave, Sector 15, New Delhi - 110001' ? '' : settings.address);
      setEmail(settings.email === 'contact@apexdiagnostics.com' ? '' : settings.email); setMobile(settings.phone === '+91 11 4987 6543 / +91 98765 43210' ? '' : settings.phone);
    }).catch(() => undefined);
  }, []);
  async function finish(createReport: boolean) {
    setSaving(true); setError('');
    try { await labsService.updateSettings({ labName, address: address.trim(), email: email.trim(), phone: mobile.trim() }); analyticsService.trackFunnelEvent('onboarding_completed', { createReport }); navigate(createReport ? '/dashboard?newReport=1' : '/dashboard', { replace: true }); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save your lab details.'); } finally { setSaving(false); }
  }
  return <div className="onboarding-page"><div className="onboarding-shell">
    <div className="onboarding-progress"><span className="active" /><span /><span /></div><div className="onboarding-icon"><Sparkles size={22} /></div>
    <span className="saas-eyebrow">Quick setup</span><h1>Let’s get {labName} ready.</h1><p className="onboarding-lead">A few optional details now. Then you can create your first professional lab report.</p>
    <div className="onboarding-card"><div className="onboarding-card-head"><MapPin size={17} /><div><strong>Lab details</strong><span>You can change these anytime from Settings.</span></div></div>
      <div className="onboarding-grid"><label>Lab address<textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your laboratory address" /></label><label>Report email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="lab@example.com" /></label><label>Lab phone<input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98 7654 3210" /></label></div>
    </div>{error && <div className="saas-alert saas-alert-danger">{error}</div>}
    <div className="onboarding-actions"><button className="saas-secondary-btn" disabled={saving} onClick={() => void finish(false)}>Skip for now</button><button className="saas-primary-btn onboarding-primary" disabled={saving} onClick={() => void finish(true)}><CheckCircle2 size={16} />{saving ? 'Saving…' : 'Create my first report'}<ArrowRight size={16} /></button></div>
    <small className="onboarding-reassurance">No payment details required during your 30-day free trial.</small>
  </div></div>;
}
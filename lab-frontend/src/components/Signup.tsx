import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, CheckCircle2, KeyRound, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from './Toast';

type Props = { onSignupSuccess: (user: any) => void; onCancel: () => void };

export default function Signup({ onSignupSuccess, onCancel }: Props) {
  const toast = useToast();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [labName, setLabName] = useState('');
  const [labCode, setLabCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [requestId, setRequestId] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const requestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await authService.requestSignupOtp({ labName, labCode, mobile, email, address, password });
      setRequestId(res.requestId); setDevOtp(res.devOtp ?? ''); setOtp(''); setResendSeconds(60); setStep('otp');
      toast.show({ type: 'success', message: 'Verification code sent by SMS to your mobile number.' });
    } catch (err: any) { const message = err?.message || 'Could not start signup.'; setError(message); toast.show({ type: 'error', message }); }
    finally { setLoading(false); }
  };

  const resendOtp = async () => {
    if (!requestId || resendSeconds > 0 || resending) return;
    setError(null); setResending(true);
    try {
      const res = await authService.resendSignupOtp(requestId);
      setRequestId(res.requestId || requestId); setDevOtp(res.devOtp ?? ''); setOtp(''); setResendSeconds(60);
      toast.show({ type: 'success', message: 'A new verification code was sent by SMS.' });
    } catch (err: any) { const message = err?.message || 'Could not resend the verification code.'; setError(message); toast.show({ type: 'error', message }); }
    finally { setResending(false); }
  };

  const verifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const res = await authService.verifySignupOtp({ requestId, otp });
      toast.show({ type: 'success', message: 'Workspace created. Please sign in.' });
      onSignupSuccess(res.user ?? res);
    } catch (err: any) { const message = err?.message || 'OTP verification failed.'; setError(message); toast.show({ type: 'error', message }); }
    finally { setLoading(false); }
  };

  const maskedMobile = mobile.replace(/\s/g, '').replace(/^(\+?91)?(\d{2})\d{4}(\d{2})$/, '$1$2••••$3');

  return <>
    <div className="saas-signup-header">
      <div>
        <span className="saas-signup-eyebrow">14-day free trial</span>
        <h3>{step === 'details' ? 'Create your lab workspace' : 'Verify your mobile number'}</h3>
        <p>{step === 'details' ? 'Set up your laboratory workspace. No payment details are required for the trial.' : 'Enter the 6-digit verification code sent by SMS to your registered mobile number.'}</p>
      </div>
      <button type="button" className="saas-signup-cancel" onClick={onCancel}>Cancel</button>
    </div>

    {step === 'details' ? <form onSubmit={requestOtp} className="saas-signup-form">
      <section className="saas-signup-section">
        <div className="saas-signup-section-title"><Building2 size={16} /><span>Laboratory details</span></div>
        <div className="saas-signup-grid">
          <label className="saas-signup-field"><span>Lab name</span><input value={labName} onChange={(e) => setLabName(e.target.value)} required placeholder="Apex Clinical Diagnostics" /></label>
          <label className="saas-signup-field"><span>Lab code <em>optional</em></span><input value={labCode} onChange={(e) => setLabCode(e.target.value.toUpperCase())} placeholder="AUTO-GENERATED" /></label>
          <label className="saas-signup-field"><span>Mobile number</span><input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required placeholder="+91 98765 43210" autoComplete="tel" /></label>
          <label className="saas-signup-field"><span>Admin email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="admin@lab.com" /></label>
          <label className="saas-signup-field saas-signup-full"><span>Address <em>optional</em></span><textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="Full laboratory address" /></label>
        </div>
      </section>

      <section className="saas-signup-section">
        <div className="saas-signup-section-title"><KeyRound size={16} /><span>Administrator credentials</span></div>
        <p className="saas-signup-note">The admin email will be your login ID. Use at least 8 characters for the password.</p>
        <label className="saas-signup-field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" /></label>
      </section>

      {error && <div className="saas-signup-error">{error}</div>}
      <div className="saas-signup-actions">
        <button type="button" className="saas-signup-secondary" onClick={onCancel}><ArrowLeft size={15} />Back</button>
        <button type="submit" className="saas-signup-primary" disabled={loading}><ShieldCheck size={15} />{loading ? 'Sending code…' : 'Continue'}</button>
      </div>
    </form> : <form onSubmit={verifyOtp} className="saas-signup-form">
      <div className="saas-otp-card"><div className="saas-otp-icon"><Smartphone size={21} /></div><div><h4>SMS verification</h4><p>We sent a one-time code by SMS to <strong>{maskedMobile || mobile}</strong>. It expires in 10 minutes.</p></div></div>
      {devOtp && <div className="saas-dev-otp">Development code: <strong>{devOtp}</strong></div>}
      <label className="saas-signup-field"><span>6-digit verification code</span><input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder="000000" inputMode="numeric" autoComplete="one-time-code" maxLength={6} /></label>
      {error && <div className="saas-signup-error">{error}</div>}
      <div className="saas-signup-resend"><span>Didn't receive the SMS?</span><button type="button" onClick={resendOtp} disabled={resendSeconds > 0 || resending}>{resending ? 'Sending…' : resendSeconds > 0 ? `Resend in ${resendSeconds}s` : <><RefreshCw size={13} />Resend code</>}</button></div>
      <div className="saas-signup-actions"><button type="button" className="saas-signup-secondary" onClick={() => { setError(null); setStep('details'); }}><ArrowLeft size={15} />Edit details</button><button type="submit" className="saas-signup-primary" disabled={loading || otp.length < 6}><CheckCircle2 size={15} />{loading ? 'Verifying…' : 'Create workspace'}</button></div>
    </form>}

    <style>{`
      .saas-signup-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
      .saas-signup-header > div { min-width: 0; }
      .saas-signup-eyebrow { display: block; margin-bottom: 4px; color: var(--saas-primary); font-size: 10px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
      .saas-signup-header h3 { margin: 0; color: var(--saas-text); font-size: 19px; line-height: 1.3; letter-spacing: -.02em; }
      .saas-signup-header p { margin: 5px 0 0; color: var(--saas-muted); font-size: 12px; line-height: 1.5; }
      .saas-signup-cancel { flex: 0 0 auto; padding: 6px 8px; border: 0; border-radius: 7px; background: transparent; color: var(--saas-muted); font: inherit; font-size: 12px; font-weight: 650; cursor: pointer; }
      .saas-signup-cancel:hover { background: var(--saas-surface-muted); color: var(--saas-text); }
      .saas-signup-form { width: 100%; display: grid; gap: 18px; }
      .saas-signup-section { display: grid; gap: 12px; padding-bottom: 17px; border-bottom: 1px solid var(--saas-border); }
      .saas-signup-section:last-of-type { padding-bottom: 0; border-bottom: 0; }
      .saas-signup-section-title { display: flex; align-items: center; gap: 8px; color: var(--saas-primary); font-size: 12px; font-weight: 750; }
      .saas-signup-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .saas-signup-field { min-width: 0; display: grid; gap: 6px; color: var(--saas-text); font-size: 11px; font-weight: 650; }
      .saas-signup-field em { margin-left: 3px; color: var(--saas-muted); font-size: 10px; font-style: normal; font-weight: 500; }
      .saas-signup-field input, .saas-signup-field textarea { box-sizing: border-box; width: 100%; min-height: 40px; padding: 0 11px; border: 1px solid var(--saas-border); border-radius: 8px; background: var(--saas-surface); color: var(--saas-text); font: inherit; font-weight: 450; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }
      .saas-signup-field textarea { min-height: 66px; padding: 9px 11px; resize: vertical; }
      .saas-signup-field input::placeholder, .saas-signup-field textarea::placeholder { color: var(--saas-muted); opacity: .8; }
      .saas-signup-field input:focus, .saas-signup-field textarea:focus { border-color: var(--saas-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--saas-primary) 12%, transparent); }
      .saas-signup-note { margin: -3px 0 0; color: var(--saas-muted); font-size: 11px; line-height: 1.45; }
      .saas-signup-error { padding: 9px 11px; border: 1px solid color-mix(in srgb, var(--saas-danger) 20%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--saas-danger) 7%, var(--saas-surface)); color: var(--saas-danger); font-size: 11px; font-weight: 650; line-height: 1.45; }
      .saas-signup-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
      .saas-signup-primary, .saas-signup-secondary { min-height: 39px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; border-radius: 8px; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
      .saas-signup-primary { border: 1px solid var(--saas-primary); background: var(--saas-primary); color: #fff; }
      .saas-signup-primary:disabled { opacity: .55; cursor: not-allowed; }
      .saas-signup-secondary { border: 1px solid var(--saas-border); background: var(--saas-surface); color: var(--saas-text); }
      .saas-signup-secondary:hover { background: var(--saas-surface-muted); }
      .saas-otp-card { display: grid; grid-template-columns: auto 1fr; gap: 11px; align-items: center; padding: 13px; border: 1px solid var(--saas-border); border-radius: 10px; background: var(--saas-surface-muted); }
      .saas-otp-icon { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; background: color-mix(in srgb, var(--saas-primary) 10%, var(--saas-surface)); color: var(--saas-primary); }
      .saas-otp-card h4 { margin: 0; color: var(--saas-text); font-size: 13px; }
      .saas-otp-card p { margin: 3px 0 0; color: var(--saas-muted); font-size: 11px; line-height: 1.45; }
      .saas-dev-otp { padding: 9px 11px; border: 1px solid color-mix(in srgb, var(--saas-warning, #f59e0b) 25%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--saas-warning, #f59e0b) 7%, var(--saas-surface)); color: var(--saas-text); font-size: 11px; }
      .saas-signup-resend { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--saas-muted); font-size: 11px; }
      .saas-signup-resend button { display: inline-flex; align-items: center; gap: 5px; padding: 0; border: 0; background: transparent; color: var(--saas-primary); font: inherit; font-weight: 700; cursor: pointer; }
      .saas-signup-resend button:disabled { color: var(--saas-muted); cursor: not-allowed; }
      @media (max-width: 560px) { .saas-signup-header { gap: 8px; } .saas-signup-grid { grid-template-columns: 1fr; } .saas-signup-full { grid-column: auto; } .saas-signup-actions > button { flex: 1; } .saas-otp-card { grid-template-columns: 1fr; } .saas-signup-resend { align-items: flex-start; flex-direction: column; } }
      @media (prefers-reduced-motion: reduce) { .saas-signup-primary, .saas-signup-secondary { transition: none; } }
    `}</style>
  </>;
}

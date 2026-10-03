import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, CheckCircle2, KeyRound, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from './Toast';

type Props = { onSignupSuccess: (user: any) => void; onCancel: () => void };

export default function Signup({ onSignupSuccess, onCancel }: Props) {
  const toast = useToast();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [labName, setLabName] = useState('');
  // const [labCode, setLabCode] = useState('');
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
      const res = await authService.requestSignupOtp({ labName, mobile, email, address, password });
      setRequestId(res.requestId); setDevOtp(res.devOtp ?? ''); setOtp(res.devOtp ?? ''); setResendSeconds(60); setStep('otp');
      toast.show({ type: 'success', message: 'Verification code sent by SMS to your mobile number.' });
    } catch (err: any) { const message = err?.message || 'Could not start signup.'; setError(message); toast.show({ type: 'error', message }); }
    finally { setLoading(false); }
  };

  const resendOtp = async () => {
    if (!requestId || resendSeconds > 0 || resending) return;
    setError(null); setResending(true);
    try {
      const res = await authService.resendSignupOtp(requestId);
      setRequestId(res.requestId || requestId); setDevOtp(res.devOtp ?? ''); setOtp(res.devOtp ?? ''); setResendSeconds(60);
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
        <span className="saas-signup-eyebrow">PathMLT Register Here • 30-day free trial</span>
        <h3>{step === 'details' ? 'Register your laboratory' : 'Verify your mobile number'}</h3>
        <p>{step === 'details' ? 'Enter your laboratory details to create your PathMLT account. No payment details are required for the trial.' : 'Enter the 6-digit verification code sent by SMS to your registered mobile number.'}</p>
      </div>
      <button type="button" className="saas-signup-cancel" onClick={onCancel}>Cancel</button>
    </div>

    {step === 'details' ? <form onSubmit={requestOtp} className="saas-signup-form">
      <section className="saas-signup-section">
        <div className="saas-signup-section-title"><Building2 size={16} /><span>Laboratory details</span></div>
        <div className="saas-signup-grid">
          <label className="saas-signup-field"><span>Lab name</span><input value={labName} onChange={(e) => setLabName(e.target.value)} required placeholder="Apex Clinical Diagnostics" /></label>
          {/* <label className="saas-signup-field"><span>Lab code <em>optional</em></span><input value={labCode} onChange={(e) => setLabCode(e.target.value.toUpperCase())} placeholder="AUTO-GENERATED" /></label> */}
          <label className="saas-signup-field"><span>Mobile number</span><input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} required placeholder="+91 98765 43210" autoComplete="tel" /></label>
          <label className="saas-signup-field"><span>Admin email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="admin@lab.com" /></label>
          <label className="saas-signup-field saas-signup-full"><span>Address <em>optional</em></span><textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="Full laboratory address" /></label>
        </div>
      </section>

      <section className="saas-signup-section">
        <div className="saas-signup-section-title"><KeyRound size={16} /><span>Login details</span></div>
        <p className="saas-signup-note">Your admin email will be used to login. Use at least 8 characters for the password.</p>
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


  </>;
}

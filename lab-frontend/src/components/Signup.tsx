import { useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await authService.requestSignupOtp({ labName, labCode, mobile, email, address, password });
      setRequestId(res.requestId); setDevOtp(res.devOtp ?? ''); setStep('otp');
      toast.show({ type: 'success', message: 'Verification code sent. Check your email.' });
    } catch (err: any) { const message = err?.message || 'Could not start signup.'; setError(message); toast.show({ type: 'error', message }); }
    finally { setLoading(false); }
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

  return <>
    <div className="auth-modal-header"><div><span className="eyebrow">14-day free trial</span><h2>{step === 'details' ? 'Create your lab workspace' : 'Verify your email'}</h2><p>{step === 'details' ? 'Set up your laboratory workspace. No payment details are required for the trial.' : 'Enter the 6-digit verification code sent to your registered email.'}</p></div><button type="button" className="text-button" onClick={onCancel}>Cancel</button></div>
    {step === 'details' ? <form onSubmit={requestOtp} className="auth-form-card">
      <div className="form-section"><div className="section-heading"><Building2 size={18} /><span>Laboratory details</span></div><div className="form-grid"><label className="form-field"><span>Lab name</span><input value={labName} onChange={(e) => setLabName(e.target.value)} required placeholder="Apex Clinical Diagnostics" /></label><label className="form-field"><span>Lab code <em>optional</em></span><input value={labCode} onChange={(e) => setLabCode(e.target.value.toUpperCase())} placeholder="AUTO-GENERATED" /></label><label className="form-field"><span>Mobile number</span><input value={mobile} onChange={(e) => setMobile(e.target.value)} required placeholder="+91 98765 43210" /></label><label className="form-field"><span>Admin email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="admin@lab.com" /></label></div><label className="form-field full-width"><span>Address <em>optional</em></span><textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} placeholder="Full laboratory address" /></label></div>
      <div className="form-section"><div className="section-heading"><KeyRound size={18} /><span>Administrator credentials</span></div><p className="section-note">The admin email will be your login ID. Use at least 8 characters for the password.</p><label className="form-field full-width"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" /></label></div>
      {error && <div className="auth-error">{error}</div>}<div className="auth-actions"><button type="button" className="btn btn-ghost" onClick={onCancel}><ArrowLeft size={16} />Back</button><button type="submit" className="btn btn-primary" disabled={loading}><ShieldCheck size={16} />{loading ? 'Sending code…' : 'Continue'}</button></div>
    </form> : <form onSubmit={verifyOtp} className="auth-form-card otp-form"><div className="otp-card"><div className="otp-card-icon"><ShieldCheck size={24} /></div><div><h3>Email verification</h3><p>We sent a one-time code to <strong>{email}</strong>. It expires in 10 minutes.</p></div></div>{devOtp && <div className="dev-otp-note">Development code: <strong>{devOtp}</strong></div>}<label className="form-field"><span>6-digit verification code</span><input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required placeholder="000000" inputMode="numeric" autoComplete="one-time-code" /></label>{error && <div className="auth-error">{error}</div>}<div className="auth-actions"><button type="button" className="btn btn-ghost" onClick={() => setStep('details')}><ArrowLeft size={16} />Edit details</button><button type="submit" className="btn btn-primary" disabled={loading || otp.length < 6}><CheckCircle2 size={16} />{loading ? 'Verifying…' : 'Create workspace'}</button></div></form>}
    <style>{`.auth-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:0 0 1rem}.auth-modal-header h2{margin:4px 0 0;font-size:2rem;line-height:1.05}.eyebrow{display:inline-flex;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;color:var(--primary);font-weight:850}.auth-modal-header p{margin:8px 0 0;color:var(--text);max-width:600px;line-height:1.7}.text-button{background:none;border:0;color:var(--text);font-weight:700;cursor:pointer;padding:8px 10px;border-radius:10px}.text-button:hover{background:rgba(148,163,184,.1)}.auth-form-card{display:grid;gap:22px;width:min(840px,calc(100vw - 48px));padding:0}.form-section{display:grid;gap:14px}.section-heading{display:flex;align-items:center;gap:10px;color:var(--primary);font-weight:800}.section-heading span{font-size:.9rem}.form-field em{font-style:normal;color:var(--text);font-weight:500;font-size:.68rem}.section-note{margin:0;color:var(--text);font-size:.82rem}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.form-field{display:flex;flex-direction:column;gap:7px;color:var(--text-bold);font-weight:750;font-size:.78rem}.form-field.full-width{grid-column:1/-1}.form-field input,.form-field textarea{width:100%;min-height:45px;padding:12px 13px;border-radius:12px;border:1px solid var(--border);background:rgba(255,255,255,.72);color:var(--text-bold);outline:none;font:inherit}.form-field textarea{min-height:88px;resize:vertical}.form-field input:focus,.form-field textarea:focus{border-color:var(--border-focus);box-shadow:0 0 0 4px rgba(6,96,137,.11)}.otp-card{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:17px;border-radius:15px;background:var(--primary-light);border:1px solid rgba(38,99,161,.18)}.otp-card-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:rgba(18,96,150,.12);color:var(--primary)}.otp-card h3{margin:0;font-size:1rem}.otp-card p{margin:3px 0 0;color:var(--text);font-size:.78rem}.dev-otp-note{padding:12px 14px;border-radius:12px;background:var(--warning-bg);color:var(--text-bold);font-size:.78rem;border:1px solid rgba(245,158,11,.25)}.auth-error{color:var(--danger);font-weight:700;font-size:.78rem}.auth-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:0;border-radius:11px;padding:11px 15px;min-width:145px;font-weight:800;cursor:pointer}.btn-primary{background:var(--primary);color:#fff}.btn-primary:disabled{opacity:.55;cursor:not-allowed}.btn-ghost{background:var(--panel-bg);border:1px solid var(--border);color:var(--text-bold)}@media(max-width:820px){.auth-form-card{width:calc(100vw - 32px)}.form-grid{grid-template-columns:1fr}}@media(max-width:580px){.auth-modal-header{flex-direction:column}.auth-actions{justify-content:flex-start}.otp-card{grid-template-columns:1fr}}`}</style>
  </>;
}

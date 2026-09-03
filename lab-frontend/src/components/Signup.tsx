import { useState, type FormEvent } from 'react';
import { ArrowLeft, Building2, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from './Toast';

type Props = {
  onSignupSuccess: (user: any) => void;
  onCancel: () => void;
};

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
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestSignupOtp({
        labName,
        labCode,
        mobile,
        email,
        address,
        password,
      });
      setRequestId(res.requestId);
      setDevOtp(res.devOtp ?? '');
      setStep('otp');
      toast.show({ type: 'success', message: 'OTP sent for verification.' });
    } catch (err: any) {
      const message = err?.message || 'Could not send OTP.';
      setError(message);
      toast.show({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.verifySignupOtp({ requestId, otp });
      toast.show({ type: 'success', message: 'Signup complete. Please sign in.' });
      onSignupSuccess(res.user ?? res);
    } catch (err: any) {
      const message = err?.message || 'OTP verification failed.';
      setError(message);
      toast.show({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-modal-header">
        <div>
          <span className="eyebrow">New lab registration</span>
          <h2>{step === 'details' ? 'Sign up for your lab portal' : 'Confirm your OTP'}</h2>
          <p>
            {step === 'details'
              ? 'Enter a few details to create your lab account. We will verify your identity with OTP.'
              : 'Enter the one-time code sent to your mobile or email to finish signup.'}
          </p>
        </div>
        <button type="button" className="text-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {step === 'details' ? (
        <form onSubmit={requestOtp} className="auth-form-card">
          <div className="form-section">
            <div className="section-heading">
              <Building2 size={18} />
              <span>Lab details</span>
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span>Lab name</span>
                <input
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  required
                  placeholder="Apex Clinical Diagnostics"
                />
              </label>
              <label className="form-field">
                <span>Lab code</span>
                <input
                  value={labCode}
                  onChange={(e) => setLabCode(e.target.value.toUpperCase())}
                  placeholder="Optional"
                />
              </label>
              <label className="form-field">
                <span>Mobile number</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                />
              </label>
              <label className="form-field">
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="contact@lab.com"
                />
              </label>
            </div>
            <label className="form-field full-width">
              <span>Address</span>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                placeholder="Full lab address"
              />
            </label>
          </div>

          <div className="form-section">
            <div className="section-heading">
              <KeyRound size={18} />
              <span>Account credentials</span>
            </div>
            <p className="section-note">Your email address above will be used to sign in.</p>
            <div className="form-grid">
              <label className="form-field full-width">
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                />
              </label>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              <ArrowLeft size={16} />
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <ShieldCheck size={16} />
              <span>{loading ? 'Request OTP' : 'Create account'}</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="auth-form-card otp-form">
          <div className="otp-card">
            <div className="otp-card-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3>OTP verification</h3>
              <p>Enter the 6-digit code sent to your registered details.</p>
            </div>
          </div>

          {devOtp && (
            <div className="dev-otp-note">
              Development OTP: <strong>{devOtp}</strong>
            </div>
          )}

          <label className="form-field">
            <span>One-time password</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="6 digit code"
              inputMode="numeric"
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setStep('details')}>
              <ArrowLeft size={16} />
              Edit details
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || otp.length < 6}>
              <CheckCircle2 size={16} />
              <span>{loading ? 'Verify OTP' : 'Confirm signup'}</span>
            </button>
          </div>
        </form>
      )}

      <style>{`
        .auth-modal-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; padding: 0 0 1rem; }
        .auth-modal-header h2 { margin:4px 0 0; font-size:2rem; line-height:1.05; }
        .eyebrow { display:inline-flex; text-transform:uppercase; letter-spacing:0.16em; font-size:0.78rem; color:var(--primary); font-weight:800; }
        .auth-modal-header p { margin:8px 0 0; color:var(--text); max-width:600px; line-height:1.7; }
        .text-button { background:none; border:none; color:var(--text); font-weight:700; cursor:pointer; padding:8px 10px; border-radius:10px; transition: background 0.2s ease; }
        .text-button:hover { background: rgba(255,255,255,0.12); }
        .auth-form-card { display:grid; gap:22px; width:min(840px, calc(100vw - 48px)); padding:0; }
        .form-section { display:grid; gap:14px; }
        .section-heading { display:flex; align-items:center; gap:10px; color:var(--primary); font-weight:800; }
        .section-heading span { font-size:0.95rem; }
        .section-note { margin:0; color:var(--text); font-size:0.95rem; }
        .form-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:14px; }
        .form-field { display:flex; flex-direction:column; gap:8px; color:var(--text-bold); font-weight:700; }
        .form-field.full-width { grid-column:1/-1; }
        .form-field input,
        .form-field textarea { width:100%; min-height:46px; padding:14px 15px; border-radius:14px; border:1px solid var(--border); background: rgba(255,255,255,0.85); color:var(--text-bold); outline:none; font:inherit; }
        .form-field textarea { min-height:94px; resize:vertical; }
        .form-field input:focus,
        .form-field textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 4px rgba(6,96,137,0.13); }
        .otp-card { display:grid; gap:10px; padding:18px 20px; border-radius:16px; background: var(--primary-light); border:1px solid rgba(38, 99, 161, 0.18); }
        .otp-card-icon { width:46px; height:46px; display:flex; align-items:center; justify-content:center; border-radius:14px; background:rgba(18, 96, 150, 0.12); color:var(--primary); }
        .otp-card h3 { margin:0; font-size:1.05rem; }
        .otp-card p { margin:0; color:var(--text); font-size:0.95rem; }
        .dev-otp-note { padding:14px 16px; border-radius:14px; background: rgba(255, 246, 230, 0.92); color: var(--text-bold); font-size:0.94rem; border:1px solid rgba(251, 186, 60, 0.28); }
        .auth-error { color: var(--danger); font-weight:700; font-size:0.95rem; }
        .auth-actions { display:flex; justify-content:flex-end; gap:12px; flex-wrap:wrap; }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:10px; border:none; border-radius:12px; padding:13px 18px; min-width:150px; font-weight:800; cursor:pointer; transition: transform 0.15s ease, filter 0.15s ease; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
        .btn-ghost { background: rgba(255,255,255,0.86); border:1px solid var(--border); color:var(--text-bold); }
        @media (max-width: 820px) { .auth-form-card { width:calc(100vw - 32px); } .form-grid { grid-template-columns:1fr; } }
        @media (max-width: 580px) { .auth-modal-header { flex-direction:column; align-items:flex-start; } .auth-actions { justify-content:flex-start; } }
      `}</style>
    </>
  );
}

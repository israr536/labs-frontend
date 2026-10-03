
import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
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

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);
   console.log(setAddress,devOtp)
  const requestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.requestSignupOtp({
        labName,
        mobile,
        email,
        address,
        password,
      });

      const generatedOtp = res.devOtp ?? '';

      setRequestId(res.requestId);
      setDevOtp(generatedOtp);
      setOtp(generatedOtp);
      setResendSeconds(60);
      setStep('otp');

      toast.show({
        type: 'success',
        message: 'Verification code generated successfully.',
      });
    } catch (err: any) {
      const message = err?.message || 'Could not start signup.';
      setError(message);

      toast.show({
        type: 'error',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!requestId || resendSeconds > 0 || resending) return;

    setError(null);
    setResending(true);

    try {
      const res = await authService.resendSignupOtp(requestId);
      const generatedOtp = res.devOtp ?? '';

      setRequestId(res.requestId || requestId);
      setDevOtp(generatedOtp);
      setOtp(generatedOtp);
      setResendSeconds(60);

      toast.show({
        type: 'success',
        message: 'A new verification code has been generated.',
      });
    } catch (err: any) {
      const message =
        err?.message || 'Could not resend the verification code.';

      setError(message);

      toast.show({
        type: 'error',
        message,
      });
    } finally {
      setResending(false);
    }
  };

  const verifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.verifySignupOtp({
        requestId,
        otp,
      });

      const session = await authService.login({ email, password });

      toast.show({
        type: 'success',
        message: 'Workspace created. You are now logged in.',
      });

      onSignupSuccess(session.user);
    } catch (err: any) {
      const message = err?.message || 'Verification failed.';
      setError(message);

      toast.show({
        type: 'error',
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="saas-signup-header">
        <div>
          <span className="saas-signup-eyebrow">
            PathMLT Register Here • 30-day free trial
          </span>

          <h3>
            {step === 'details'
              ? 'Register your laboratory'
              : 'Verify your registration'}
          </h3>

          <p>
            {step === 'details'
              ? 'Enter your laboratory details to create your PathMLT account. No payment details are required for the trial.'
              : 'Enter the 6-digit verification code to complete your registration.'}
          </p>
        </div>

        <button
          type="button"
          className="saas-signup-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      {step === 'details' ? (
        <form onSubmit={requestOtp} className="saas-signup-form">
          <section className="saas-signup-section">
            <div className="saas-signup-section-title">
              <Building2 size={16} />
              <span>Laboratory details</span>
            </div>

            <div className="saas-signup-grid">
              <label className="saas-signup-field">
                <span>Lab name</span>
                <input
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  required
                  placeholder="Apex Clinical Diagnostics"
                />
              </label>

              {/* 
              <label className="saas-signup-field">
                <span>
                  Lab code <em>optional</em>
                </span>
                <input
                  value={labCode}
                  onChange={(e) =>
                    setLabCode(e.target.value.toUpperCase())
                  }
                  placeholder="AUTO-GENERATED"
                />
              </label>
              */}

              <label className="saas-signup-field">
                <span>Mobile number</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </label>

              <label className="saas-signup-field">
                <span>Admin email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@lab.com"
                />
              </label>

              {/* <label className="saas-signup-field saas-signup-full">
                <span>
                  Address <em>optional</em>
                </span>

                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  placeholder="Full laboratory address"
                />
              </label> */}
            </div>
          </section>

          <section className="saas-signup-section">
            <div className="saas-signup-section-title">
              <KeyRound size={16} />
              <span>Login details</span>
            </div>

            <p className="saas-signup-note">
              Your admin email will be used to login. Use at least 8
              characters for the password.
            </p>

            <label className="saas-signup-field">
              <span>Password</span>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </label>
          </section>

          {error && <div className="saas-signup-error">{error}</div>}

          <div className="saas-signup-actions">
            <button
              type="button"
              className="saas-signup-secondary"
              onClick={onCancel}
            >
              <ArrowLeft size={15} />
              Back
            </button>

            <button
              type="submit"
              className="saas-signup-primary"
              disabled={loading}
            >
              <ShieldCheck size={15} />
              {loading ? 'Generating code…' : 'Continue'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="saas-signup-form">
          <div className="saas-otp-card">
            <div className="saas-otp-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <h4>Verification code</h4>

              <p>
                Your verification code has been generated for this
                registration. It expires in 10 minutes.
              </p>
            </div>
          </div>

          <label className="saas-signup-field">
            <span>6-digit verification code</span>

            <input
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, '').slice(0, 6)
                )
              }
              required
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
            />
              
          </label>
<p>Verification code is filled automatically. Please click "Submit" to continue.</p>
          {error && <div className="saas-signup-error">{error}</div>}

          <div className="saas-signup-resend">
            <span>Didn't receive a verification code?</span>

            <button
              type="button"
              onClick={resendOtp}
              disabled={resendSeconds > 0 || resending}
            >
              {resending ? (
                'Generating…'
              ) : resendSeconds > 0 ? (
                `Resend in ${resendSeconds}s`
              ) : (
                <>
                  <RefreshCw size={13} />
                  Resend code
                </>
              )}
            </button>
          </div>

          <div className="saas-signup-actions">
            <button
              type="button"
              className="saas-signup-secondary"
              onClick={() => {
                setError(null);
                setStep('details');
              }}
            >
              <ArrowLeft size={15} />
              Edit details
            </button>

            <button
              type="submit"
              className="saas-signup-primary"
              disabled={loading || otp.length < 6}
            >
              <CheckCircle2 size={15} />
              {loading ? 'Verifying…' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </>
  );
}


// ### What is improved

// * ❌ Removed **“Verify your mobile number”**
// * ❌ Removed **“SMS verification”**
// * ❌ Removed **“sent by SMS”**
// * ❌ Removed the displayed `Verification Code: 123456`
// * ❌ Removed **“Didn't receive the SMS?”**
// * ✅ OTP is still automatically filled from `res.devOtp`
// * ✅ Resend still automatically fills the new OTP
// * ✅ Existing signup fields and backend verification remain unchanged
// * ✅ `mobile` is still collected because your current backend requires it
// * ✅ The user simply sees **“Verification code”** and the populated 6-digit field

// One important thing: **I would not remove the mobile-number field itself yet**, because your current backend's `requestSignupOtp()` still requires `admin.mobile` and `body.mobile`. Removing it from the UI without changing the backend would break signup.

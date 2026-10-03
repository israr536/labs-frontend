import { useState, type FormEvent, type ReactNode } from 'react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from './Toast';

interface ForgotPasswordProps { onBackToLogin: () => void; }
type Step = 'mobile' | 'otp' | 'password' | 'success';

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const toast = useToast();
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState(''); const [requestId, setRequestId] = useState(''); const [otp, setOtp] = useState(''); const [resetToken, setResetToken] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const normalizePhoneInput = (value: string) => value.replace(/[^\d+\s().-]/g, '').replace(/(?!^)\+/g, '');
  const normalizeAndValidatePhone = (value: string) => {
    const compact = value.replace(/[\s().-]/g, '');
    const phone = /^\d{10}$/.test(compact)
      ? parsePhoneNumberFromString(compact, 'IN')
      : compact.startsWith('+')
        ? parsePhoneNumberFromString(compact)
        : undefined;
    return phone?.isValid() ? phone.number : null;
  };
  const startCooldown = () => { setCooldown(60); const timer = window.setInterval(() => setCooldown(v => { if (v <= 1) { window.clearInterval(timer); return 0; } return v - 1; }), 1000); };
  const run = async (action: () => Promise<void>) => { setLoading(true); setError(null); try { await action(); } catch (err: any) { const message = err?.message || 'Something went wrong. Please try again.'; setError(message); toast.show({ type: 'error', message }); } finally { setLoading(false); } };
  const requestOtp = (e: FormEvent) => { e.preventDefault(); const normalizedMobile = normalizeAndValidatePhone(mobile); if (!normalizedMobile) { setError('Enter a valid mobile number. India requires 10 digits; numbers from other countries must include the +country code.'); return; } void run(async () => { const res = await authService.requestPasswordResetOtp({ mobile: normalizedMobile }); setRequestId(res.requestId); setOtp(res.devOtp ?? ''); startCooldown(); setStep('otp'); toast.show({ type: 'success', message: 'Verification code generated successfully.' }); }); };
  const verifyOtp = (e: FormEvent) => { e.preventDefault(); if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit OTP.'); return; } void run(async () => { const res = await authService.verifyPasswordResetOtp({ requestId, otp }); setResetToken(res.resetToken); setStep('password'); }); };
  const resend = () => { if (cooldown || !requestId) return; void run(async () => { const res = await authService.resendPasswordResetOtp(requestId); setOtp(res.devOtp ?? ''); startCooldown(); toast.show({ type: 'success', message: 'A new verification code has been generated.' }); }); };
  const reset = (e: FormEvent) => { e.preventDefault(); if (password.length < 8) { setError('Password must be at least 8 characters.'); return; } if (password !== confirmPassword) { setError('Passwords do not match.'); return; } void run(async () => { await authService.resetPassword({ requestId, resetToken, password }); setStep('success'); }); };
  const back = () => { setError(null); if (step === 'mobile') onBackToLogin(); else if (step === 'otp') setStep('mobile'); else if (step === 'password') setStep('otp'); };
  return <div className="saas-auth-form">
    {step !== 'success' && <button type="button" className="saas-auth-back" onClick={back}><ArrowLeft size={14}/> Back</button>}
    <div className="saas-auth-heading"><div className="saas-auth-icon">{step === 'password' ? <LockKeyhole size={20}/> : step === 'success' ? <CheckCircle2 size={20}/> : <KeyRound size={20}/>}</div><div><span className="saas-auth-eyebrow">Account recovery</span><h3>{step === 'mobile' ? 'Forgot your password?' : step === 'otp' ? 'Enter verification code' : step === 'password' ? 'Create a new password' : 'Password updated'}</h3></div></div>
    <p className="saas-auth-intro">{step === 'mobile' ? 'Enter your registered mobile number to continue with password recovery.' : step === 'otp' ? 'Enter the 6-digit verification code to continue. It expires in 10 minutes.' : step === 'password' ? 'Choose a strong password with at least 8 characters.' : 'Your password has been changed and existing sessions have been signed out.'}</p>
    {step === 'mobile' && <form onSubmit={requestOtp} className="saas-auth-fields"><label className="saas-auth-field"><span>Registered mobile number <em>India: 10 digits • Other countries: +country code</em></span><input type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={mobile} onChange={e=>setMobile(normalizePhoneInput(e.target.value))} placeholder="98765 43210 or +1 415 555 2671"/></label><Submit label="Continue" loading={loading} icon={<KeyRound size={15}/>}/></form>}
    {step === 'otp' && <form onSubmit={verifyOtp} className="saas-auth-fields"><label className="saas-auth-field"><span>Verification code</span><input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="Enter 6-digit code"/><small>Verification code is filled automatically when local OTP mode is enabled. Please click “Verify OTP” to continue.</small></label><Submit label="Verify OTP" loading={loading} icon={<KeyRound size={15}/>}/><button type="button" className="saas-auth-link-button" disabled={cooldown>0 || loading} onClick={resend}>{cooldown>0 ? `Resend code in ${cooldown}s`  : 'Resend verification code'}</button></form>}
    {step === 'password' && <form onSubmit={reset} className="saas-auth-fields"><label className="saas-auth-field"><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label><label className="saas-auth-field"><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter your password"/></label><Submit label="Reset password" loading={loading} icon={<LockKeyhole size={15}/>}/></form>}
    {step === 'success' && <div className="saas-auth-success"><CheckCircle2 size={38}/><strong>You’re all set</strong><span>Your password was reset successfully.</span><button type="button" className="saas-auth-submit" onClick={onBackToLogin}>Return to sign in</button></div>}
    {error && <div className="saas-auth-error" role="alert">{error}</div>}

  </div>;
}
function Submit({ label, loading, icon }: { label: string; loading: boolean; icon: ReactNode }) { return <button type="submit" className="saas-auth-submit" disabled={loading}>{icon}<span>{loading ? 'Please wait…' : label}</span></button>; }

import { useState, type FormEvent } from 'react';
import { Key, Unlock } from 'lucide-react';
import authService, { type AuthUser } from '../services/authService';
import { useToast } from './Toast';

interface LoginProps { onLoginSuccess: (user: AuthUser) => void; }

export default function Login({ onLoginSuccess }: LoginProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      if (res?.user) {
        onLoginSuccess(res.user);
        toast.show({ type: 'success', message: 'Signed in successfully.' });
      } else setError('Login succeeded but no user was returned.');
    } catch (err: any) {
      const message = err?.message || 'Login failed.';
      setError(message);
      toast.show({ type: 'error', message });
    } finally { setLoading(false); }
  };

  return <>
    <form onSubmit={handleSubmit} className="saas-auth-form">
      <div className="saas-auth-heading">
        <div className="saas-auth-icon"><Unlock size={20} /></div>
        <div>
          <span className="saas-auth-eyebrow">Secure sign in</span>
          <h3>Access your lab dashboard</h3>
        </div>
      </div>
      <p className="saas-auth-intro">Sign in to manage patients, tests, orders and reports securely.</p>

      <div className="saas-auth-fields">
        <label className="saas-auth-field" htmlFor="login-email">
          <span>Email address</span>
          <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className="saas-auth-field" htmlFor="login-password">
          <span>Password</span>
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
        </label>
      </div>

      {error && <div className="saas-auth-error" role="alert">{error}</div>}

      <button type="submit" className="saas-auth-submit" disabled={loading}>
        <Key size={15} />
        <span>{loading ? 'Signing in…' : 'Sign in'}</span>
      </button>
    </form>

    <style>{`
      .saas-auth-form { width: 100%; display: grid; gap: 18px; }
      .saas-auth-heading { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .saas-auth-icon { width: 42px; height: 42px; flex: 0 0 42px; display: grid; place-items: center; border: 1px solid var(--saas-border); border-radius: 12px; background: var(--saas-surface-muted); color: var(--saas-primary); }
      .saas-auth-eyebrow { display: block; margin-bottom: 3px; color: var(--saas-primary); font-size: 10px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
      .saas-auth-heading h3 { margin: 0; color: var(--saas-text); font-size: 18px; line-height: 1.3; letter-spacing: -.02em; }
      .saas-auth-intro { margin: 0; color: var(--saas-muted); font-size: 13px; line-height: 1.55; }
      .saas-auth-fields { display: grid; gap: 14px; }
      .saas-auth-field { display: grid; gap: 6px; color: var(--saas-text); font-size: 12px; font-weight: 650; }
      .saas-auth-field input { box-sizing: border-box; width: 100%; min-height: 42px; padding: 0 12px; border: 1px solid var(--saas-border); border-radius: 9px; background: var(--saas-surface); color: var(--saas-text); font: inherit; font-weight: 450; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }
      .saas-auth-field input::placeholder { color: var(--saas-muted); opacity: .8; }
      .saas-auth-field input:focus { border-color: var(--saas-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--saas-primary) 12%, transparent); }
      .saas-auth-error { padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--saas-danger) 20%, transparent); border-radius: 9px; background: color-mix(in srgb, var(--saas-danger) 7%, var(--saas-surface)); color: var(--saas-danger); font-size: 12px; font-weight: 650; line-height: 1.45; }
      .saas-auth-submit { width: 100%; min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid var(--saas-primary); border-radius: 9px; background: var(--saas-primary); color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; transition: transform .12s ease, opacity .15s ease; }
      .saas-auth-submit:hover:not(:disabled) { transform: translateY(-1px); }
      .saas-auth-submit:disabled { opacity: .6; cursor: not-allowed; }
      @media (prefers-reduced-motion: reduce) { .saas-auth-submit { transition: none; } }
    `}</style>
  </>;
}

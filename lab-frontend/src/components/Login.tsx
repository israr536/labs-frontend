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
    e.preventDefault(); setError(null);
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await authService.login({ email: email.trim(), password });
      if (res?.user) { onLoginSuccess(res.user); toast.show({ type: 'success', message: 'Signed in successfully.' }); }
      else setError('Login succeeded but no user was returned.');
    } catch (err: any) { const message = err?.message || 'Login failed.'; setError(message); toast.show({ type: 'error', message }); }
    finally { setLoading(false); }
  };

  return <><form onSubmit={handleSubmit} className="auth-form-card"><div className="auth-card-header"><div className="auth-icon"><Unlock size={24} /></div><div><p className="eyebrow">Secure sign in</p><h2>Access your lab dashboard</h2></div></div><p className="auth-intro">Sign in to manage patients, tests, orders and reports securely.</p><div className="form-group"><label className="form-label" htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="you@example.com" /></div><div className="form-group"><label className="form-label" htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" /></div>{error && <div className="error-msg" role="alert">{error}</div>}<button type="submit" className="btn btn-primary btn-block" disabled={loading}><Key size={14} /><span>{loading ? 'Signing in…' : 'Sign in'}</span></button></form><style>{`.auth-form-card{width:min(460px,calc(100vw - 40px));display:grid;gap:1.35rem;padding:1.7rem 1.7rem 1.9rem}.auth-card-header{display:flex;gap:1rem;align-items:center}.auth-icon{width:54px;height:54px;display:grid;place-items:center;border-radius:17px;background:rgba(6,96,137,.12);color:var(--primary)}.eyebrow{display:inline-block;margin-bottom:.35rem;font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--primary)}.auth-form-card h2{font-size:1.5rem;margin:0;line-height:1.2}.auth-intro{margin:0;color:var(--text);line-height:1.7;font-size:.84rem}.form-group{display:grid;gap:.5rem}.form-label{font-weight:750;color:var(--text-bold);font-size:.78rem}.form-input{width:100%;padding:13px 14px;border-radius:13px;border:1px solid var(--border);background:rgba(255,255,255,.86);outline:none;color:var(--text-bold);transition:border-color .2s,box-shadow .2s}.form-input:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(6,96,137,.08)}.error-msg{padding:.85rem .9rem;border-radius:12px;background:var(--danger-bg);color:var(--danger);font-weight:700;font-size:.78rem}.btn-block{width:100%;justify-content:center}@media(max-width:560px){.auth-form-card{width:calc(100vw - 32px);padding:1.4rem}}`}</style></>;
}

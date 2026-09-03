import { useState, type FormEvent } from 'react';
import { Key, Unlock } from 'lucide-react';
import authService from '../services/authService';
import { useToast } from './Toast';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login({ email: email.trim(), password });
      if (res && res.user) {
        onLoginSuccess(res.user);
        try { toast.show({ type: 'success', message: 'Signed in' }); } catch {}
      } else {
        setError('Login succeeded but no user returned');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      try { toast.show({ type: 'error', message: err?.message || 'Login failed' }); } catch {}
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form-card">
        <div className="auth-card-header">
          <div className="auth-icon">
            <Unlock size={24} />
          </div>
          <div>
            <p className="eyebrow">Secure sign in</p>
            <h2>Access your lab dashboard</h2>
          </div>
        </div>

        <p className="auth-intro">Sign in to manage patients, tests, and reports with confidence.</p>

        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="••••••••"
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          <Key size={14} />
          <span>{loading ? 'Signing in...' : 'Sign in'}</span>
        </button>
      </form>

      <style>{`
        .auth-form-card {
          width: min(460px, calc(100vw - 40px));
          display: grid;
          gap: 1.5rem;
          padding: 1.75rem 1.75rem 2rem;
        }
        .auth-card-header {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .auth-icon {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(6,96,137,0.12);
          color: var(--primary);
          box-shadow: inset 0 0 0 1px rgba(6,96,137,0.1);
        }
        .eyebrow {
          display: inline-block;
          margin-bottom: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--primary);
        }
        .auth-form-card h2 {
          font-size: 1.6rem;
          margin: 0;
          line-height: 1.2;
        }
        .auth-intro {
          margin: 0;
          color: var(--text);
          line-height: 1.75;
        }
        .form-group {
          display: grid;
          gap: 0.55rem;
        }
        .form-label {
          font-weight: 700;
          color: var(--text-bold);
        }
        .form-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(148,163,184,0.28);
          background: rgba(255,255,255,0.94);
          outline: none;
          color: var(--text-bold);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(6,96,137,0.08);
        }
        .error-msg {
          padding: 0.95rem 1rem;
          border-radius: 16px;
          background: rgba(254,226,226,0.45);
          color: var(--danger);
          font-weight: 700;
        }
        .btn-block {
          width: 100%;
          justify-content: center;
        }
        @media (max-width: 560px) {
          .auth-form-card {
            width: calc(100vw - 32px);
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

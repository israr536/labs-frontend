import { Activity, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Props = {
  onLogin: () => void;
  onSignup: () => void;
  isAuthenticated?: boolean;
  userName?: string | null;
  onLogout?: () => void;
};

export default function Header({ onLogin, onSignup, isAuthenticated, userName, onLogout }: Props) {
  const navigate = useNavigate();
  
  useEffect(() => {
    try { document.documentElement.style.setProperty('--header-height', '64px'); } catch {}
    return () => { try { document.documentElement.style.removeProperty('--header-height'); } catch {} };
  }, []);

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand">
          <Activity size={26} className="brand-icon" />
          <div className="brand-text">
            <div className="brand-title">ApexLab</div>
            <div className="brand-sub">Clinical Reporting</div>
          </div>
        </Link>

        <div className="auth-actions">
          {!isAuthenticated && (
            <nav className="nav-links">
              <Link className="nav-link" to="/pricing">Pricing</Link>
              <Link className="nav-link" to="/privacy">Privacy</Link>
              <Link className="nav-link" to="/about">About</Link>
              <Link className="nav-link" to="/contact">Contact</Link>
            </nav>
          )}
          {!isAuthenticated ? (
            <>
              <button className="btn-ghost" onClick={onLogin}>Log in</button>
              <button className="btn-primary" onClick={onSignup}>Sign up</button>
            </>
          ) : (
            <div className="user-menu">
              <button
                className="dashboard-btn"
                onClick={() => navigate('/dashboard')}
                title="Go to Dashboard"
              >
                <LayoutDashboard size={18} />
              </button>
              <User size={16} />
              <span className="user-name">{userName ?? 'User'}</span>
              <button className="logout-btn" onClick={onLogout} title="Log out">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .app-header {
          --h: 64px;
          height: var(--h);
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.45));
          backdrop-filter: blur(6px);
          z-index: 120;
        }
        .header-inner { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:12px 20px; width:100%; margin:0 auto; }
        .brand { display:flex; align-items:center; gap:12px; cursor: pointer; text-decoration: none; }
        .brand-icon { color: var(--primary); }
        .brand-title { font-weight:700; font-size:16px; }
        .brand-sub { font-size:12px; opacity:0.75; }
        .nav-links { display:flex; flex-direction: row; justify-content: flex-end; gap:14px; }
        .nav-link { background: transparent; border: none; cursor: pointer; padding:8px 10px; color: var(--text); border-radius:8px; font-weight:600; text-decoration: none; }
        .nav-link:hover { background: rgba(6,96,137,0.06); }
        .auth-actions { display:flex; gap:10px; align-items:center; }
        .btn-ghost { background:transparent; border:1px solid var(--border); padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; color:var(--text); }
        .btn-primary { background:var(--primary); color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer; font-weight:600; }
        .user-menu { display:flex; gap:8px; align-items:center; padding:6px 8px; border-radius:8px; background:transparent; }
        .user-name { font-weight:600; }
        .dashboard-btn { background:transparent; border:none; cursor:pointer; padding:6px 8px; border-radius:6px; color: var(--primary); transition: background 0.2s ease; }
        .dashboard-btn:hover { background: rgba(6,96,137,0.1); }
        .logout-btn { background:transparent; border:none; cursor:pointer; padding:6px; border-radius:6px; color: var(--text); transition: background 0.2s ease; }
        .logout-btn:hover { background: rgba(6,96,137,0.1); }
        @media (max-width: 800px) { .nav-links { display:none; } }
      `}</style>
    </header>
  );
}

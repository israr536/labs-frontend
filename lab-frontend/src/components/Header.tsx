import { Activity, ChevronDown, LayoutDashboard, LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Props = { onLogin: () => void; onSignup: () => void; isAuthenticated?: boolean; userName?: string | null; onLogout?: () => void };

export default function Header({ onLogin, onSignup, isAuthenticated, userName, onLogout }: Props) {
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);
  const go = (path: string) => { closeMobile(); navigate(path); };
  return <>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="app-header"><div className="header-inner">
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand" onClick={closeMobile}><span className="brand-mark"><Activity size={19} aria-hidden="true" /></span><span className="brand-text"><strong>PathMLT</strong><small>Laboratory OS</small></span></Link>
      {!isAuthenticated && <nav className="nav-links" aria-label="Primary navigation"><Link to="/solutions">Solutions</Link><Link to="/lab-reporting">Features</Link><Link to="/pricing">Pricing</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/faqs">FAQ</Link></nav>}
      <div className="header-actions">
        {!isAuthenticated ? <><a className="header-demo" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book demo</a><button className="header-link" onClick={onLogin}><LogIn size={15} aria-hidden="true" /> Login</button><button className="header-cta" onClick={onSignup}><UserPlus size={15} aria-hidden="true" /> Get started</button></> : <>
          <button className="header-dashboard" onClick={() => navigate('/dashboard')}><LayoutDashboard size={15} aria-hidden="true" /> Workspace</button>
          <button className="account-trigger" onClick={() => setAccountOpen(v => !v)} aria-expanded={accountOpen} aria-haspopup="menu"><span className="account-avatar">{(userName || 'U').slice(0, 1).toUpperCase()}</span><span className="account-name">{userName || 'User'}</span><ChevronDown size={14} aria-hidden="true" /></button>
          {accountOpen && <div className="account-menu" role="menu"><button type="button" role="menuitem" onClick={() => { setAccountOpen(false); navigate('/dashboard'); }}><LayoutDashboard size={15} aria-hidden="true" /> Dashboard</button><button type="button" role="menuitem" onClick={() => { setAccountOpen(false); onLogout?.(); }}><LogOut size={15} aria-hidden="true" /> Logout</button></div>}
        </>}
      </div>
      <button type="button" className="mobile-menu" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}</button>
    </div>
    {mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
      {!isAuthenticated ? <><Link to="/solutions" onClick={closeMobile}>Solutions</Link><Link to="/lab-reporting" onClick={closeMobile}>Features</Link><Link to="/pricing" onClick={closeMobile}>Pricing</Link><Link to="/about" onClick={closeMobile}>About</Link><Link to="/contact" onClick={closeMobile}>Contact</Link><Link to="/faqs" onClick={closeMobile}>FAQ</Link><a className="mobile-demo" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book demo on WhatsApp</a><button onClick={() => { closeMobile(); onLogin(); }}><LogIn size={16} aria-hidden="true" /> Login</button><button className="mobile-nav-primary" onClick={() => { closeMobile(); onSignup(); }}><UserPlus size={16} aria-hidden="true" /> Get started</button></> : <><button onClick={() => go('/dashboard')}><LayoutDashboard size={16} aria-hidden="true" /> Open workspace</button><button onClick={() => { closeMobile(); onLogout?.(); }}><LogOut size={16} aria-hidden="true" /> Logout</button></>}
    </nav>}

    </header>
  </>;
}

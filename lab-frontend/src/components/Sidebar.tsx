import { Activity, ActivitySquare, AlertTriangle, BarChart3, ClipboardList, FileText, FlaskConical, Moon, PlusCircle, Settings as SettingsIcon, ShieldCheck, Sun, UsersRound, SlidersHorizontal, UserRound, ScrollText } from 'lucide-react';
import type { LabSettings } from '../data/samples';

export type DashboardTab = 'dashboard' | 'orders' | 'patients' | 'critical-results' | 'reports' | 'new-report' | 'tests' | 'test-configuration' | 'users' | 'audit' | 'billing' | 'settings';

type Props = { activeTab: DashboardTab; setActiveTab: (tab: DashboardTab) => void; settings: LabSettings; darkMode: boolean; setDarkMode: (dark: boolean) => void; role?: string; isAuthenticated?: boolean; onLogout?: () => void };

export default function Sidebar({ activeTab, setActiveTab, settings, darkMode, setDarkMode, role, isAuthenticated, onLogout }: Props) {
  if (!isAuthenticated) return null;
  const menuItems = [
    { id: 'dashboard' as const, label: 'Overview', icon: ActivitySquare },
    { id: 'orders' as const, label: 'Orders & Results', icon: ClipboardList },
    { id: 'patients' as const, label: 'Patients', icon: UserRound },
    { id: 'critical-results' as const, label: 'Critical Results', icon: AlertTriangle },
    { id: 'reports' as const, label: 'Patients & Reports', icon: FileText },
    { id: 'new-report' as const, label: 'New Report', icon: PlusCircle },
  ];
  const adminItems = [
    { id: 'tests' as const, label: 'Test Catalog', icon: FlaskConical },
    { id: 'test-configuration' as const, label: 'Test Configuration', icon: SlidersHorizontal },
    { id: 'users' as const, label: 'Team', icon: UsersRound },
    { id: 'audit' as const, label: 'Audit Trail', icon: ScrollText },
    { id: 'billing' as const, label: 'Plan & Usage', icon: BarChart3 },
    { id: 'settings' as const, label: 'Lab Settings', icon: SettingsIcon },
  ];
  const renderItem = (item: typeof menuItems[number] | typeof adminItems[number]) => { const Icon = item.icon; const active = activeTab === item.id; return <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={`saas-nav-item ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}><span className="saas-nav-icon"><Icon size={17} strokeWidth={active ? 2.4 : 2} /></span><span className="saas-nav-label">{item.label}</span>{active && <span className="saas-nav-indicator" aria-hidden="true" />}</button>; };
  return <aside className="saas-sidebar" aria-label="Workspace navigation"><div className="saas-sidebar-inner">
    <header className="saas-brand"><div className="saas-brand-mark" aria-hidden="true"><Activity size={20} strokeWidth={2.5} /></div><div className="saas-brand-copy"><strong>Ldiax</strong><span>Laboratory OS</span></div></header>
    <button type="button" className="saas-workspace-switcher" aria-label={`Current laboratory: ${settings.labName || 'Your laboratory'}`}><span className="saas-workspace-avatar">{(settings.labName || 'L').slice(0, 1).toUpperCase()}</span><span className="saas-workspace-copy"><strong>{settings.labName || 'Your laboratory'}</strong><small>{role === 'ADMIN' ? 'Administrator' : role || 'Workspace member'}</small></span><span className="saas-status-dot" aria-label="Workspace online" /></button>
    <nav className="saas-sidebar-nav"><div className="saas-nav-section"><span className="saas-nav-heading">Workspace</span>{menuItems.map(renderItem)}</div><div className="saas-nav-section"><span className="saas-nav-heading">Manage</span>{role === 'ADMIN' ? adminItems.map(renderItem) : <div className="saas-restricted" role="note"><ShieldCheck size={14} /><span>Admin controls restricted</span></div>}</div></nav>
    <footer className="saas-sidebar-footer"><button type="button" onClick={() => setDarkMode(!darkMode)} className="saas-sidebar-action" aria-pressed={darkMode}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}<span>{darkMode ? 'Light appearance' : 'Dark appearance'}</span></button><button type="button" onClick={() => onLogout?.()} className="saas-sidebar-action saas-signout"><span>Sign out</span></button><span className="saas-sidebar-meta">Ldiax · v1.0</span></footer>
  </div></aside>;
}

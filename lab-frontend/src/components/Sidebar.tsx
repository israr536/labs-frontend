import { Activity, ActivitySquare, BarChart3, ClipboardList, FileText, Moon, PlusCircle, Settings as SettingsIcon, ShieldCheck, Sun, UsersRound } from 'lucide-react';
import type { LabSettings } from '../data/samples';

export type DashboardTab = 'dashboard' | 'orders' | 'reports' | 'new-report' | 'users' | 'billing' | 'settings';

type Props = {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  settings: LabSettings;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  role?: string;
  isAuthenticated?: boolean;
  onLogout?: () => void;
};

export default function Sidebar({ activeTab, setActiveTab, settings, darkMode, setDarkMode, role, isAuthenticated, onLogout }: Props) {
  if (!isAuthenticated) return null;

  const menuItems = [
    { id: 'dashboard' as const, label: 'Overview', icon: ActivitySquare },
    { id: 'orders' as const, label: 'Orders & Results', icon: ClipboardList },
    { id: 'reports' as const, label: 'Patients & Reports', icon: FileText },
    { id: 'new-report' as const, label: 'New Report', icon: PlusCircle },
  ];
  const adminItems = [
    { id: 'users' as const, label: 'Team', icon: UsersRound },
    { id: 'billing' as const, label: 'Plan & Usage', icon: BarChart3 },
    { id: 'settings' as const, label: 'Lab Settings', icon: SettingsIcon },
  ];

  const renderItem = (item: typeof menuItems[number] | typeof adminItems[number]) => {
    const Icon = item.icon;
    return <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={`menu-btn ${activeTab === item.id ? 'active' : ''}`}><Icon size={18} /><span>{item.label}</span></button>;
  };

  return <aside className="sidebar-container">
    <div className="sidebar-brand"><div className="brand-logo"><Activity size={22} /></div><div className="brand-text"><h2>ApexLab</h2><span>Lab workspace</span></div></div>
    <div className="lab-switcher"><div className="lab-avatar">{(settings.labName || 'L').slice(0, 1).toUpperCase()}</div><div className="lab-copy"><strong>{settings.labName || 'Your laboratory'}</strong><span>{role === 'ADMIN' ? 'Administrator' : role || 'Workspace member'}</span></div><span className="online-dot" /></div>
    <nav className="sidebar-menu">
      <div className="nav-group"><span className="nav-label">Workspace</span>{menuItems.map(renderItem)}</div>
      <div className="nav-group"><span className="nav-label">Administration</span>{role === 'ADMIN' && adminItems.map(renderItem)}{role !== 'ADMIN' && <div className="restricted-note"><ShieldCheck size={15} /><span>Admin tools are restricted</span></div>}</div>
    </nav>
    <div className="sidebar-footer">
      <button type="button" onClick={() => setDarkMode(!darkMode)} className="sidebar-action">{darkMode ? <Sun size={17} /> : <Moon size={17} />}<span>{darkMode ? 'Light theme' : 'Dark theme'}</span></button>
      <button type="button" onClick={() => onLogout?.()} className="sidebar-action danger-action"><span>Sign out</span></button>
      <div className="footer-copyright">ApexLab SaaS • v1.0</div>
    </div>
    <style>{`
      .sidebar-container{position:fixed;top:var(--header-height,64px);left:0;bottom:0;width:var(--sidebar-width);background:var(--panel-bg);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:18px 14px;backdrop-filter:blur(18px);z-index:100}.sidebar-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 18px}.brand-logo{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;box-shadow:0 8px 20px rgba(6,96,137,.18)}.brand-text h2{font-size:1.1rem;margin:0}.brand-text span{font-size:.68rem;color:var(--text);text-transform:uppercase;letter-spacing:.08em}.lab-switcher{display:flex;align-items:center;gap:10px;padding:11px;border:1px solid var(--border);border-radius:14px;background:rgba(148,163,184,.06);margin-bottom:18px;position:relative}.lab-avatar{width:32px;height:32px;border-radius:9px;background:var(--primary-light);color:var(--primary);display:grid;place-items:center;font-weight:800;font-size:.82rem}.lab-copy{display:grid;min-width:0;flex:1}.lab-copy strong{font-size:.76rem;color:var(--text-bold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.lab-copy span{font-size:.65rem;color:var(--text);text-transform:capitalize}.online-dot{width:7px;height:7px;background:var(--success);border-radius:50%;box-shadow:0 0 0 3px var(--success-bg)}.sidebar-menu{display:flex;flex-direction:column;gap:20px;overflow:auto;flex:1}.nav-group{display:grid;gap:4px}.nav-label{padding:0 10px 5px;font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--text);opacity:.75}.menu-btn{font-family:var(--font-sans);font-size:.78rem;font-weight:650;color:var(--text);background:transparent;border:0;padding:10px 11px;border-radius:11px;cursor:pointer;display:flex;align-items:center;gap:10px;text-align:left;width:100%;transition:.18s}.menu-btn:hover{background:rgba(6,96,137,.06);color:var(--text-bold)}.menu-btn.active{background:linear-gradient(90deg,var(--primary),hsl(174,86%,41%));color:#fff;box-shadow:0 8px 18px rgba(6,96,137,.17)}.restricted-note{display:flex;gap:8px;align-items:center;padding:9px 10px;color:var(--text);font-size:.67rem;opacity:.72}.sidebar-footer{display:grid;gap:6px;border-top:1px solid var(--border);padding-top:12px}.sidebar-action{font-family:var(--font-sans);display:flex;align-items:center;gap:9px;width:100%;padding:9px 11px;border:1px solid transparent;border-radius:10px;background:transparent;color:var(--text);cursor:pointer;font-size:.74rem;font-weight:700;text-align:left}.sidebar-action:hover{background:rgba(148,163,184,.08);color:var(--text-bold)}.danger-action{color:var(--danger)}.footer-copyright{text-align:center;font-size:.6rem;color:var(--text);padding-top:4px}@media(max-width:1024px){.sidebar-container{top:auto;right:0;bottom:0;width:100%;height:70px;padding:7px 10px;border-right:0;border-top:1px solid var(--border);flex-direction:row;align-items:center}.sidebar-brand,.lab-switcher,.nav-label,.sidebar-footer,.restricted-note{display:none}.sidebar-menu{width:100%;display:flex;flex-direction:row;gap:3px;overflow-x:auto}.nav-group{display:flex;flex:1;gap:2px}.nav-group:nth-child(2){display:contents}.menu-btn{justify-content:center;flex-direction:column;gap:3px;font-size:.58rem;padding:7px 4px;min-width:74px}.main-content{padding-left:0!important;padding-bottom:82px!important}}
    `}</style>
  </aside>;
}

import { Activity, FileText, PlusCircle, Settings as SettingsIcon, Sun, Moon, ActivitySquare, ClipboardList } from 'lucide-react';
import type { LabSettings } from '../data/samples';

export type DashboardTab = 'dashboard' | 'orders' | 'reports' | 'new-report' | 'settings';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  settings: LabSettings;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, settings, darkMode, setDarkMode, isAuthenticated, onLogout }: SidebarProps) {
  if (!isAuthenticated) return null;
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: ActivitySquare },
    { id: 'orders' as const, label: 'Orders & Results', icon: ClipboardList },
    { id: 'reports' as const, label: 'Patient Register', icon: FileText },
    { id: 'new-report' as const, label: 'Legacy Report', icon: PlusCircle },
    { id: 'settings' as const, label: 'Lab Settings', icon: SettingsIcon },
  ];
  return <aside className="sidebar-container">
    <div className="sidebar-brand"><div className="brand-logo"><Activity size={26} /></div><div className="brand-text"><h2>ApexLab</h2><span>Reporting System</span></div></div>
    <div className="lab-indicator"><div className="indicator-dot" /><p className="lab-name-truncate">{settings.labName}</p></div>
    <nav className="sidebar-menu">{menuItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setActiveTab(item.id)} className={`menu-btn ${activeTab === item.id ? 'active' : ''}`}><Icon size={20} /><span>{item.label}</span></button>; })}</nav>
    <div className="sidebar-footer"><button onClick={() => onLogout?.()} className="theme-toggle-btn"><span>Logout</span></button><button onClick={() => setDarkMode(!darkMode)} className="theme-toggle-btn">{darkMode ? <><Sun size={18} /><span>Light Mode</span></> : <><Moon size={18} /><span>Dark Mode</span></>}</button><div className="footer-copyright">v1.0.5 • NABL Compliant</div></div>
    <style>{`.sidebar-container{position:fixed;top:var(--header-height,0px);left:0;bottom:0;width:var(--sidebar-width);background:var(--panel-bg);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:1.75rem 1.25rem;backdrop-filter:blur(12px);z-index:100}.sidebar-brand{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem;padding-left:.5rem}.brand-logo{background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center}.brand-text h2{font-family:var(--font-heading);font-size:1.25rem;font-weight:700;color:var(--text-bold);margin:0}.brand-text span{font-size:.75rem;color:var(--text);letter-spacing:.5px;text-transform:uppercase}.lab-indicator{background:var(--primary-light);border:1px solid rgba(6,96,137,.1);border-radius:var(--border-radius-md);padding:.75rem 1rem;display:flex;align-items:center;gap:.75rem;margin-bottom:2rem}.indicator-dot{width:8px;height:8px;background:var(--secondary);border-radius:50%;flex-shrink:0}.lab-name-truncate{font-size:.85rem;font-weight:600;color:var(--primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0}.sidebar-menu{display:flex;flex-direction:column;gap:.375rem;flex:1}.menu-btn{font-family:var(--font-sans);font-size:.9rem;font-weight:500;color:var(--text);background:transparent;border:0;padding:.8rem .85rem;border-radius:var(--border-radius-md);cursor:pointer;display:flex;align-items:center;gap:.85rem;text-align:left;width:100%}.menu-btn:hover{background:rgba(6,96,137,.04);color:var(--text-bold)}.menu-btn.active{background:var(--primary);color:white;font-weight:600;box-shadow:0 4px 12px rgba(6,96,137,.15)}.sidebar-footer{margin-top:auto;display:flex;flex-direction:column;gap:1rem;border-top:1px solid var(--border);padding-top:1.25rem}.theme-toggle-btn{font-family:var(--font-heading);font-weight:600;font-size:.9rem;color:var(--text-bold);background:rgba(148,163,184,.06);border:1px solid var(--border);border-radius:var(--border-radius-md);padding:.75rem 1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.75rem}.footer-copyright{font-size:.7rem;color:var(--text);text-align:center}@media(max-width:1024px){.sidebar-container{width:100%;height:auto;flex-direction:row;align-items:center;justify-content:space-between;padding:.75rem 1.5rem;bottom:auto;border-right:0;border-bottom:1px solid var(--border)}.sidebar-brand{margin-bottom:0}.lab-indicator,.footer-copyright{display:none}.sidebar-menu{flex-direction:row;position:fixed;bottom:0;left:0;right:0;background:var(--panel-bg);border-top:1px solid var(--border);padding:.5rem 1rem;justify-content:space-around}.menu-btn{flex-direction:column;align-items:center;gap:.25rem;font-size:.65rem;padding:.5rem;width:auto}.sidebar-footer{margin-top:0;padding-top:0;border-top:0}.theme-toggle-btn{padding:.5rem;border-radius:50%}.theme-toggle-btn span{display:none}}`}</style>
  </aside>;
}

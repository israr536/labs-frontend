import { 
  Activity, 
  FileText, 
  PlusCircle, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  ActivitySquare
} from 'lucide-react';
import type { LabSettings } from '../data/samples';

interface SidebarProps {
  activeTab: 'dashboard' | 'reports' | 'new-report' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'reports' | 'new-report' | 'settings') => void;
  settings: LabSettings;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  settings, 
  darkMode, 
  setDarkMode,
  isAuthenticated,
  onLogout,
}: SidebarProps) {
  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: ActivitySquare },
    { id: 'reports' as const, label: 'Patient Register', icon: FileText },
    { id: 'new-report' as const, label: 'New Lab Report', icon: PlusCircle },
    { id: 'settings' as const, label: 'Lab Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar-container">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Activity size={26} className="logo-pulse" />
        </div>
        <div className="brand-text">
          <h2>ApexLab</h2>
          <span>Reporting System</span>
        </div>
      </div>

      <div className="lab-indicator">
        <div className="indicator-dot"></div>
        <p className="lab-name-truncate">{settings.labName}</p>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`menu-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {isAuthenticated ? (
          <button onClick={() => onLogout && onLogout()} className="theme-toggle-btn">
            <span>Logout</span>
          </button>
        ) : null}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle-btn"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        <div className="footer-copyright">
          v1.0.4 • NABL Compliant
        </div>
      </div>

      <style>{`
        .sidebar-container {
          position: fixed;
          top: var(--header-height, 0px);
          left: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: var(--panel-bg);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.75rem 1.25rem;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 100;
          box-shadow: 2px 0 12px rgba(15, 23, 42, 0.02);
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          padding-left: 0.5rem;
        }

        .brand-logo {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(6, 96, 137, 0.2);
        }

        .logo-pulse {
          animation: pulse 2.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }

        .brand-text h2 {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-bold);
          letter-spacing: -0.5px;
        }

        .brand-text span {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .lab-indicator {
          background: var(--primary-light);
          border: 1px solid rgba(6, 96, 137, 0.1);
          border-radius: var(--border-radius-md);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          transition: background 0.3s ease;
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          background: var(--secondary);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--secondary);
          flex-shrink: 0;
        }

        .lab-name-truncate {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          flex: 1;
        }

        .menu-btn {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text);
          background: transparent;
          border: none;
          padding: 0.85rem 1rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
          width: 100%;
          transition: all 0.2s ease;
        }

        .menu-btn:hover {
          background: rgba(6, 96, 137, 0.04);
          color: var(--text-bold);
        }

        .dark-theme .menu-btn:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .menu-btn.active {
          background: var(--primary);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(6, 96, 137, 0.15);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1.25rem;
        }

        .theme-toggle-btn {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-bold);
          background: rgba(148, 163, 184, 0.06);
          border: 1px solid var(--border);
          border-radius: var(--border-radius-md);
          padding: 0.75rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          background: rgba(148, 163, 184, 0.12);
        }

        .footer-copyright {
          font-size: 0.7rem;
          color: var(--text);
          text-align: center;
          font-weight: 500;
          letter-spacing: 0.25px;
        }

        @media (max-width: 1024px) {
          .sidebar-container {
            width: 100%;
            height: auto;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1.5rem;
            bottom: auto;
            border-right: none;
            border-bottom: 1px solid var(--border);
          }

          .sidebar-brand {
            margin-bottom: 0;
          }

          .lab-indicator, .footer-copyright {
            display: none;
          }

          .sidebar-menu {
            flex-direction: row;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--panel-bg);
            border-top: 1px solid var(--border);
            padding: 0.5rem 1rem;
            justify-content: space-around;
            backdrop-filter: blur(12px);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
          }

          .menu-btn {
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.7rem;
            padding: 0.5rem;
            width: auto;
          }

          .menu-btn span {
            display: block;
          }

          .sidebar-footer {
            margin-top: 0;
            padding-top: 0;
            border-top: none;
          }

          .theme-toggle-btn {
            padding: 0.5rem;
            border-radius: 50%;
          }
          
          .theme-toggle-btn span {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}

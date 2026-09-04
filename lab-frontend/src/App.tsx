import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar, { type DashboardTab } from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ReportList from './components/ReportList';
import ReportEditor from './components/ReportEditor';
import SettingsPanel from './components/SettingsPanel';
import ReportPrintView from './components/ReportPrintView';
import Login from './components/Login';
import Landing from './components/Landing';
import Signup from './components/Signup';
import Modal from './components/Modal';
import Header from './components/Header';
import Footer from './components/Footer';
import SubscriptionCard from './components/SubscriptionCard';
import TeamPage from './pages/TeamPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import OrdersPage from './pages/OrdersPage';
import { ToastProvider } from './components/Toast';
import { DEFAULT_SETTINGS } from './data/samples';
import type { LabReport, LabSettings } from './data/samples';
import reportsService from './services/reportsService';
import labsService from './services/labsService';
import authService from './services/authService';
import subscriptionService, { type SubscriptionStatus } from './services/subscriptionService';

interface SessionUser { id: string; username?: string; email?: string; role?: string; isActive?: boolean; }

function LoadingScreen() { return <div className="app-loading"><div className="loading-mark"><span /></div><strong>Loading your workspace</strong><small>Securely connecting to ApexLab…</small></div>; }

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [reports, setReports] = useState<LabReport[]>([]);
  const [settings, setSettings] = useState<LabSettings>(DEFAULT_SETTINGS);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<LabReport | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [printData] = useState<LabReport | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => { await authService.logout(); setUser(null); setIsAuthenticated(false); setAuthView('landing'); setReports([]); navigate('/', { replace: true }); };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try { const meResult = await authService.me(); if (mounted && meResult?.user) { setUser(meResult.user); setIsAuthenticated(true); } }
      catch { if (mounted) { setUser(null); setIsAuthenticated(false); } }
      finally { if (mounted) setAuthLoading(false); }
      try { const savedTheme = localStorage.getItem('apex_lab_theme'); if (mounted && savedTheme) setDarkMode(savedTheme === 'dark'); } catch { /* Browser storage can be unavailable. */ }
    };
    void init(); return () => { mounted = false; };
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark-theme', darkMode); try { localStorage.setItem('apex_lab_theme', darkMode ? 'dark' : 'light'); } catch { /* no-op */ } }, [darkMode]);

  const { data: reportsData, refetch: refetchReports } = useQuery({ queryKey: ['reports'], enabled: isAuthenticated, queryFn: () => reportsService.listReports() });
  const { data: settingsData, refetch: refetchSettings } = useQuery({ queryKey: ['settings'], enabled: isAuthenticated, queryFn: () => labsService.getSettings() });
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionStatus>({ queryKey: ['subscription'], enabled: isAuthenticated, queryFn: () => subscriptionService.getStatus(), staleTime: 60_000 });

  useEffect(() => { if (reportsData) setReports((Array.isArray(reportsData) ? reportsData : reportsData.data || []) as LabReport[]); }, [reportsData]);
  useEffect(() => { if (settingsData) setSettings(settingsData as LabSettings); }, [settingsData]);

  const showLogin = () => { setAuthView('login'); navigate('/login'); };
  const showSignup = () => { setAuthView('signup'); navigate('/signup'); };
  const handleLoginSuccess = (nextUser: SessionUser) => { setUser(nextUser); setIsAuthenticated(true); setAuthView('landing'); setActiveTab('dashboard'); navigate('/dashboard', { replace: true }); };
  const handleSaveReport = async (report: LabReport) => { setReports((current) => current.some((item) => item.id === report.id) ? current.map((item) => item.id === report.id ? report : item) : [report, ...current]); setEditingReport(null); setSelectedReportId(report.id); setActiveTab('reports'); await refetchReports(); };
  const handleDeleteReport = async (id: string) => { await reportsService.deleteReport(id); setReports((current) => current.filter((report) => report.id !== id)); if (selectedReportId === id) setSelectedReportId(null); await refetchReports(); };
  const handleSaveSettings = async (nextSettings: LabSettings) => { const saved = await labsService.updateSettings(nextSettings); const merged = { ...nextSettings, ...saved }; setSettings(merged); try { localStorage.setItem('apex_lab_settings', JSON.stringify(merged)); } catch { /* no-op */ } await refetchSettings(); };

  if (authLoading) return <ToastProvider><LoadingScreen /><style>{`.app-loading{min-height:100vh;width:100%;display:grid;place-items:center;align-content:center;gap:7px;background:var(--bg,#f5f8fa);color:var(--text);font-family:var(--font-sans,system-ui)}.app-loading strong{color:var(--text-bold);font-size:.9rem}.app-loading small{font-size:.72rem}.loading-mark{width:48px;height:48px;border-radius:15px;background:linear-gradient(135deg,var(--primary,#066089),var(--secondary,#0eb89d));display:grid;place-items:center;box-shadow:0 12px 30px rgba(6,96,137,.2);margin-bottom:5px}.loading-mark span{width:19px;height:19px;border:3px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%;animation:load-spin .8s linear infinite}@keyframes load-spin{to{transform:rotate(360deg)}}`}</style></ToastProvider>;

  const dashboardRoute = isAuthenticated && location.pathname === '/dashboard';
  const dashboardPage = isAuthenticated ? <>
    {activeTab === 'dashboard' && <div className="saas-dashboard"><div className="saas-dashboard-heading"><div><span className="saas-eyebrow">Laboratory workspace</span><h1>Good to see you, {user?.username?.split('@')[0] || 'there'}.</h1><p>Monitor your lab operations, reports and workspace usage from one place.</p></div><div className="workspace-badge"><span />Workspace online</div></div><SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => setActiveTab('billing')} /><DashboardOverview reports={reports} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} /></div>}
    {activeTab === 'orders' && <OrdersPage role={user?.role} />}
    {activeTab === 'reports' && <ReportList reports={reports} settings={settings} onDeleteReport={handleDeleteReport} onEditReport={(report) => { setEditingReport(report); setActiveTab('new-report'); }} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />}
    {activeTab === 'new-report' && <ReportEditor editingReport={editingReport} onSaveReport={handleSaveReport} onCancel={() => { setEditingReport(null); setActiveTab('reports'); }} />}
    {activeTab === 'users' && user?.role === 'ADMIN' && <TeamPage />}
    {activeTab === 'billing' && <div className="saas-page"><div className="saas-page-header"><div><span className="saas-eyebrow">Workspace administration</span><h1>Plan & usage</h1><p>See your current plan, usage limits and subscription status.</p></div><button className="saas-secondary-btn" onClick={() => navigate('/pricing')}>Compare plans</button></div><SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => navigate('/pricing')} /><div className="billing-note"><strong>Usage limits are enforced by the server.</strong><span>This dashboard is informational; creating data is always checked against the current subscription on the backend.</span></div></div>}
    {activeTab === 'settings' && user?.role === 'ADMIN' && <SettingsPanel settings={settings} onSaveSettings={handleSaveSettings} />}
  </> : <Navigate to="/" replace />;

  return <ToastProvider><div className="app-container"><Header onLogin={showLogin} onSignup={showSignup} isAuthenticated={isAuthenticated} userName={user?.email ?? user?.username ?? null} onLogout={handleLogout} />{dashboardRoute && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={settings} darkMode={darkMode} setDarkMode={setDarkMode} role={user?.role} isAuthenticated={isAuthenticated} onLogout={handleLogout} />}<main className="main-content" style={{ paddingTop: 'var(--header-height, 64px)', paddingLeft: dashboardRoute ? 'var(--sidebar-width, 260px)' : '0' }}><Routes><Route path="/pricing" element={<PricingPage />} /><Route path="/privacy" element={<PrivacyPolicyPage />} /><Route path="/about" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/login" element={<Modal onClose={() => navigate('/')} title="Sign in"><Login onLoginSuccess={handleLoginSuccess} /></Modal>} /><Route path="/signup" element={<Modal onClose={() => navigate('/')} title="Create account"><Signup onSignupSuccess={() => { setAuthView('login'); navigate('/login'); }} onCancel={() => navigate('/')} /></Modal>} /><Route path="/dashboard" element={dashboardPage} /><Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : authView === 'login' ? <Modal onClose={() => navigate('/')} title="Sign in"><Login onLoginSuccess={handleLoginSuccess} /></Modal> : authView === 'signup' ? <Modal onClose={() => navigate('/')} title="Create account"><Signup onSignupSuccess={() => { setAuthView('login'); navigate('/login'); }} onCancel={() => navigate('/')} /> : <Landing onLoginClick={showLogin} onSignupClick={showSignup} />} /><Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} /></Routes><Footer /></main>{printData && <ReportPrintView report={printData} settings={settings} />}<style>{`.saas-dashboard{max-width:1240px;margin:0 auto;padding:26px 28px 70px;display:grid;gap:18px}.saas-dashboard-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}.saas-dashboard-heading h1{font-size:clamp(1.75rem,3vw,2.3rem);margin:4px 0 5px}.saas-dashboard-heading p{margin:0;color:var(--text);font-size:.82rem}.saas-eyebrow{font-size:.65rem;text-transform:uppercase;letter-spacing:.14em;font-weight:850;color:var(--primary)}.workspace-badge{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--border);background:var(--panel-bg);border-radius:999px;padding:8px 11px;color:var(--text);font-size:.68rem;font-weight:750}.workspace-badge span{width:6px;height:6px;background:var(--success);border-radius:50%;box-shadow:0 0 0 3px var(--success-bg)}.saas-page{max-width:1240px;margin:0 auto;padding:26px 28px 70px;display:grid;gap:18px}.saas-page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.saas-page-header h1{font-size:clamp(1.75rem,3vw,2.3rem);margin:4px 0 5px}.saas-page-header p{margin:0;color:var(--text);font-size:.82rem}.saas-secondary-btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--border);background:var(--panel-bg);color:var(--text-bold);border-radius:11px;padding:10px 14px;font-size:.75rem;font-weight:800;cursor:pointer}.billing-note{display:grid;gap:4px;padding:16px;border:1px solid var(--border);border-radius:15px;background:var(--panel-bg);font-size:.74rem}.billing-note strong{color:var(--text-bold)}.billing-note span{color:var(--text)}@media(max-width:720px){.saas-dashboard,.saas-page{padding:18px 14px 90px}.saas-dashboard-heading,.saas-page-header{align-items:flex-start;flex-direction:column}.workspace-badge{align-self:flex-start}}`}</style></div></ToastProvider>;
}

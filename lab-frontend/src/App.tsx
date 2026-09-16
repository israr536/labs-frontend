import { lazy, Suspense, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar, { type DashboardTab } from './components/Sidebar';
const DashboardOverview = lazy(() => import('./components/DashboardOverview'));
const ReportList = lazy(() => import('./components/ReportList'));
const DynamicReportEditor = lazy(() => import('./components/DynamicReportEditor'));
const SettingsPanel = lazy(() => import('./components/SettingsPanel'));
import ReportPrintView from './components/ReportPrintView';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Landing from './components/Landing';
import Signup from './components/Signup';
import Modal from './components/Modal';
import Header from './components/Header';
import Footer from './components/Footer';
import SubscriptionCard from './components/SubscriptionCard';
import { ToastProvider } from './components/Toast';
import { DEFAULT_SETTINGS, type LabReport, type LabSettings } from './data/samples';
import reportsService from './services/reportsService';
import labsService from './services/labsService';
import authService from './services/authService';
import subscriptionService, { type SubscriptionStatus } from './services/subscriptionService';

const TeamPage = lazy(() => import('./pages/TeamPage'));
const TestCatalogPage = lazy(() => import('./pages/TestCatalogPage'));
const TestConfigurationPage = lazy(() => import('./pages/TestConfigurationPageV2'));
const CriticalResultsPage = lazy(() => import('./pages/CriticalResultsPage'));
const ReportTemplatesPage = lazy(() => import('./pages/ReportTemplatesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsAndConditionsPage = lazy(() => import('./pages/TermsAndConditionsPage'));
const OrdersWorkspace = lazy(() => import('./pages/OrdersWorkspaceV2'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const SolutionsPage = lazy(() => import('./pages/SolutionsPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
import WhatsAppButton from './components/WhatsAppButton';

interface SessionUser { id: string; username?: string; email?: string; role?: string; isActive?: boolean; }

function LoadingScreen() {
  return <div className="app-loading"><div className="loading-mark"><span /></div><strong>Loading your workspace</strong><small>Securely connecting to ApexLab…</small></div>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [settings, setSettings] = useState<LabSettings>(DEFAULT_SETTINGS);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<LabReport | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [printData] = useState<LabReport | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'forgot-password'>('landing');

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const closeAuthModal = () => { setAuthView('landing'); navigate('/'); };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthView('landing');
    setSelectedReportId(null);
    setEditingReport(null);
    queryClient.clear();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const meResult = await authService.me();
        if (mounted && meResult?.user) {
          setUser(meResult.user);
          setIsAuthenticated(true);
        }
      } catch {
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }

      try {
        const savedTheme = localStorage.getItem('apex_lab_theme');
        if (mounted && savedTheme) setDarkMode(savedTheme === 'dark');
      } catch { /* localStorage can be unavailable in privacy-restricted browsers */ }
    };
    void init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', darkMode);
    try { localStorage.setItem('apex_lab_theme', darkMode ? 'dark' : 'light'); } catch { /* ignore storage failures */ }
  }, [darkMode]);

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    enabled: isAuthenticated,
    queryFn: () => labsService.getSettings(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const subscriptionEnabled = isAuthenticated && location.pathname === '/dashboard';
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionStatus>({
    queryKey: ['subscription'],
    enabled: subscriptionEnabled,
    queryFn: () => subscriptionService.getStatus(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const currentSettings = settingsData ? settingsData as LabSettings : settings;

  const showLogin = () => { setAuthView('login'); navigate('/login'); };
  const showSignup = () => { setAuthView('signup'); navigate('/signup'); };
  const showForgotPassword = () => { setAuthView('forgot-password'); navigate('/forgot-password'); };

  const handleLoginSuccess = (nextUser: SessionUser) => {
    setUser(nextUser);
    setIsAuthenticated(true);
    setAuthView('landing');
    setActiveTab('dashboard');
    queryClient.clear();
    navigate('/dashboard', { replace: true });
  };

  const handleSaveReport = async (report: LabReport) => {
    setEditingReport(null);
    setSelectedReportId(report.id);
    queryClient.setQueryData(['report', report.id], report);
    await queryClient.invalidateQueries({ queryKey: ['reports'] });
    setActiveTab('reports');
  };

  const handleDeleteReport = async (id: string) => {
    await reportsService.deleteReport(id);
    queryClient.removeQueries({ queryKey: ['report', id] });
    await queryClient.invalidateQueries({ queryKey: ['reports'] });
    if (selectedReportId === id) setSelectedReportId(null);
  };

  const handleSaveSettings = async (nextSettings: LabSettings) => {
    const saved = await labsService.updateSettings(nextSettings);
    setSettings(saved);
    queryClient.setQueryData(['settings'], saved);
  };

  if (authLoading) return <ToastProvider><LoadingScreen /></ToastProvider>;

  const dashboardRoute = isAuthenticated && location.pathname === '/dashboard';
  const dashboardPage = isAuthenticated ? <>
    {activeTab === 'dashboard' && (
      <div className="saas-dashboard">
        <div className="saas-dashboard-heading">
          <div><span className="saas-eyebrow">Laboratory workspace</span><h1>Good to see you, {user?.username?.split('@')[0] || 'there'}.</h1><p>Monitor your lab operations, reports and workspace usage from one place.</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button className="saas-secondary-btn" onClick={() => navigate('/report-templates')}>Report Templates</button><div className="workspace-badge"><span />Workspace online</div></div>
        </div>
        <SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => setActiveTab('billing')} />
        <DashboardOverview setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />
      </div>
    )}
    {activeTab === 'orders' && <OrdersWorkspace role={user?.role} />}
    {activeTab === 'patients' && <PatientsPage role={user?.role} />}
    {activeTab === 'critical-results' && <CriticalResultsPage role={user?.role} />}
    {activeTab === 'reports' && <ReportList settings={currentSettings} onDeleteReport={handleDeleteReport} onEditReport={report => { setEditingReport(report); setActiveTab('new-report'); }} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />}
    {activeTab === 'new-report' && <DynamicReportEditor editingReport={editingReport} onSaveReport={handleSaveReport} onCancel={() => { setEditingReport(null); setActiveTab('reports'); }} />}
    {activeTab === 'tests' && user?.role === 'ADMIN' && <TestCatalogPage role={user.role} />}
    {activeTab === 'test-configuration' && <TestConfigurationPage />}
    {activeTab === 'users' && user?.role === 'ADMIN' && <TeamPage />}
    {activeTab === 'audit' && <AuditLogPage />}
    {activeTab === 'billing' && (
      <div className="saas-page"><div className="saas-page-header"><div><span className="saas-eyebrow">Workspace administration</span><h1>Plan & usage</h1><p>See your current plan, usage limits and subscription status.</p></div><button className="saas-secondary-btn" onClick={() => navigate('/pricing')}>Compare plans</button></div><SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => setActiveTab('billing')} /><div className="billing-note"><strong>Usage limits are enforced by the server.</strong><span>This dashboard is informational; creating data is always checked against the current subscription on the backend.</span></div></div>
    )}
    {activeTab === 'settings' && user?.role === 'ADMIN' && <SettingsPanel settings={currentSettings} onSaveSettings={handleSaveSettings} />}
  </> : <Navigate to="/" replace />;

  return <ToastProvider>
    <div className="app-container">
      <Header onLogin={showLogin} onSignup={showSignup} isAuthenticated={isAuthenticated} userName={user?.email ?? user?.username ?? null} onLogout={handleLogout} />
      {dashboardRoute && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={currentSettings} darkMode={darkMode} setDarkMode={setDarkMode} role={user?.role} isAuthenticated={isAuthenticated} onLogout={handleLogout} />}
      <main id="main-content" className="main-content">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/report-templates" element={isAuthenticated ? <ReportTemplatesPage /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Modal onClose={closeAuthModal} title="Sign in" description="Access your laboratory workspace securely."><Login onLoginSuccess={handleLoginSuccess} onForgotPassword={showForgotPassword} /></Modal>} />
            <Route path="/forgot-password" element={<Modal onClose={closeAuthModal} title="Reset password" description="Recover access to your laboratory workspace securely."><ForgotPassword onBackToLogin={showForgotPassword} /></Modal>} />
            <Route path="/signup" element={<Modal onClose={closeAuthModal} title="Create your account" description="Start your laboratory workspace in a few minutes."><Signup onSignupSuccess={() => { setAuthView('login'); navigate('/login'); }} onCancel={closeAuthModal} /></Modal>} />
            <Route path="/dashboard" element={dashboardPage} />
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : authView === 'login' ? <Modal onClose={closeAuthModal} title="Sign in"><Login onLoginSuccess={handleLoginSuccess} onForgotPassword={showForgotPassword} /></Modal> : authView === 'signup' ? <Modal onClose={closeAuthModal} title="Create your account"><Signup onSignupSuccess={() => { setAuthView('login'); navigate('/login'); }} onCancel={closeAuthModal} /></Modal> : authView === 'forgot-password' ? <Modal onClose={closeAuthModal} title="Reset password"><ForgotPassword onBackToLogin={showForgotPassword} /></Modal> : <Landing onLoginClick={showLogin} onSignupClick={showSignup} />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </main>
      {printData && <ReportPrintView report={printData} settings={currentSettings} />}
      <WhatsAppButton />
    </div>
  </ToastProvider>;
}

import { ArrowRight, CreditCard } from 'lucide-react';
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
import { clearTokens } from './services/api';
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
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage'));
const BuyerGuidePage = lazy(() => import('./pages/BuyerGuidePage'));
import WhatsAppButton from './components/WhatsAppButton';
import RazorpayPlans from './components/RazorpayPlans';

interface SessionUser { id: string; username?: string; email?: string; role?: string; isActive?: boolean; }

function LoadingScreen() {
  return <div className="app-loading"><div className="loading-mark"><span /></div><strong>Loading your workspace</strong><small>Securely connecting to PathMLT…</small></div>;
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
    const handleAuthExpired = () => {
      clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setAuthView('landing');
      setSelectedReportId(null);
      setEditingReport(null);
      queryClient.clear();
      navigate('/', { replace: true });
    };

    window.addEventListener('lab:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('lab:auth-expired', handleAuthExpired);
  }, [navigate, queryClient]);

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
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const handleSubscriptionPaymentSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['subscription'] });
    await queryClient.refetchQueries({ queryKey: ['subscription'], type: 'active' });
  };

  const subscriptionExpired = subscription?.status === 'expired';

  useEffect(() => {
    if (subscriptionExpired && activeTab !== 'billing') {
      setActiveTab('billing');
    }
  }, [subscriptionExpired, activeTab]);

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

  // Public routes should not wait for session restoration. Only keep the
  // protected dashboard behind the loading screen while /auth/me resolves.
  if (authLoading && location.pathname === '/dashboard') {
    return <ToastProvider><LoadingScreen /></ToastProvider>;
  }

  const dashboardRoute = isAuthenticated && location.pathname === '/dashboard';
  const dashboardPage = isAuthenticated ? <>
    {subscriptionExpired ? (
      <div className="saas-page subscription-required-page">
        <div className="subscription-required-card">
          <div className="subscription-required-icon"><CreditCard size={28} /></div>
          <span className="saas-eyebrow">Subscription required</span>
          <h1>Your 30-day free trial has ended</h1>
          <p>
            Your laboratory workspace and data are safe. Choose a Monthly or Yearly subscription
            to restore access to reports, patients, tests and other workspace features.
          </p>
          <div className="subscription-required-actions">
            <button className="landing-primary" type="button" onClick={() => navigate('/pricing')}>
              Choose a subscription <ArrowRight size={16} />
            </button>
            <button className="saas-secondary-btn" type="button" onClick={() => setActiveTab('billing')}>
              View billing
            </button>
          </div>
        </div>
        <SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => navigate('/pricing')} />
        <RazorpayPlans onSuccess={handleSubscriptionPaymentSuccess} />
      </div>
    ) : null}
    {!subscriptionExpired && activeTab === 'dashboard' && (
      <div className="saas-dashboard">
        <div className="saas-dashboard-heading">
          <div><span className="saas-eyebrow">Laboratory workspace</span><h1>Good to see you, {user?.username?.split('@')[0] || 'there'}.</h1><p>Monitor your lab operations, reports and workspace usage from one place.</p></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><button className="saas-secondary-btn" onClick={() => navigate('/report-templates')}>Report Templates</button><div className="workspace-badge"><span />Workspace online</div></div>
        </div>
        <SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => setActiveTab('billing')} />
        <DashboardOverview setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId} />
      </div>
    )}
    {!subscriptionExpired && activeTab === 'orders' && <OrdersWorkspace role={user?.role} />}
    {!subscriptionExpired && activeTab === 'patients' && <PatientsPage role={user?.role} />}
    {!subscriptionExpired && activeTab === 'critical-results' && <CriticalResultsPage role={user?.role} />}
    {!subscriptionExpired && activeTab === 'reports' && <ReportList onDeleteReport={handleDeleteReport} onEditReport={report => { setEditingReport(report); setActiveTab('new-report'); }} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId} />}
    {!subscriptionExpired && activeTab === 'new-report' && <DynamicReportEditor editingReport={editingReport} onSaveReport={handleSaveReport} onCancel={() => { setEditingReport(null); setActiveTab('reports'); }} />}
    {!subscriptionExpired && activeTab === 'tests' && user?.role === 'ADMIN' && <TestCatalogPage role={user.role} />}
    {!subscriptionExpired && activeTab === 'test-configuration' && <TestConfigurationPage />}
    {!subscriptionExpired && activeTab === 'users' && user?.role === 'ADMIN' && <TeamPage />}
    {!subscriptionExpired && activeTab === 'audit' && <AuditLogPage />}
    {activeTab === 'billing' && (
      <div className="saas-page"><div className="saas-page-header"><div><span className="saas-eyebrow">Workspace administration</span><h1>Plan & usage</h1><p>See your current plan, usage limits and subscription status.</p></div><button className="saas-secondary-btn" onClick={() => navigate('/pricing')}>Compare plans</button></div><SubscriptionCard subscription={subscription ?? null} loading={subscriptionLoading} onUpgrade={() => setActiveTab('billing')} /><RazorpayPlans onSuccess={handleSubscriptionPaymentSuccess} /><div className="billing-note"><strong>30-day free trial, then paid subscription.</strong><span>Choose Monthly or Yearly to continue after the trial. Payments are processed securely through Razorpay.</span></div></div>
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
            <Route path="/pricing" element={<PricingPage isAuthenticated={isAuthenticated} onSignup={showSignup} />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            {['laboratory-reporting-software','diagnostic-lab-software','pathology-lab-software','laboratory-management-software','lab-reporting-system','pathology-reporting-software','lims-software','lab-automation-software','patient-management','test-management','sample-management','result-entry','result-verification','lab-reporting','reference-ranges','audit-trail','role-based-access','pdf-reports','pathology-labs','diagnostic-labs','hospital-labs','independent-labs'].map(path => <Route key={path} path={'/'+path} element={<SeoLandingPage pageKey={path as import('./pages/SeoLandingPage').SeoPageKey} />} />)}
            <Route path="/resources/:slug" element={<BuyerGuidePage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsAndConditionsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faqs" element={<FaqPage />} />
            <Route path="/report-templates" element={isAuthenticated ? <ReportTemplatesPage /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Modal onClose={closeAuthModal} title="Login" description="Access your laboratory workspace securely."><Login onLoginSuccess={handleLoginSuccess} onForgotPassword={showForgotPassword} onSignup={showSignup} /></Modal>} />
            <Route path="/forgot-password" element={<Modal onClose={closeAuthModal} title="Reset password" description="Recover access to your laboratory workspace securely."><ForgotPassword onBackToLogin={showLogin} /></Modal>} />
            <Route path="/signup" element={<Modal onClose={closeAuthModal} title="Create your account" description="Start your laboratory workspace in a few minutes."><Signup onSignupSuccess={handleLoginSuccess} onCancel={closeAuthModal} /></Modal>} />
            <Route path="/dashboard" element={dashboardPage} />
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : authView === 'login' ? <Modal onClose={closeAuthModal} title="Login"><Login onLoginSuccess={handleLoginSuccess} onForgotPassword={showForgotPassword} onSignup={showSignup} /></Modal> : authView === 'signup' ? <Modal onClose={closeAuthModal} title="Create your account"><Signup onSignupSuccess={handleLoginSuccess} onCancel={closeAuthModal} /> </Modal> : authView === 'forgot-password' ? <Modal onClose={closeAuthModal} title="Reset password"><ForgotPassword onBackToLogin={showLogin} /></Modal> : <Landing onLoginClick={showLogin} onSignupClick={showSignup} />} />
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

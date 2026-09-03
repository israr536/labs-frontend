import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
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
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Footer from './components/Footer';
import PricingPage from './pages/PricingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { ToastProvider } from './components/Toast';

import { DEFAULT_SETTINGS } from './data/samples';

import type {
  LabReport,
  LabSettings,
} from './data/samples';

import reportsService from './services/reportsService';
import labsService from './services/labsService';
import authService from './services/authService';
// import logger from './utils/logger';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reports' | 'new-report' | 'settings'
  >('dashboard');

  const [reports, setReports] = useState<LabReport[]>([]);
  const [settings, setSettings] =
    useState<LabSettings>(DEFAULT_SETTINGS);

  const [selectedReportId, setSelectedReportId] =
    useState<string | null>(null);

  const [editingReport, setEditingReport] =
    useState<LabReport | null>(null);

  const [darkMode, setDarkMode] = useState(false);

  const [printData] = useState<LabReport | null>(null);

  const [user, setUser] = useState<any>(null);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await authService.logout?.().catch?.(() => {}); } catch {}
    setUser(null);
    setIsAuthenticated(false);
    setAuthView('landing');
    try { localStorage.removeItem('apex_lab_reports'); localStorage.removeItem('apex_lab_settings'); } catch {}
    navigate('/', { replace: true });
  };

  useEffect(() => {
    async function init() {
      try {
        const meResult = await authService.me().catch(() => null);

        if (meResult) {
          setUser(meResult.user ?? meResult);
          setIsAuthenticated(true);
        }
      } catch {}

      const savedSettings = localStorage.getItem(
        'apex_lab_settings'
      );

      setSettings(
        savedSettings
          ? JSON.parse(savedSettings)
          : DEFAULT_SETTINGS
      );

      const savedTheme = localStorage.getItem(
        'apex_lab_theme'
      );

      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      }
    }

    init();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark-theme',
      darkMode
    );

    localStorage.setItem(
      'apex_lab_theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  const { data: reportsData, refetch: refetchReports } = useQuery({
    queryKey: ['reports', isAuthenticated],
    enabled: isAuthenticated,
    queryFn: () => reportsService.listReports(),
  });

  const { data: settingsData, refetch: refetchSettings } = useQuery({
    queryKey: ['settings', isAuthenticated],
    enabled: isAuthenticated,
    queryFn: () => labsService.getSettings(),
  });

  useEffect(() => {
    if (reportsData) {
      const data = Array.isArray(reportsData) ? reportsData : reportsData.data || [];
      setReports(data as LabReport[]);
    }
  }, [reportsData]);

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData as LabSettings);
    }
  }, [settingsData]);

  useEffect(() => {
    if (isAuthenticated) {
      refetchReports();
      refetchSettings();
    }
  }, [isAuthenticated, refetchReports, refetchSettings]);

  const showLogin = () => {
    setAuthView('login');
    navigate('/login');
  };

  const showSignup = () => {
    setAuthView('signup');
    navigate('/signup');
  };

  const handleSaveReport = async (report: LabReport) => {
    setReports((current) => {
      const exists = current.some((item) => item.id === report.id);
      return exists
        ? current.map((item) => (item.id === report.id ? report : item))
        : [report, ...current];
    });
    setEditingReport(null);
    setSelectedReportId(report.id);
    setActiveTab('reports');
    await refetchReports();
  };

  const handleDeleteReport = async (id: string) => {
    await reportsService.deleteReport(id);
    setReports((current) => current.filter((report) => report.id !== id));
    if (selectedReportId === id) {
      setSelectedReportId(null);
    }
    await refetchReports();
  };

  const handleEditReport = (report: LabReport) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };

  const handleSaveSettings = async (nextSettings: LabSettings) => {
    const saved = await labsService.updateSettings(nextSettings);
    const merged = { ...nextSettings, ...saved };
    setSettings(merged);
    localStorage.setItem('apex_lab_settings', JSON.stringify(merged));
    await refetchSettings();
  };

  return (
    <ToastProvider>
      <div className="app-container">
        <Header
          onLogin={showLogin}
          onSignup={showSignup}
          isAuthenticated={isAuthenticated}
          userName={user?.name ?? user?.username ?? null}
          onLogout={handleLogout}
        />

        {isAuthenticated && location.pathname === '/dashboard' && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            settings={settings}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        )}

        <main className="main-content" style={{ paddingTop: 'var(--header-height, 64px)', paddingLeft: isAuthenticated && location.pathname === '/dashboard' ? 'var(--sidebar-width, 280px)' : '0', transition: 'padding-left 0.2s ease' }}>
          <Routes>
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/login"
              element={
                <Modal
                  onClose={() => {
                    setAuthView('landing');
                    navigate('/');
                  }}
                  title="Sign in"
                >
                  <Login
                    onLoginSuccess={(u) => {
                      setUser(u);
                      setIsAuthenticated(true);
                      setAuthView('landing');
                      setActiveTab('dashboard');
                      navigate('/dashboard');
                    }}
                  />
                </Modal>
              }
            />
            <Route
              path="/signup"
              element={
                <Modal
                  onClose={() => {
                    setAuthView('landing');
                    navigate('/');
                  }}
                  title="Create account"
                >
                  <Signup
                    onSignupSuccess={() => {
                      setUser(null);
                      setIsAuthenticated(false);
                      setAuthView('login');
                      navigate('/login');
                    }}
                    onCancel={() => {
                      setAuthView('landing');
                      navigate('/');
                    }}
                  />
                </Modal>
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <>
                    {activeTab === 'dashboard' && (
                      <DashboardOverview
                        reports={reports}
                        setActiveTab={setActiveTab}
                        setSelectedReportId={setSelectedReportId}
                      />
                    )}

                    {activeTab === 'reports' && (
                      <ReportList
                        reports={reports}
                        settings={settings}
                        onDeleteReport={handleDeleteReport}
                        onEditReport={handleEditReport}
                        selectedReportId={selectedReportId}
                        setSelectedReportId={setSelectedReportId}
                      />
                    )}

                    {activeTab === 'new-report' && (
                      <ReportEditor
                        editingReport={editingReport}
                        onSaveReport={handleSaveReport}
                        onCancel={() => {
                          setEditingReport(null);
                          setActiveTab('reports');
                        }}
                      />
                    )}

                    {activeTab === 'settings' && (
                      <SettingsPanel
                        settings={settings}
                        onSaveSettings={handleSaveSettings}
                      />
                    )}
                  </>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : authView === 'login' ? (
                  <Modal
                    onClose={() => {
                      setAuthView('landing');
                      navigate('/');
                    }}
                    title="Sign in"
                  >
                    <Login
                      onLoginSuccess={(u) => {
                        setUser(u);
                        setIsAuthenticated(true);
                        setAuthView('landing');
                        setActiveTab('dashboard');
                        navigate('/dashboard', { replace: true });
                      }}
                    />
                  </Modal>
                ) : authView === 'signup' ? (
                  <Modal
                    onClose={() => {
                      setAuthView('landing');
                      navigate('/');
                    }}
                    title="Create account"
                  >
                    <Signup
                      onSignupSuccess={() => {
                        setUser(null);
                        setIsAuthenticated(false);
                        setAuthView('login');
                        navigate('/login');
                      }}
                      onCancel={() => {
                        setAuthView('landing');
                        navigate('/');
                      }}
                    />
                  </Modal>
                ) : (
                  <Landing
                    onLoginClick={showLogin}
                    onSignupClick={showSignup}
                  />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        <Footer />
      </main>

      {printData && (
        <ReportPrintView
          report={printData}
          settings={settings}
        />
      )}
    </div>
    </ToastProvider>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Sidebar, { type DashboardTab } from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ReportList from './components/ReportList';
import DynamicReportEditor from './components/DynamicReportEditor';
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
import TestCatalogPage from './pages/TestCatalogPage';
import TestConfigurationPage from './pages/TestConfigurationPageV2';
import CriticalResultsPage from './pages/CriticalResultsPage';
import ReportTemplatesPage from './pages/ReportTemplatesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import OrdersWorkspace from './pages/OrdersWorkspaceV2';
import { ToastProvider } from './components/Toast';
import { DEFAULT_SETTINGS, type LabReport, type LabSettings } from './data/samples';
import reportsService from './services/reportsService';
import labsService from './services/labsService';
import authService from './services/authService';
import subscriptionService, { type SubscriptionStatus } from './services/subscriptionService';

interface SessionUser { id:string; username?:string; email?:string; role?:string; isActive?:boolean; }
function LoadingScreen(){return <div className="app-loading"><div className="loading-mark"><span/></div><strong>Loading your workspace</strong><small>Securely connecting to ApexLab…</small></div>}

export default function App(){
  const[activeTab,setActiveTab]=useState<DashboardTab>('dashboard'); const[reports,setReports]=useState<LabReport[]>([]); const[settings,setSettings]=useState<LabSettings>(DEFAULT_SETTINGS); const[selectedReportId,setSelectedReportId]=useState<string|null>(null); const[editingReport,setEditingReport]=useState<LabReport|null>(null); const[darkMode,setDarkMode]=useState(false); const[printData]=useState<LabReport|null>(null); const[user,setUser]=useState<SessionUser|null>(null); const[isAuthenticated,setIsAuthenticated]=useState(false); const[authLoading,setAuthLoading]=useState(true); const[authView,setAuthView]=useState<'landing'|'login'|'signup'>('landing');
  const navigate=useNavigate(); const location=useLocation(); const closeAuthModal=()=>{setAuthView('landing');navigate('/')};
  const handleLogout=async()=>{await authService.logout();setUser(null);setIsAuthenticated(false);setAuthView('landing');setReports([]);navigate('/',{replace:true})};
  useEffect(()=>{let mounted=true;const init=async()=>{try{const meResult=await authService.me();if(mounted&&meResult?.user){setUser(meResult.user);setIsAuthenticated(true)}}catch{if(mounted){setUser(null);setIsAuthenticated(false)}}finally{if(mounted)setAuthLoading(false)}try{const savedTheme=localStorage.getItem('apex_lab_theme');if(mounted&&savedTheme)setDarkMode(savedTheme==='dark')}catch{}};void init();return()=>{mounted=false}},[]);
  useEffect(()=>{document.documentElement.classList.toggle('dark-theme',darkMode);try{localStorage.setItem('apex_lab_theme',darkMode?'dark':'light')}catch{}},[darkMode]);
  const{data:reportsData,refetch:refetchReports}=useQuery({queryKey:['reports'],enabled:isAuthenticated,queryFn:()=>reportsService.listReports()});
  const{data:settingsData,refetch:refetchSettings}=useQuery({queryKey:['settings'],enabled:isAuthenticated,queryFn:()=>labsService.getSettings()});
  const{data:subscription,isLoading:subscriptionLoading}=useQuery<SubscriptionStatus>({queryKey:['subscription'],enabled:isAuthenticated,queryFn:()=>subscriptionService.getStatus(),staleTime:60000});
  const currentReports=useMemo(()=>reportsData?(Array.isArray(reportsData)?reportsData:reportsData.data||[])as LabReport[]:reports,[reportsData,reports]); const currentSettings=useMemo(()=>settingsData?settingsData as LabSettings:settings,[settingsData,settings]);
  const showLogin=()=>{setAuthView('login');navigate('/login')}; const showSignup=()=>{setAuthView('signup');navigate('/signup')};
  const handleLoginSuccess=(nextUser:SessionUser)=>{setUser(nextUser);setIsAuthenticated(true);setAuthView('landing');setActiveTab('dashboard');navigate('/dashboard',{replace:true})};
  const handleSaveReport=async(report:LabReport)=>{setReports(current=>current.some(item=>item.id===report.id)?current.map(item=>item.id===report.id?report:item):[report,...current]);setEditingReport(null);setSelectedReportId(report.id);setActiveTab('reports');await refetchReports()};
  const handleDeleteReport=async(id:string)=>{await reportsService.deleteReport(id);setReports(current=>current.filter(report=>report.id!==id));if(selectedReportId===id)setSelectedReportId(null);await refetchReports()};
  const handleSaveSettings=async(nextSettings:LabSettings)=>{const saved=await labsService.updateSettings(nextSettings);setSettings(saved);await refetchSettings()};
  if(authLoading)return <ToastProvider><LoadingScreen/></ToastProvider>;
  const dashboardRoute=isAuthenticated&&location.pathname==='/dashboard';
  const dashboardPage=isAuthenticated?<>{activeTab==='dashboard'&&<div className="saas-dashboard"><div className="saas-dashboard-heading"><div><span className="saas-eyebrow">Laboratory workspace</span><h1>Good to see you, {user?.username?.split('@')[0]||'there'}.</h1><p>Monitor your lab operations, reports and workspace usage from one place.</p></div><div style={{display:'flex',alignItems:'center',gap:8}}><button className="saas-secondary-btn" onClick={()=>navigate('/report-templates')}>Report Templates</button><div className="workspace-badge"><span/>Workspace online</div></div></div><SubscriptionCard subscription={subscription??null} loading={subscriptionLoading} onUpgrade={()=>setActiveTab('billing')}/><DashboardOverview reports={currentReports} setActiveTab={setActiveTab} setSelectedReportId={setSelectedReportId}/></div>}{activeTab==='orders'&&<OrdersWorkspace role={user?.role}/>} {activeTab==='critical-results'&&<CriticalResultsPage role={user?.role}/>} {activeTab==='reports'&&<ReportList reports={currentReports} settings={currentSettings} onDeleteReport={handleDeleteReport} onEditReport={report=>{setEditingReport(report);setActiveTab('new-report')}} selectedReportId={selectedReportId} setSelectedReportId={setSelectedReportId}/>} {activeTab==='new-report'&&<DynamicReportEditor editingReport={editingReport} onSaveReport={handleSaveReport} onCancel={()=>{setEditingReport(null);setActiveTab('reports')}}/>} {activeTab==='tests'&&user?.role==='ADMIN'&&<TestCatalogPage role={user.role}/>} {activeTab==='test-configuration'&&user?.role==='ADMIN'&&<TestConfigurationPage/>} {activeTab==='users'&&user?.role==='ADMIN'&&<TeamPage/>} {activeTab==='billing'&&<div className="saas-page"><div className="saas-page-header"><div><span className="saas-eyebrow">Workspace administration</span><h1>Plan & usage</h1><p>See your current plan, usage limits and subscription status.</p></div><button className="saas-secondary-btn" onClick={()=>navigate('/pricing')}>Compare plans</button></div><SubscriptionCard subscription={subscription??null} loading={subscriptionLoading} onUpgrade={()=>setActiveTab('billing')}/><div className="billing-note"><strong>Usage limits are enforced by the server.</strong><span>This dashboard is informational; creating data is always checked against the current subscription on the backend.</span></div></div>} {activeTab==='settings'&&user?.role==='ADMIN'&&<SettingsPanel settings={currentSettings} onSaveSettings={handleSaveSettings}/>}</>:<Navigate to="/" replace/>;
  return <ToastProvider><div className="app-container"><Header onLogin={showLogin} onSignup={showSignup} isAuthenticated={isAuthenticated} userName={user?.email??user?.username??null} onLogout={handleLogout}/>{dashboardRoute&&<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={currentSettings} darkMode={darkMode} setDarkMode={setDarkMode} role={user?.role} isAuthenticated={isAuthenticated} onLogout={handleLogout}/>}<main className="main-content"><Routes><Route path="/pricing" element={<PricingPage/>}/><Route path="/privacy" element={<PrivacyPolicyPage/>}/><Route path="/terms" element={<TermsAndConditionsPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/report-templates" element={isAuthenticated?<ReportTemplatesPage reports={currentReports}/>:<Navigate to="/login" replace/>}/><Route path="/login" element={<Modal onClose={closeAuthModal} title="Sign in" description="Access your laboratory workspace securely."><Login onLoginSuccess={handleLoginSuccess}/></Modal>}/><Route path="/signup" element={<Modal onClose={closeAuthModal} title="Create your account" description="Start your laboratory workspace in a few minutes."><Signup onSignupSuccess={()=>{setAuthView('login');navigate('/login')}} onCancel={closeAuthModal}/></Modal>}/><Route path="/dashboard" element={dashboardPage}/><Route path="/" element={isAuthenticated?<Navigate to="/dashboard" replace/>:authView==='login'?<Modal onClose={closeAuthModal} title="Sign in"><Login onLoginSuccess={handleLoginSuccess}/></Modal>:authView==='signup'?<Modal onClose={closeAuthModal} title="Create your account"><Signup onSignupSuccess={()=>{setAuthView('login');navigate('/login')}} onCancel={closeAuthModal}/></Modal>:<Landing onLoginClick={showLogin} onSignupClick={showSignup}/>} /><Route path="*" element={<Navigate to={isAuthenticated?'/dashboard':'/'} replace/>}/></Routes><Footer/></main>{printData&&<ReportPrintView report={printData} settings={currentSettings}/>}</div></ToastProvider>;
}

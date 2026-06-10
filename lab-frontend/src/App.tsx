import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardOverview from './components/DashboardOverview';
import ReportList from './components/ReportList';
import ReportEditor from './components/ReportEditor';
import SettingsPanel from './components/SettingsPanel';
import ReportPrintView from './components/ReportPrintView';
import { 
  SAMPLE_REPORTS, 
  DEFAULT_SETTINGS 
} from './data/samples';
import type { LabReport, LabSettings } from './data/samples';

export default function App() {
  // 1. Core States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'new-report' | 'settings'>('dashboard');
  const [reports, setReports] = useState<LabReport[]>([]);
  const [settings, setSettings] = useState<LabSettings>(DEFAULT_SETTINGS);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<LabReport | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [printData, setPrintData] = useState<LabReport | null>(null);

  // 2. LocalStorage Hydration
  useEffect(() => {
    const savedReports = localStorage.getItem('apex_lab_reports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (e) {
        setReports(SAMPLE_REPORTS);
      }
    } else {
      setReports(SAMPLE_REPORTS);
    }

    const savedSettings = localStorage.getItem('apex_lab_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }

    const savedTheme = localStorage.getItem('apex_lab_theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // 3. Dark Theme Class Management
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark-theme');
      localStorage.setItem('apex_lab_theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      localStorage.setItem('apex_lab_theme', 'light');
    }
  }, [darkMode]);

  // 4. State Persistence Effects
  const persistReports = (updatedReports: LabReport[]) => {
    setReports(updatedReports);
    localStorage.setItem('apex_lab_reports', JSON.stringify(updatedReports));
  };

  const handleSaveSettings = (updatedSettings: LabSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('apex_lab_settings', JSON.stringify(updatedSettings));
  };

  // 5. Patient Operations
  const handleSaveReport = (report: LabReport) => {
    const reportExists = reports.some(r => r.id === report.id);
    let updatedReports: LabReport[];

    if (reportExists) {
      // Edit existing
      updatedReports = reports.map(r => r.id === report.id ? report : r);
    } else {
      // Create new
      updatedReports = [report, ...reports];
    }

    persistReports(updatedReports);
    setEditingReport(null);
    setSelectedReportId(report.id); // Open preview for the saved report
    setActiveTab('reports'); // Redirect to register
  };

  const handleDeleteReport = (id: string) => {
    const updatedReports = reports.filter(r => r.id !== id);
    persistReports(updatedReports);
    if (selectedReportId === id) {
      setSelectedReportId(null);
    }
  };

  const handleEditReportClick = (report: LabReport) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };


  // 6. Handle print hook setup
  useEffect(() => {
    const handleBeforePrint = () => {
      // Fetch dynamic printable data bound on window inside ReportList
      const win = window as any;
      if (win.printReportData) {
        setPrintData(win.printReportData);
      }
    };

    const handleAfterPrint = () => {
      setPrintData(null);
      const win = window as any;
      win.printReportData = null;
      win.printReportSettings = null;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'new-report') {
            setEditingReport(null); // Clear form mode if leaving report builder
          }
        }} 
        settings={settings}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Core View Area */}
      <main className="main-content">
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
            onEditReport={handleEditReportClick}
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
      </main>

      {/* Invisible Printable Overlay (Only mounts during window.print) */}
      {printData && (
        <ReportPrintView report={printData} settings={settings} />
      )}
    </div>
  );
}

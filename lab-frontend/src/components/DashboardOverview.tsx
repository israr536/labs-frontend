import {
  Users,
  Clock,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  FileText,
  Settings as SettingsIcon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LabReport } from '../data/samples';
import reportsService from '../services/reportsService';
import patientsService from '../services/patientsService';

interface DashboardOverviewProps {
  reports: LabReport[];
  setActiveTab: (tab: 'dashboard' | 'reports' | 'patients' | 'new-report' | 'settings') => void;
  setSelectedReportId: (id: string | null) => void;
  pollIntervalMs?: number; // optional polling interval, default 30s
}

export default function DashboardOverview({
  reports,
  setActiveTab,
  setSelectedReportId,
  pollIntervalMs = 30 * 1000,
}: DashboardOverviewProps) {
  const [liveReports, setLiveReports] = useState<LabReport[] | null>(null);
  const [patientsCount, setPatientsCount] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLive = async () => {
    try {
      setIsRefreshing(true);
      const [r, p] = await Promise.all([
        reportsService.listReports().catch(() => null),
        patientsService.listPatients().catch(() => null),
      ]);

      if (r && Array.isArray(r)) setLiveReports(r as LabReport[]);
      if (p && Array.isArray(p)) setPatientsCount((p as any[]).length);
    } catch (e) {
      // ignore errors, keep fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    // initial fetch
    fetchLive();

    // polling with configurable interval
    timer = window.setInterval(() => {
      if (mounted) fetchLive();
    }, pollIntervalMs) as unknown as number;

    return () => { mounted = false; if (timer) window.clearInterval(timer); };
  }, [pollIntervalMs]);

  const sourceReports = liveReports ?? reports;

  // Calculate statistics
  const totalPatients = patientsCount ?? sourceReports.length;
  const pendingCount = sourceReports.filter((r) => r.status === 'Pending' || r.status === 'Draft').length;
  const criticalCount = sourceReports.filter((r) => r.status === 'Critical').length;
  const completedCount = sourceReports.filter((r) => r.status === 'Completed').length;

  const criticalReports = sourceReports.filter((r) => r.status === 'Critical');

  // Stats Card data
  const statCards = [
    {
      title: "Total Registered Patients",
      value: totalPatients,
      sub: "Active database",
      icon: Users,
      color: "var(--primary)",
      bgColor: "var(--primary-light)",
      gradient: "linear-gradient(135deg, rgba(6, 96, 137, 0.1), rgba(6, 96, 137, 0.02))"
    },
    {
      title: "Completed Reports",
      value: completedCount,
      sub: "Authorized & signed",
      icon: FileCheck,
      color: "var(--success)",
      bgColor: "var(--success-bg)",
      gradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))"
    },
    {
      title: "Pending Approval",
      value: pendingCount,
      sub: "In queue / Drafts",
      icon: Clock,
      color: "var(--warning)",
      bgColor: "var(--warning-bg)",
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02))"
    },
    {
      title: "Critical Alerts",
      value: criticalCount,
      sub: "Require immediate action",
      icon: AlertTriangle,
      color: "var(--danger)",
      bgColor: "var(--danger-bg)",
      gradient: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))",
      alert: criticalCount > 0
    }
  ];

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Today in your laboratory</h1>
          <p className="subtitle">A live view of patient volume, report progress, and work that needs attention.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => { setActiveTab('new-report'); }} className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Start a report</span>
          </button>
          <button onClick={() => fetchLive()} className="btn btn-outline" disabled={isRefreshing} aria-label="Refresh laboratory overview" style={{ marginLeft: 8 }}>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <span className="dashboard-live-status" aria-live="polite">{isRefreshing ? 'Updating live data' : 'Live data ready'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`glass-panel stat-card ${card.alert ? 'critical-pulse' : ''}`}
              aria-label={`${card.title}: ${card.value}. ${card.sub}`}
              style={{ background: card.gradient }}
            >
              <div className="stat-header">
                <span className="stat-title">{card.title}</span>
                <div className="stat-icon" style={{ color: card.color, background: card.bgColor }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-sub">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Charts and Critical list */}
      <div className="dashboard-main-grid">
        {/* Trend Chart (SVG) */}
        <div className="glass-panel chart-card col-span-2">
          <div className="card-header">
            <div>
              <h3>Daily Patient Flow</h3>
              <p className="card-sub">Daily admission trend over the past week</p>
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot primary"></span>Patients</span>
            </div>
          </div>
          <div className="chart-wrapper">
            {/* SVG line chart */}
            <svg viewBox="0 0 500 200" className="svg-chart" role="img" aria-label="Daily patient flow over the past seven days">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="4" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border)" strokeWidth="1" strokeDasharray="4" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border)" strokeWidth="1" strokeDasharray="4" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border)" strokeWidth="1" />

              {/* Chart Line Path */}
              {/* Days points: Mon (40, 160), Tue (113, 110), Wed (186, 130), Thu (259, 80), Fri (332, 95), Sat (405, 145), Sun (478, 165) */}
              <path
                d="M 40 160 Q 113 110 186 130 T 332 95 T 478 165"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Gradient fill underneath path */}
              <path
                d="M 40 160 Q 113 110 186 130 T 332 95 T 478 165 L 478 170 L 40 170 Z"
                fill="url(#chart-grad)"
              />

              {/* Data points */}
              <circle cx="40" cy="160" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="113" cy="110" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="186" cy="130" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="259" cy="80" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="332" cy="95" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="405" cy="145" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="478" cy="165" r="5" fill="white" stroke="var(--primary)" strokeWidth="3" />

              {/* Axis Labels */}
              <text x="40" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Mon</text>
              <text x="113" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Tue</text>
              <text x="186" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Wed</text>
              <text x="259" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Thu</text>
              <text x="332" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Fri</text>
              <text x="405" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Sat</text>
              <text x="478" y="188" textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="500">Sun</text>

              <text x="30" y="163" textAnchor="end" fontSize="9" fill="var(--text)">5</text>
              <text x="30" y="123" textAnchor="end" fontSize="9" fill="var(--text)">10</text>
              <text x="30" y="73" textAnchor="end" fontSize="9" fill="var(--text)">15</text>
              <text x="30" y="23" textAnchor="end" fontSize="9" fill="var(--text)">20</text>
            </svg>
          </div>
        </div>

        {/* Categories Distribution (Donut layout using SVG) */}
        <div className="glass-panel chart-card">
          <div className="card-header">
            <h3>Test Distribution</h3>
            <p className="card-sub">Top clinical parameters requested</p>
          </div>
          <div className="donut-chart-container">
            <svg width="150" height="150" viewBox="0 0 42 42" className="donut-chart" role="img" aria-label="Test distribution by clinical group">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border)" strokeWidth="4.5" />
              {/* Segment 1: CBC (35%) - Dasharray 35, Dashoffset 100 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--primary)" strokeWidth="4.5"
                      strokeDasharray="35 65" strokeDashoffset="100" />
              {/* Segment 2: Lipid (25%) - Dasharray 25, Dashoffset 65 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--secondary)" strokeWidth="4.5"
                      strokeDasharray="25 75" strokeDashoffset="65" />
              {/* Segment 3: Thyroid (20%) - Dasharray 20, Dashoffset 40 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--warning)" strokeWidth="4.5"
                      strokeDasharray="20 80" strokeDashoffset="40" />
              {/* Segment 4: Diabetes (15%) - Dasharray 15, Dashoffset 20 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--info)" strokeWidth="4.5"
                      strokeDasharray="15 85" strokeDashoffset="20" />
              {/* Segment 5: Others (5%) - Dasharray 5, Dashoffset 5 */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--draft)" strokeWidth="4.5"
                      strokeDasharray="5 95" strokeDashoffset="5" />
            </svg>
            <div className="donut-legend">
              <div className="donut-legend-item">
                <span className="legend-dot primary"></span>
                <span>Hematology (35%)</span>
              </div>
              <div className="donut-legend-item">
                <span className="legend-dot secondary"></span>
                <span>Lipid Profile (25%)</span>
              </div>
              <div className="donut-legend-item">
                <span className="legend-dot warning"></span>
                <span>Endocrinology (20%)</span>
              </div>
              <div className="donut-legend-item">
                <span className="legend-dot info"></span>
                <span>Glycemia (15%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Cases List */}
      <div className="dashboard-sub-grid">
        <div className="glass-panel alert-section">
          <div className="card-header border-b">
            <div className="flex-align">
              <AlertTriangle size={20} className="text-danger animate-pulse-slow" />
              <h3>Critical Alerts Panel</h3>
            </div>
            <span className="badge badge-critical">{criticalReports.length} Cases</span>
          </div>
          <div className="alerts-list">
            {criticalReports.length > 0 ? (
              criticalReports.map((report) => (
                <div key={report.id} className="alert-item">
                  <div className="alert-body">
                    <span className="alert-patient">{report.patientName} ({report.gender}, {report.age}y)</span>
                    <span className="alert-test">{report.testType}</span>
                    <p className="alert-note">
                      {report.parameters.filter(p => p.status === 'High' || p.status === 'Low' || p.status === 'Abnormal')
                        .map(p => `${p.name}: ${p.value} ${p.unit} (${p.status})`)
                        .join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setActiveTab('reports');
                    }}
                    className="alert-action-btn"
                    aria-label={`Inspect critical report for ${report.patientName}`}
                  >
                    <span>Inspect</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-alerts">
                <ShieldCheck size={40} className="text-success" />
                <p>No critical alerts detected. Your report queue is stable.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="glass-panel operations-section">
          <h3>Quick Operations</h3>
          <p className="card-sub">Common workflows and tools for lab managers</p>
          <div className="ops-grid">
            <button onClick={() => { setActiveTab('new-report'); }} className="op-card" aria-label="Start a new laboratory report">
              <div className="op-icon bg-primary">
                <PlusCircle size={22} />
              </div>
              <div className="op-body">
                <h4>Create Report</h4>
                <p>Create patient diagnostics records using smart templates.</p>
              </div>
            </button>
            <button onClick={() => { setActiveTab('patients'); }} className="op-card" aria-label="Open the patient registry">
              <div className="op-icon bg-secondary">
                <FileText size={22} />
              </div>
              <div className="op-body">
                <h4>Patient Registry</h4>
                <p>Find returning patients, register new records, and keep contact details current.</p>
              </div>
            </button>
            <button onClick={() => { setActiveTab('settings'); }} className="op-card" aria-label="Open laboratory settings">
              <div className="op-icon bg-info">
                <SettingsIcon size={22} />
              </div>
              <div className="op-body">
                <h4>Lab Settings</h4>
                <p>Configure lab name, address, licenses, and pathologist signatures.</p>
              </div>
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

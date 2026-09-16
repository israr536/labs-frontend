import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Clock, FileCheck, FileText, PlusCircle, Settings as SettingsIcon, ShieldCheck, Users } from 'lucide-react';
import dashboardService, { type DashboardSummary } from '../services/dashboardService';
import type { DashboardTab } from './Sidebar';
import { useToast } from './Toast';

interface DashboardOverviewProps {
  setActiveTab: (tab: DashboardTab) => void;
  setSelectedReportId: (id: string | null) => void;
}

export default function DashboardOverview({ setActiveTab }: DashboardOverviewProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: summary, isFetching, refetch } = useQuery<DashboardSummary>({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardService.getSummary,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const refresh = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      await refetch();
      toast.show({ type: 'success', message: 'Dashboard refreshed successfully.' });
    } catch (error) {
      toast.show({ type: 'error', message: error instanceof Error ? error.message : 'Unable to refresh dashboard.' });
    }
  };

  const totalPatients = summary?.totalPatients ?? 0;
  const completedCount = summary?.completedReports ?? 0;
  const pendingCount = summary?.pendingReports ?? 0;
  const criticalCount = summary?.criticalReports ?? 0;

  const statCards = [
    { title: 'Total Registered Patients', value: totalPatients, sub: 'Active database', icon: Users, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { title: 'Completed Reports', value: completedCount, sub: 'Authorized & signed', icon: FileCheck, color: 'var(--success)', bg: 'var(--success-bg)' },
    { title: 'Pending Approval', value: pendingCount, sub: 'In queue / Drafts', icon: Clock, color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { title: 'Critical Alerts', value: criticalCount, sub: 'Require immediate action', icon: AlertTriangle, color: 'var(--danger)', bg: 'var(--danger-bg)' },
  ];

  return (
    <div className="dashboard-content animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Today in your laboratory</h1>
          <p className="subtitle">A lightweight view of patient volume, report progress, and work that needs attention.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={() => setActiveTab('new-report')} className="btn btn-primary"><PlusCircle size={18} /><span>Start a report</span></button>
          <button onClick={refresh} className="btn btn-outline" disabled={isFetching} style={{ marginLeft: 8 }}>
            <span>{isFetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <span className="dashboard-live-status" aria-live="polite">{isFetching ? 'Updating live data' : 'Live data ready'}</span>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(({ title, value, sub, icon: Icon, color, bg }) => (
          <div key={title} className="glass-panel stat-card" aria-label={`${title}: ${value}. ${sub}`}>
            <div className="stat-header"><span className="stat-title">{title}</span><div className="stat-icon" style={{ color, background: bg }}><Icon size={20} /></div></div>
            <div className="stat-value">{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-sub-grid">
        <div className="glass-panel alert-section">
          <div className="card-header border-b">
            <div className="flex-align"><AlertTriangle size={20} className="text-danger" /><h3>Critical Alerts Panel</h3></div>
            <span className="badge badge-critical">{criticalCount} Cases</span>
          </div>
          <div className="alerts-list">
            {criticalCount > 0 ? (
              <div className="alert-item">
                <div className="alert-body">
                  <span className="alert-patient">{criticalCount} critical result{criticalCount === 1 ? '' : 's'} require review</span>
                  <span className="alert-test">Live count from the dashboard service</span>
                  <p className="alert-note">Open the critical-results workspace to review the latest cases. The dashboard no longer derives alerts from a stale report list.</p>
                </div>
                <button onClick={() => setActiveTab('critical-results')} className="alert-action-btn" aria-label="Open critical results"><span>Review</span><ArrowRight size={14} /></button>
              </div>
            ) : (
              <div className="empty-alerts"><ShieldCheck size={40} className="text-success" /><p>No critical alerts detected. Your report queue is stable.</p></div>
            )}
          </div>
        </div>

        <div className="glass-panel operations-section">
          <h3>Quick Operations</h3>
          <p className="card-sub">Common workflows and tools for lab managers</p>
          <div className="ops-grid">
            <button onClick={() => setActiveTab('new-report')} className="op-card"><div className="op-icon bg-primary"><PlusCircle size={22} /></div><div className="op-body"><h4>Create Report</h4><p>Create patient diagnostics records using smart templates.</p></div></button>
            <button onClick={() => setActiveTab('patients')} className="op-card"><div className="op-icon bg-secondary"><FileText size={22} /></div><div className="op-body"><h4>Patient Registry</h4><p>Find returning patients and manage patient records.</p></div></button>
            <button onClick={() => setActiveTab('settings')} className="op-card"><div className="op-icon bg-info"><SettingsIcon size={22} /></div><div className="op-body"><h4>Lab Settings</h4><p>Configure laboratory information and report settings.</p></div></button>
          </div>
        </div>
      </div>
    </div>
  );
}

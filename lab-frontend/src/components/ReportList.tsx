import { useState } from 'react';
import { Search, Filter, Eye, Edit3, Trash2, Printer, Download, Calendar, X, User, Phone, Mail, Building, HeartPulse } from 'lucide-react';
import { useToast } from './Toast';
import type { LabReport, LabSettings } from '../data/samples';
import { downloadReportPdf, getSavedReportTemplate, openReportPdf, saveReportTemplate, type ReportTemplateId } from '../services/reportsService';

interface ReportListProps {
  reports: LabReport[];
  settings: LabSettings;
  onDeleteReport: (id: string) => void;
  onEditReport: (report: LabReport) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
}

const REPORT_TEMPLATES: Array<{ id: ReportTemplateId; name: string }> = [
  { id: 'classic', name: 'Classic Laboratory' },
  { id: 'modern', name: 'Modern Professional' },
  { id: 'compact', name: 'Compact Multi-Test' },
  { id: 'detailed', name: 'Detailed Clinical' },
  { id: 'premium', name: 'Premium Branded' },
  { id: 'minimal', name: 'Minimal One-Page' },
];

export default function ReportList({ reports, settings: _settings, onDeleteReport, onEditReport, selectedReportId, setSelectedReportId }: ReportListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [testFilter, setTestFilter] = useState('All');
  const [template, setTemplate] = useState<ReportTemplateId>(getSavedReportTemplate());
  const [busyId, setBusyId] = useState<string | null>(null);
  const toast = useToast();
  const activeReport = reports.find((r) => r.id === selectedReportId) || null;
  const uniqueTestTypes = Array.from(new Set(reports.map((r) => r.testType)));

  const filteredReports = reports.filter((report) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = report.patientName.toLowerCase().includes(search) || report.id.toLowerCase().includes(search) || report.phone.includes(searchTerm) || Boolean(report.email?.toLowerCase().includes(search));
    return matchesSearch && (statusFilter === 'All' || report.status === statusFilter) && (testFilter === 'All' || report.testType === testFilter);
  });

  const selectTemplate = (value: ReportTemplateId) => { setTemplate(value); saveReportTemplate(value); };

  const handleDownload = async (report: LabReport) => {
    try {
      setBusyId(`${report.id}:download`);
      await downloadReportPdf(report.id, undefined, template);
      toast.show({ type: 'success', message: `Downloaded ${template} PDF for ${report.id}` });
    } catch (error: any) {
      toast.show({ type: 'error', message: error?.message || 'PDF download failed' });
    } finally { setBusyId(null); }
  };

  const handlePrint = async (report: LabReport) => {
    try {
      setBusyId(`${report.id}:print`);
      await openReportPdf(report.id, template);
      toast.show({ type: 'info', message: `Opened ${template} report for printing` });
    } catch (error: any) {
      toast.show({ type: 'error', message: error?.message || 'Unable to open report PDF' });
    } finally { setBusyId(null); }
  };

  const statusClass = (status: string) => status === 'Completed' ? 'badge-normal' : status === 'Critical' ? 'badge-critical' : status === 'Pending' ? 'badge-pending' : 'badge-draft';
  const paramClass = (status: string) => status === 'High' ? 'badge-critical' : status === 'Low' || status === 'Abnormal' ? 'badge-abnormal' : 'badge-normal';

  return (
    <div className="reports-container animate-fade-in">
      <div className="reports-header-row">
        <div><h1>Patient Register</h1><p className="subtitle">Search, inspect, delete, print, and download diagnostic reports</p></div>
        <div className="filter-group" title="Default report template">
          <Filter size={16} className="filter-icon" />
          <select value={template} onChange={(e) => selectTemplate(e.target.value as ReportTemplateId)} className="filter-select" aria-label="Report PDF template">
            {REPORT_TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700 }}>PDF template:</span>
        <span style={{ color: 'var(--text)' }}>{REPORT_TEMPLATES.find((item) => item.id === template)?.name}</span>
        <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>Saved as the default and used by all Patient Register Print / Download actions.</span>
      </div>

      <div className="reports-layout">
        <div className={`glass-panel register-list-card ${activeReport ? 'panel-split' : ''}`}>
          <div className="filters-row">
            <div className="search-box"><Search size={18} className="search-icon" /><input type="text" placeholder="Search patient, ID, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" id="patient-search-input" /></div>
            <div className="filter-group"><Filter size={16} className="filter-icon" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select" id="status-filter-select"><option value="All">All Statuses</option><option value="Completed">Completed</option><option value="Pending">Pending</option><option value="Critical">Critical</option><option value="Draft">Draft</option></select></div>
            <div className="filter-group"><Filter size={16} className="filter-icon" /><select value={testFilter} onChange={(e) => setTestFilter(e.target.value)} className="filter-select" id="test-filter-select"><option value="All">All Test Groups</option>{uniqueTestTypes.map((test) => <option key={test} value={test}>{test}</option>)}</select></div>
          </div>

          <div className="table-container">
            <table className="custom-table" id="reports-patient-table">
              <thead><tr><th>Report ID</th><th>Patient Info</th><th>Diagnostic Test Type</th><th>Date Reported</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredReports.length ? filteredReports.map((report) => (
                  <tr key={report.id} className={`clickable-row ${selectedReportId === report.id ? 'active-row' : ''}`} onClick={() => setSelectedReportId(report.id)}>
                    <td className="font-bold">{(report as any).reportNumber ?? report.id}</td>
                    <td><div className="patient-cell"><span className="patient-name-span">{report.patientName}</span><span className="patient-meta-span">{report.gender} • {report.age} Yrs</span></div></td>
                    <td><span className="test-type-span">{report.testType}</span></td>
                    <td><div className="date-cell"><Calendar size={14} /><span>{new Date(report.dateReported).toLocaleDateString()}</span></div></td>
                    <td><span className={`badge ${statusClass(report.status)}`}>{report.status}</span></td>
                    <td><div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelectedReportId(report.id)} className="row-action-btn view-btn" title="Quick View"><Eye size={16} /></button>
                      <button onClick={() => onEditReport(report)} disabled={report.status === 'Completed' || report.status === 'Critical'} className="row-action-btn edit-btn" title="Edit Report"><Edit3 size={16} /></button>
                      <button onClick={() => handlePrint(report)} disabled={busyId !== null} className="row-action-btn print-btn" title={`Print ${template} PDF`}><Printer size={16} /></button>
                      <button onClick={() => handleDownload(report)} disabled={busyId !== null} className="row-action-btn download-btn" title={`Download ${template} PDF`}><Download size={16} /></button>
                      <button disabled={report.status === 'Completed' || report.status === 'Critical'} onClick={async () => { if (!confirm(`Are you sure you want to delete report ${report.id} for ${report.patientName}?`)) return; try { await onDeleteReport(report.id); toast.show({ type: 'success', message: `Deleted report ${report.id}` }); } catch (error: any) { toast.show({ type: 'error', message: error?.message || 'Failed to delete report' }); } }} className="row-action-btn delete-btn" title="Delete Record"><Trash2 size={16} /></button>
                    </div></td>
                  </tr>
                )) : <tr><td colSpan={6} className="empty-table-cell">No matching diagnostic reports found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {activeReport && <div className="glass-panel preview-sidebar animate-slide-left">
          <div className="preview-header"><div className="flex-align"><HeartPulse size={20} className="text-primary" /><h3>Report Preview</h3></div><button onClick={() => setSelectedReportId(null)} className="close-preview-btn" title="Close Panel"><X size={18} /></button></div>
          <div className="preview-body">
            <div className="preview-profile-card"><div className="preview-avatar"><User size={24} /></div><div className="preview-profile-info"><h4>{activeReport.patientName}</h4><p>{activeReport.gender} • {activeReport.age} Years • ID: {(activeReport as any).reportNumber ?? activeReport.id}</p></div></div>
            <div className="meta-contacts-list"><div className="contact-item"><Phone size={14} /><span>{activeReport.phone}</span></div>{activeReport.email && <div className="contact-item"><Mail size={14} /><span>{activeReport.email}</span></div>}<div className="contact-item"><Building size={14} /><span>Ref: {activeReport.referredBy}</span></div></div>
            <div className="preview-divider" />
            <div className="test-summary-header"><div><span className="section-label">Diagnostic Category</span><h4 className="test-name-title">{activeReport.testType}</h4></div><span className={`badge ${statusClass(activeReport.status)}`}>{activeReport.status}</span></div>
            <div className="parameters-preview-box"><div className="param-header-row"><span>Parameter</span><span>Value / Unit</span><span>Flag</span></div><div className="param-list-scroll">{activeReport.parameters.map((param, index) => <div key={index} className={`param-row-item ${param.status !== 'Normal' ? 'abnormal-highlight' : ''}`}><div className="param-desc"><span className="param-name">{param.name}</span><span className="param-range">Ref: {param.refRange}</span></div><div className="param-value-unit"><span className="param-val">{param.value}</span><span className="param-unit-span">{param.unit}</span></div><span className={`badge ${paramClass(param.status)}`}>{param.status}</span></div>)}</div></div>
            {activeReport.interpretation && <div className="interpretation-preview-box"><h5>Clinical Interpretation & Advisory</h5><p>{activeReport.interpretation}</p></div>}
          </div>
          <div className="preview-footer-actions"><button onClick={() => onEditReport(activeReport)} className="btn btn-outline footer-btn" disabled={activeReport.status === 'Completed' || activeReport.status === 'Critical'}><Edit3 size={16} /><span>Edit</span></button><button onClick={() => handlePrint(activeReport)} className="btn btn-secondary footer-btn" disabled={busyId !== null}><Printer size={16} /><span>Print</span></button><button onClick={() => handleDownload(activeReport)} className="btn btn-primary footer-btn" disabled={busyId !== null}><Download size={16} /><span>Download PDF</span></button></div>
        </div>}
      </div>
    </div>
  );
}

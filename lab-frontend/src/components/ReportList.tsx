import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search, Filter, Eye, Edit3, Trash2, Printer, Download, Calendar, X, User, Phone, Mail, Building, HeartPulse, ArrowUpRight, FileText, SlidersHorizontal } from 'lucide-react';
import { useToast } from './Toast';
import type { LabReport } from '../data/samples';
import { downloadReportPdf, getReport, getSavedReportTemplate, listReports, openReportPdf, saveReportTemplate, type ReportTemplateId } from '../services/reportsService';
import Pagination from './Pagination';

interface ReportListProps {
  onDeleteReport: (id: string) => Promise<void>;
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

const PAGE_SIZE = 20;

export default function ReportList({ onDeleteReport, onEditReport, selectedReportId, setSelectedReportId }: ReportListProps) {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [template, setTemplate] = useState<ReportTemplateId>(getSavedReportTemplate());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const toast = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data: reportResponse, isLoading, isFetching } = useQuery({
    queryKey: ['reports', { page, search: searchTerm, status: statusFilter }],
    queryFn: () => listReports({ search: searchTerm || undefined, status: statusFilter, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const reports = reportResponse?.data ?? [];
  const totalReports = reportResponse?.pagination?.total ?? reports.length;
  const selectedListReport = reports.find((report) => report?.id === selectedReportId) ?? null;

  const { data: selectedReport, isFetching: detailLoading } = useQuery({
    queryKey: ['report', selectedReportId],
    queryFn: () => getReport(selectedReportId as string),
    enabled: Boolean(selectedReportId),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const activeReport = selectedReport ?? selectedListReport;

  const selectReport = (id: string | undefined) => {
    if (!id) return;
    setSelectedReportId(id);
  };

  const selectTemplate = (value: ReportTemplateId) => {
    setTemplate(value);
    saveReportTemplate(value);
  };

  const handleDownload = async (report: LabReport) => {
    const toastId = toast.show({ type: 'pending', message: `Downloading ${template} PDF…` });
    try {
      setBusyId(`${report.id}:download`);
      await downloadReportPdf(report.id, undefined, template);
      toast.update(toastId, { type: 'success', message: `Downloaded ${template} PDF for ${report.id}.` });
    } catch (error: any) {
      toast.update(toastId, { type: 'error', message: error?.message || 'PDF download failed' });
    } finally {
      setBusyId(null);
    }
  };

  const handlePrint = async (report: LabReport) => {
    const toastId = toast.show({ type: 'pending', message: `Opening ${template} report…` });
    try {
      setBusyId(`${report.id}:print`);
      await openReportPdf(report.id, template);
      toast.update(toastId, { type: 'success', message: `Opened ${template} report for printing.` });
    } catch (error: any) {
      toast.update(toastId, { type: 'error', message: error?.message || 'Unable to open report PDF' });
    } finally {
      setBusyId(null);
    }
  };

  const statusClass = (status: string) => status === 'Completed' ? 'report-status-success' : status === 'Critical' ? 'report-status-danger' : status === 'Pending' ? 'report-status-warning' : 'report-status-neutral';
  const canEdit = (report: LabReport) => report.status !== 'Completed' && report.status !== 'Critical';
  const closePreview = () => setSelectedReportId(null);

  return <div className="report-workspace">
    <header className="report-workspace-header">
      <div><span className="workspace-eyebrow"><FileText size={13} /> Report operations</span><h1>Patients & reports</h1><p>Search, review, verify, and deliver diagnostic reports from one controlled queue.</p></div>
      <div className="report-header-summary"><strong>{totalReports}</strong><span>matching reports</span></div>
    </header>

    <section className="report-control-strip">
      <div className="report-control-copy"><div className="control-icon"><SlidersHorizontal size={17} /></div><div><strong>Report output standard</strong><span>Choose the template used for printing and downloading reports.</span></div></div>
      <label className="report-template-field"><span>Default template</span><select value={template} onChange={(e) => selectTemplate(e.target.value as ReportTemplateId)} aria-label="Default report PDF template">{REPORT_TEMPLATES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </section>

    <section className={`report-workspace-grid ${activeReport ? 'has-preview' : ''}`}>
      <div className="report-queue-card">
        <div className="report-queue-toolbar">
          <div className="report-search"><Search size={17} /><input type="search" placeholder="Search by patient, report ID, or phone" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Search reports" /></div>
          <div className="report-filter"><Filter size={15} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter reports by status"><option value="All">All statuses</option><option value="Completed">Completed</option><option value="Pending">Pending</option><option value="Critical">Critical</option><option value="Draft">Draft</option></select></div>
        </div>

        <div className="report-queue-meta"><span><strong>{totalReports}</strong> reports in view</span><span>{isFetching ? 'Updating results…' : 'Click a row to open the review panel'}</span></div>

        <div className="report-table-wrap">
          <table className="report-table">
            <caption className="sr-only">Patient reports</caption>
            <thead><tr><th scope="col">Report</th><th scope="col">Patient</th><th scope="col">Diagnostic test</th><th scope="col">Reported</th><th scope="col">Status</th><th scope="col" className="report-actions-heading">Actions</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="report-empty"><strong>Loading reports…</strong><span>Fetching the latest report queue.</span></td></tr> : reports.length ? reports.map((report, index) => (
                <tr key={String(report?.id ?? `report-${index}`)} className={selectedReportId === report.id ? 'is-selected' : ''} onClick={() => selectReport(report?.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectReport(report?.id); } }} tabIndex={0} aria-label={`Open ${report?.patientName ?? 'report'} report`}>
                  <td><strong className="report-number">{(report as any).reportNumber ?? report?.id ?? 'Report'}</strong><span className="report-id-sub">Diagnostic report</span></td>
                  <td><div className="report-patient"><span className="report-avatar">{String(report?.patientName ?? '?').slice(0, 1).toUpperCase()}</span><span><strong>{report?.patientName ?? 'Unknown patient'}</strong><small>{report?.gender ?? 'Other'} · {report?.age ?? 0} years</small></span></div></td>
                  <td><span className="report-test-name">{report?.testType ?? 'Diagnostic Test'}</span></td>
                  <td><span className="report-date"><Calendar size={14} />{report?.dateReported ? new Date(report.dateReported).toLocaleDateString() : '—'}</span></td>
                  <td><span className={`report-status ${statusClass(report?.status ?? 'Draft')}`}><i />{report?.status ?? 'Draft'}</span></td>
                  <td><div className="report-row-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => selectReport(report.id)} aria-label={`Review ${report?.patientName ?? 'report'}`} title="Review"><Eye size={15} /></button>
                    <button type="button" onClick={() => onEditReport(report)} disabled={!canEdit(report)} aria-label={`Edit ${report?.patientName ?? 'report'}`} title="Edit"><Edit3 size={15} /></button>
                    <button type="button" onClick={() => handlePrint(report)} disabled={busyId !== null} aria-label={`Print ${report?.patientName ?? 'report'}`} title="Print"><Printer size={15} /></button>
                    <button type="button" onClick={() => handleDownload(report)} disabled={busyId !== null} aria-label={`Download ${report?.patientName ?? 'report'}`} title="Download"><Download size={15} /></button>
                    <button type="button" className="is-danger" disabled={!canEdit(report)} aria-label={`Delete ${report?.patientName ?? 'report'}`} title="Delete" onClick={async () => {
                      if (!confirm(`Are you sure you want to delete report ${report.id} for ${report?.patientName ?? 'unknown patient'}?`)) return;
                      try {
                        await onDeleteReport(report.id);
                        toast.show({ type: 'success', message: `Deleted report ${report.id}` });
                      } catch (error: any) {
                        toast.show({ type: 'error', message: error?.message || 'Failed to delete report' });
                      }
                    }}><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              )) : <tr><td colSpan={6} className="report-empty"><Search size={28} /><strong>No reports match these filters</strong><span>Try clearing the search or status filter.</span></td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={totalReports} onPageChange={setPage} label="reports" />
      </div>

      {activeReport && <aside className="report-review-card" aria-label="Report review panel">
        <div className="review-card-header"><div><span className="workspace-eyebrow"><HeartPulse size={13} /> Selected report</span><h2>Review before delivery</h2></div><button type="button" className="review-close" onClick={closePreview} aria-label="Close report review"><X size={18} /></button></div>
        <div className="review-patient-card"><span className="review-avatar"><User size={20} /></span><div><strong>{activeReport.patientName ?? 'Unknown patient'}</strong><span>{activeReport.gender ?? 'Other'} · {activeReport.age ?? 0} years</span><small>Report ID · {(activeReport as any).reportNumber ?? activeReport.id ?? '—'}</small></div><span className={`report-status ${statusClass(activeReport.status ?? 'Draft')}`}><i />{activeReport.status ?? 'Draft'}</span></div>
        <div className="review-contact-list"><span><Phone size={14} />{activeReport.phone ?? '—'}</span>{activeReport.email && <span><Mail size={14} />{activeReport.email}</span>}<span><Building size={14} />Ref: {activeReport.referredBy ?? '—'}</span></div>
        <div className="review-test-heading"><div><span>Diagnostic test</span><strong>{activeReport.testType ?? 'Diagnostic Test'}</strong></div><ArrowUpRight size={16} /></div>
        <div className="review-parameters">
          {detailLoading ? <div className="report-empty"><strong>Loading report details…</strong><span>Fetching the complete report for review.</span></div> : <><div className="review-parameter-head"><span>Parameter</span><span>Result</span><span>Flag</span></div>{(Array.isArray(activeReport.parameters) ? activeReport.parameters : []).map((param, index) => <div key={`${param?.name ?? 'parameter'}-${index}`} className={`review-parameter ${param?.status !== 'Normal' ? 'is-abnormal' : ''}`}><span><strong>{param?.name ?? 'Parameter'}</strong><small>Ref: {param?.refRange ?? '—'}</small></span><b>{param?.value ?? ''} <small>{param?.unit ?? ''}</small></b><em>{param?.status ?? 'Normal'}</em></div>)}</>}
        </div>
        {activeReport.interpretation && <div className="review-interpretation"><strong>Clinical interpretation</strong><p>{activeReport.interpretation}</p></div>}
        <div className="review-actions"><button type="button" onClick={() => onEditReport(activeReport)} disabled={!canEdit(activeReport)} className="review-secondary"><Edit3 size={15} /> Edit</button><button type="button" onClick={() => handlePrint(activeReport)} disabled={busyId !== null} className="review-secondary"><Printer size={15} /> Print</button><button type="button" onClick={() => handleDownload(activeReport)} disabled={busyId !== null} className="review-primary"><Download size={15} /> Download PDF</button></div>
      </aside>}
    </section>
  </div>;
}

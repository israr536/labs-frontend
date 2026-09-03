import { useState, useEffect } from 'react';
import { Download, Trash2, Edit2, Eye, Loader, Search } from 'lucide-react';
import reportsService from '../services/reportsService';
import { useToast } from './Toast';
import Modal from './Modal';

interface Report {
  id: string;
  [key: string]: any;
}

interface ReportListProps {
  onEdit?: (report: Report) => void;
  onView?: (report: Report) => void;
  refresh?: number;
}

export default function ReportListComponent({ onEdit, onView, refresh }: ReportListProps) {
  const toast = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadReports();
  }, [refresh, page, status]);

  async function loadReports() {
    try {
      setLoading(true);
      const result = await reportsService.listReports({
        status: status || undefined,
        search: search || undefined,
        skip: page * pageSize,
        take: pageSize,
      });

      setReports(Array.isArray(result.data) ? (result.data as any) : []);
      if (result.pagination?.total) {
        setTotal(result.pagination.total);
      }
    } catch (error: any) {
      toast.show({ type: 'error', message: error.message || 'Failed to load reports' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await reportsService.deleteReport(deleteId);
      setReports(reports.filter(r => r.id !== deleteId));
      toast.show({ type: 'success', message: 'Report deleted' });
      setDeleteId(null);
    } catch (error: any) {
      toast.show({ type: 'error', message: error.message || 'Failed to delete report' });
    }
  }

  async function handleDownloadPdf(reportId: string, reportNumber: string) {
    try {
      await reportsService.downloadReportPdf(reportId, `${reportNumber}.pdf`);
      toast.show({ type: 'success', message: 'PDF downloaded' });
    } catch (error: any) {
      toast.show({ type: 'error', message: 'Failed to download PDF' });
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'Critical') return '#dc2626';
    if (status === 'Completed') return '#16a34a';
    return '#f59e0b';
  };

  const pages = Math.ceil(total / pageSize);

  return (
    <div className="report-list">
      <div className="list-controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            onKeyUp={() => loadReports()}
            className="search-input"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="status-filter"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="FINAL">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <p>No reports found</p>
        </div>
      ) : (
        <>
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Report #</th>
                  <th>Patient</th>
                  <th>Test Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td className="mono">{report.reportNumber}</td>
                    <td>{report.patientName}</td>
                    <td>{report.testType}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td>{new Date(report.dateReported).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        onClick={() => onView?.(report)}
                        className="btn-icon"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      {report.status === 'Draft' && (
                        <button
                          onClick={() => onEdit?.(report)}
                          className="btn-icon"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadPdf(report.id, report.reportNumber)}
                        className="btn-icon"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      {report.status === 'Draft' && (
                        <button
                          onClick={() => setDeleteId(report.id)}
                          className="btn-icon btn-icon-danger"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>Page {page + 1} of {pages}</span>
              <button
                onClick={() => setPage(Math.min(pages - 1, page + 1))}
                disabled={page === pages - 1}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {deleteId && (
        <Modal
          title="Delete Report"
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          confirmText="Delete"
          isDangerous
        >
          <p>Are you sure you want to delete this report? This action cannot be undone.</p>
        </Modal>
      )}

      <style>{`
        .report-list { display: flex; flex-direction: column; gap: 20px; }
        .list-controls { display: flex; gap: 12px; align-items: center; }
        .search-bar { flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(148,163,184,0.05); border-radius: 12px; border: 1px solid rgba(148,163,184,0.2); }
        .search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; }
        .status-filter { padding: 12px 16px; border: 1px solid rgba(148,163,184,0.2); border-radius: 12px; background: rgba(255,255,255,0.5); outline: none; }
        .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .reports-table { overflow-x: auto; border: 1px solid rgba(148,163,184,0.2); border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: rgba(148,163,184,0.05); }
        th { padding: 14px; text-align: left; font-weight: 600; font-size: 13px; }
        td { padding: 14px; border-top: 1px solid rgba(148,163,184,0.1); font-size: 13px; }
        tbody tr:hover { background: rgba(56,189,248,0.04); }
        .mono { font-family: monospace; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-size: 12px; font-weight: 600; }
        .actions { display: flex; gap: 8px; }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 6px; color: #64748b; transition: color 0.2s; }
        .btn-icon:hover { color: var(--primary); }
        .btn-icon-danger:hover { color: #dc2626; }
        .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 20px; }
        .btn-secondary { background: rgba(148,163,184,0.1); }
      `}</style>
    </div>
  );
}

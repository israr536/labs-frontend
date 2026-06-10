import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Printer, 
  Download, 
  Calendar, 
  X,
  User,
  Phone,
  Mail,
  Building,
  HeartPulse
} from 'lucide-react';
import { generateReportPdf } from '../utils/pdfGenerator';
import type { LabReport, LabSettings } from '../data/samples';

interface ReportListProps {
  reports: LabReport[];
  settings: LabSettings;
  onDeleteReport: (id: string) => void;
  onEditReport: (report: LabReport) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
}

export default function ReportList({
  reports,
  settings,
  onDeleteReport,
  onEditReport,
  selectedReportId,
  setSelectedReportId
}: ReportListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [testFilter, setTestFilter] = useState<string>('All');

  // Find currently selected report object
  const activeReport = reports.find(r => r.id === selectedReportId) || null;

  // Filter logic
  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.phone.includes(searchTerm) ||
      (report.email && report.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesTest = testFilter === 'All' || report.testType === testFilter;

    return matchesSearch && matchesStatus && matchesTest;
  });

  // Extract all unique test types in current DB for filtering dropdown
  const uniqueTestTypes = Array.from(new Set(reports.map(r => r.testType)));

  const handlePrint = (report: LabReport) => {
    // We set active printable report on window and trigger print
    (window as any).printReportData = report;
    (window as any).printReportSettings = settings;
    window.print();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed': return 'badge-normal';
      case 'Pending': return 'badge-pending';
      case 'Critical': return 'badge-critical';
      case 'Draft': return 'badge-draft';
      default: return 'badge-draft';
    }
  };

  const getParamBadgeClass = (status: string) => {
    switch (status) {
      case 'Normal': return 'badge-normal';
      case 'High': return 'badge-critical';
      case 'Low': return 'badge-abnormal';
      case 'Abnormal': return 'badge-abnormal';
      default: return 'badge-draft';
    }
  };

  return (
    <div className="reports-container animate-fade-in">
      <div className="reports-header-row">
        <div>
          <h1>Patient Register</h1>
          <p className="subtitle">Search, inspect, delete, and print diagnostic reports</p>
        </div>
      </div>

      <div className="reports-layout">
        {/* Reports Register Panel */}
        <div className={`glass-panel register-list-card ${activeReport ? 'panel-split' : ''}`}>
          {/* Filters Bar */}
          <div className="filters-row">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search patient, ID, phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                id="patient-search-input"
              />
            </div>
            
            <div className="filter-group">
              <Filter size={16} className="filter-icon" />
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
                id="status-filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Critical">Critical</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="filter-group">
              <Filter size={16} className="filter-icon" />
              <select 
                value={testFilter} 
                onChange={(e) => setTestFilter(e.target.value)}
                className="filter-select"
                id="test-filter-select"
              >
                <option value="All">All Test Groups</option>
                {uniqueTestTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="custom-table" id="reports-patient-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Patient Info</th>
                  <th>Diagnostic Test Type</th>
                  <th>Date Reported</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      className={`clickable-row ${selectedReportId === report.id ? 'active-row' : ''}`}
                      onClick={() => setSelectedReportId(report.id)}
                    >
                      <td className="font-bold">{report.id}</td>
                      <td>
                        <div className="patient-cell">
                          <span className="patient-name-span">{report.patientName}</span>
                          <span className="patient-meta-span">{report.gender} • {report.age} Yrs</span>
                        </div>
                      </td>
                      <td>
                        <span className="test-type-span">{report.testType}</span>
                      </td>
                      <td>
                        <div className="date-cell">
                          <Calendar size={14} />
                          <span>{new Date(report.dateReported).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedReportId(report.id)} 
                            className="row-action-btn view-btn"
                            title="Quick View"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => onEditReport(report)} 
                            className="row-action-btn edit-btn"
                            title="Edit Report"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handlePrint(report)} 
                            className="row-action-btn print-btn"
                            title="Print / PDF"
                          >
                            <Printer size={16} />
                          </button>
                          <button 
                            onClick={() => generateReportPdf(report, settings)} 
                            className="row-action-btn download-btn"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete report ${report.id} for ${report.patientName}?`)) {
                                onDeleteReport(report.id);
                              }
                            }} 
                            className="row-action-btn delete-btn"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-table-cell">
                      No matching diagnostic reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-out Preview Panel */}
        {activeReport && (
          <div className="glass-panel preview-sidebar animate-slide-left">
            <div className="preview-header">
              <div className="flex-align">
                <HeartPulse size={20} className="text-primary" />
                <h3>Report Preview</h3>
              </div>
              <button 
                onClick={() => setSelectedReportId(null)} 
                className="close-preview-btn"
                title="Close Panel"
              >
                <X size={18} />
              </button>
            </div>

            <div className="preview-body">
              {/* Profile Card */}
              <div className="preview-profile-card">
                <div className="preview-avatar">
                  <User size={24} />
                </div>
                <div className="preview-profile-info">
                  <h4>{activeReport.patientName}</h4>
                  <p>{activeReport.gender} • {activeReport.age} Years • ID: {activeReport.id}</p>
                </div>
              </div>

              {/* Patient Meta Contacts */}
              <div className="meta-contacts-list">
                <div className="contact-item">
                  <Phone size={14} />
                  <span>{activeReport.phone}</span>
                </div>
                {activeReport.email && (
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{activeReport.email}</span>
                  </div>
                )}
                <div className="contact-item">
                  <Building size={14} />
                  <span>Ref: {activeReport.referredBy}</span>
                </div>
              </div>

              <div className="preview-divider"></div>

              {/* Test Summary Title */}
              <div className="test-summary-header">
                <div>
                  <span className="section-label">Diagnostic Category</span>
                  <h4 className="test-name-title">{activeReport.testType}</h4>
                </div>
                <span className={`badge ${getStatusBadgeClass(activeReport.status)}`}>
                  {activeReport.status}
                </span>
              </div>

              {/* Parameters Table preview */}
              <div className="parameters-preview-box">
                <div className="param-header-row">
                  <span>Parameter</span>
                  <span>Value / Unit</span>
                  <span>Flag</span>
                </div>
                
                <div className="param-list-scroll">
                  {activeReport.parameters.map((param, index) => {
                    const isAbnormal = param.status !== 'Normal';
                    return (
                      <div key={index} className={`param-row-item ${isAbnormal ? 'abnormal-highlight' : ''}`}>
                        <div className="param-desc">
                          <span className="param-name">{param.name}</span>
                          <span className="param-range">Ref: {param.refRange}</span>
                        </div>
                        <div className="param-value-unit">
                          <span className={`param-val ${isAbnormal ? 'abnormal-text' : ''}`}>
                            {param.value}
                          </span>
                          <span className="param-unit-span">{param.unit}</span>
                        </div>
                        <span className={`badge ${getParamBadgeClass(param.status)}`}>
                          {param.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interpretation Note */}
              {activeReport.interpretation && (
                <div className="interpretation-preview-box">
                  <h5>Clinical Interpretation & Advisory</h5>
                  <p>{activeReport.interpretation}</p>
                </div>
              )}
            </div>

            {/* Preview Card Actions Footer */}
            <div className="preview-footer-actions">
              <button 
                onClick={() => onEditReport(activeReport)} 
                className="btn btn-outline footer-btn"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handlePrint(activeReport)} 
                className="btn btn-secondary footer-btn"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button 
                onClick={() => generateReportPdf(activeReport, settings)} 
                className="btn btn-primary footer-btn"
              >
                <Download size={16} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .reports-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .reports-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .reports-layout {
          display: flex;
          gap: 1.5rem;
          position: relative;
          align-items: flex-start;
        }

        .register-list-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: all 0.3s ease;
        }

        .panel-split {
          max-width: 60%;
        }

        @media (max-width: 1200px) {
          .panel-split {
            max-width: 100%;
          }
          .preview-sidebar {
            position: fixed !important;
            top: 5rem;
            right: 0;
            bottom: 0;
            width: 450px !important;
            max-width: 90%;
            z-index: 200;
          }
        }

        @media (max-width: 768px) {
          .reports-layout {
            flex-direction: column;
          }
          .panel-split {
            max-width: 100%;
          }
        }

        /* Filters Row Styling */
        .filters-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 240px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text);
        }

        .search-input {
          font-family: var(--font-sans);
          font-size: 0.925rem;
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-bold);
          outline: none;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          border-color: var(--border-focus);
        }

        .filter-group {
          display: flex;
          align-items: center;
          position: relative;
        }

        .filter-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text);
          pointer-events: none;
        }

        .filter-select {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.75rem 1rem 0.75rem 2.25rem;
          border-radius: var(--border-radius-md);
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-bold);
          outline: none;
          cursor: pointer;
        }

        .filter-select:focus {
          border-color: var(--border-focus);
        }

        /* Table custom items */
        .clickable-row {
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .active-row td {
          background: var(--primary-light) !important;
          border-bottom-color: rgba(6, 96, 137, 0.2) !important;
        }

        .patient-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .patient-name-span {
          font-weight: 700;
          color: var(--text-bold);
        }

        .patient-meta-span {
          font-size: 0.75rem;
          color: var(--text);
        }

        .test-type-span {
          font-weight: 600;
          color: var(--primary);
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text);
          font-weight: 500;
        }

        .actions-cell {
          display: flex;
          gap: 0.35rem;
        }

        .row-action-btn {
          border: none;
          background: transparent;
          color: var(--text);
          padding: 0.4rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .row-action-btn:hover {
          color: var(--text-bold);
        }

        .view-btn:hover { background: rgba(6, 96, 137, 0.08); color: var(--primary); }
        .edit-btn:hover { background: rgba(14, 184, 157, 0.08); color: var(--secondary); }
        .print-btn:hover { background: rgba(59, 130, 246, 0.08); color: var(--info); }
        .download-btn:hover { background: rgba(99, 102, 241, 0.08); color: var(--draft); }
        .delete-btn:hover { background: var(--danger-bg); color: var(--danger); }

        .empty-table-cell {
          text-align: center;
          padding: 3rem !important;
          color: var(--text);
          font-size: 0.95rem;
        }

        /* Slide-out Preview Panel Styling */
        .preview-sidebar {
          width: 38%;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem;
          height: calc(100vh - 5rem);
          max-height: 800px;
          overflow: hidden;
          box-shadow: var(--shadow-hover);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }

        .close-preview-btn {
          background: transparent;
          border: none;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .close-preview-btn:hover {
          background: rgba(148, 163, 184, 0.1);
          color: var(--text-bold);
        }

        .preview-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-right: 0.25rem;
        }

        .preview-profile-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--border-radius-md);
          padding: 1rem;
        }

        .preview-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-profile-info h4 {
          font-size: 1rem;
          font-weight: 700;
        }

        .preview-profile-info p {
          font-size: 0.75rem;
          color: var(--text);
        }

        .meta-contacts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-left: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--text);
          font-weight: 500;
        }

        .preview-divider {
          height: 1px;
          background: var(--border);
        }

        .test-summary-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .section-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: var(--text);
        }

        .test-name-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-bold);
        }

        .parameters-preview-box {
          border: 1px solid var(--border);
          border-radius: var(--border-radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .param-header-row {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.65rem 1rem;
          display: flex;
          justify-content: space-between;
        }

        .param-header-row span:last-child {
          width: 50px;
          text-align: center;
        }

        .param-list-scroll {
          display: flex;
          flex-direction: column;
          max-height: 250px;
          overflow-y: auto;
        }

        .param-row-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .param-row-item:last-child {
          border-bottom: none;
        }

        .abnormal-highlight {
          background: rgba(239, 68, 68, 0.02);
        }

        .param-desc {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          flex: 1;
        }

        .param-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-bold);
        }

        .param-range {
          font-size: 0.7rem;
          color: var(--text);
        }

        .param-value-unit {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .param-val {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-bold);
        }

        .abnormal-text {
          color: var(--danger);
        }

        .param-unit-span {
          font-size: 0.7rem;
          color: var(--text);
        }

        .interpretation-preview-box {
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: var(--border-radius-md);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .interpretation-preview-box h5 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--primary);
        }

        .interpretation-preview-box p {
          font-size: 0.775rem;
          color: var(--text);
        }

        .preview-footer-actions {
          display: flex;
          gap: 0.5rem;
          border-top: 1px solid var(--border);
          padding-top: 1rem;
        }

        .footer-btn {
          flex: 1;
          font-size: 0.85rem;
          padding: 0.6rem 0.85rem;
        }

        .animate-slide-left {
          animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

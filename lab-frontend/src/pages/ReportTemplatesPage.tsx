import { useEffect, useState } from 'react';
import { Download, CheckCircle2, Eye } from 'lucide-react';
import reportsService, { type ReportTemplateId, type ReportTemplate } from '../services/reportsService';
import type { LabReport } from '../data/samples';

export default function ReportTemplatesPage({ reports = [] }: { reports?: LabReport[] }) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selected, setSelected] = useState<ReportTemplateId>(reportsService.getSavedReportTemplate());
  const [reportId, setReportId] = useState(reports[0]?.id || '');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => { reportsService.listReportTemplates().then(setTemplates).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!reportId && reports[0]?.id) setReportId(reports[0].id); }, [reports, reportId]);

  const choose = (id: ReportTemplateId) => { setSelected(id); reportsService.saveReportTemplate(id); };
  const download = async () => { if (!reportId) return; setBusy(true); try { await reportsService.downloadReportPdf(reportId, undefined, selected); } finally { setBusy(false); } };
  const preview = async () => { if (!reportId) return; setBusy(true); try { await reportsService.openReportPdf(reportId, selected); } finally { setBusy(false); } };

  return <div className="saas-page report-templates-page">
    <div className="saas-page-header"><div><span className="saas-eyebrow">Report design</span><h1>Report Templates</h1><p>Choose the A4 laboratory report layout used for PDF generation.</p></div><div className="template-actions"><button className="saas-secondary-btn" onClick={preview} disabled={!reportId || busy}><Eye size={16}/> Preview</button><button className="saas-primary-btn" onClick={download} disabled={!reportId || busy}><Download size={16}/> {busy ? 'Generating…' : 'Download PDF'}</button></div></div>
    <div className="template-report-picker"><label>Preview with report</label><select value={reportId} onChange={e => setReportId(e.target.value)}><option value="">Select a final report</option>{reports.map(r => <option key={r.id} value={r.id}>{r.patientName} · {r.testType} · {(r as any).reportNumber || r.id}</option>)}</select></div>
    {loading ? <div className="template-loading">Loading templates…</div> : <div className="template-grid">{templates.map(template => <button type="button" key={template.id} onClick={() => choose(template.id)} className={`template-card ${selected === template.id ? 'selected' : ''}`}><div className={`template-paper ${template.id}`}><div className="paper-head"><span></span><i></i></div><div className="paper-patient"><b></b><b></b><b></b><b></b></div><div className="paper-title"></div><div className="paper-table"><em></em><em></em><em></em><em></em><em></em></div><div className="paper-footer"><span></span><span></span></div></div><div className="template-card-copy"><div><strong>{template.name}</strong><p>{template.description}</p></div>{selected === template.id && <CheckCircle2 size={20}/>}</div></button>)}</div>}
  </div>;
}

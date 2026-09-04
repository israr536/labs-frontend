import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, FileCheck2, FlaskConical, History, Plus, RefreshCw, Search, TestTube2 } from 'lucide-react';
import ordersService from '../services/ordersService';
import samplesService from '../services/samplesService';
import resultsService from '../services/resultsService';
import finalReportsService from '../services/finalReportsService';
import patientsService from '../services/patientsService';
import testsService from '../services/testsService';

type AnyRecord = Record<string, any>;
type Role = 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | string | undefined;

const statuses = ['ALL', 'REGISTERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'RESULT_ENTERED', 'VERIFIED', 'FINAL', 'CANCELLED'];
const workflow = ['REGISTERED', 'SAMPLE_COLLECTED', 'RESULT_ENTERED', 'VERIFIED', 'FINAL'];

function listData(value: any): AnyRecord[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function statusLabel(status?: string) {
  return (status ?? '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function statusTone(status?: string) {
  if (status === 'FINAL' || status === 'VERIFIED') return 'success';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'danger';
  if (status === 'PROCESSING' || status === 'RESULT_ENTERED') return 'warning';
  return 'neutral';
}

function workflowIndex(status?: string) {
  if (status === 'FINAL') return 4;
  if (status === 'VERIFIED') return 3;
  if (status === 'RESULT_ENTERED') return 2;
  if (status === 'PROCESSING' || status === 'SAMPLE_COLLECTED') return 1;
  return 0;
}

function errorMessage(error: any, fallback: string) {
  return error?.message || error?.response?.message || fallback;
}

export default function OrdersPage({ role }: { role?: Role }) {
  const [orders, setOrders] = useState<AnyRecord[]>([]);
  const [patients, setPatients] = useState<AnyRecord[]>([]);
  const [tests, setTests] = useState<AnyRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AnyRecord | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAmend, setShowAmend] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AnyRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [amendReason, setAmendReason] = useState('');

  const canCreateOrder = role === 'ADMIN' || role === 'RECEPTIONIST';
  const canOperateSamples = role === 'ADMIN' || role === 'RECEPTIONIST' || role === 'TECHNICIAN';
  const canEnterResults = role === 'ADMIN' || role === 'TECHNICIAN';
  const canAmend = role === 'ADMIN' || role === 'TECHNICIAN';

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const data = await ordersService.listOrders({ search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 50 });
      setOrders(listData(data));
    } catch (e: any) {
      setError(errorMessage(e, 'Unable to load orders'));
    } finally {
      setLoading(false);
    }
  }

  async function loadMasters() {
    try {
      const [patientData, testData] = await Promise.all([patientsService.listPatients(), testsService.listTests()]);
      setPatients(listData(patientData));
      setTests(listData(testData));
    } catch (e: any) {
      setError(errorMessage(e, 'Unable to load patients/tests'));
    }
  }

  useEffect(() => { void loadMasters(); }, []);
  useEffect(() => { void loadOrders(); }, [status]);

  async function openOrder(order: AnyRecord) {
    setBusy(true); setError(''); setNotice(''); setShowHistory(false);
    try {
      setSelectedOrder(await ordersService.getOrder(order.id));
    } catch (e: any) {
      setError(errorMessage(e, 'Unable to load order'));
    } finally {
      setBusy(false);
    }
  }

  async function createSamples() {
    if (!selectedOrder || !canOperateSamples) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const updated = await samplesService.createSamples(selectedOrder.id);
      setSelectedOrder(updated);
      setNotice('Samples generated successfully.');
      await loadOrders();
    } catch (e: any) { setError(errorMessage(e, 'Unable to create samples')); }
    finally { setBusy(false); }
  }

  async function updateSample(sample: AnyRecord, nextStatus: string) {
    if (!selectedOrder || !canOperateSamples) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await samplesService.updateSampleStatus(sample.id, nextStatus);
      setSelectedOrder(await ordersService.getOrder(selectedOrder.id));
      setNotice('Sample status updated.');
      await loadOrders();
    } catch (e: any) { setError(errorMessage(e, 'Unable to update sample')); }
    finally { setBusy(false); }
  }

  const resultRows = useMemo(() => {
    if (!selectedOrder) return [] as AnyRecord[];
    return listData(selectedOrder.items).flatMap((item: AnyRecord) => listData(item.test?.parameters).map((parameter: AnyRecord) => {
      const existing = listData(selectedOrder.results).find((result: AnyRecord) => result.parameterId === parameter.id && result.orderItemId === item.id);
      const sample = listData(selectedOrder.samples).find((s: AnyRecord) => s.specimenType === item.test?.sampleType);
      return { ...parameter, orderItemId: item.id, testName: item.test?.name, value: existing?.value ?? '', sampleId: existing?.sampleId ?? sample?.id ?? '' };
    }));
  }, [selectedOrder]);

  const [draftResults, setDraftResults] = useState<Record<string, { value: string; sampleId: string }>>({});
  useEffect(() => {
    const next: Record<string, { value: string; sampleId: string }> = {};
    resultRows.forEach((row) => { next[`${row.orderItemId}:${row.id}`] = { value: row.value, sampleId: row.sampleId }; });
    setDraftResults(next);
  }, [resultRows]);

  const editableRows = resultRows.map((row) => {
    const draft = draftResults[`${row.orderItemId}:${row.id}`];
    return { ...row, value: draft?.value ?? row.value, sampleId: draft?.sampleId ?? row.sampleId };
  });

  const canEditResults = Boolean(selectedOrder && canEnterResults && !['VERIFIED', 'FINAL', 'CANCELLED'].includes(selectedOrder.status));

  async function saveResults() {
    if (!selectedOrder || !canEditResults) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const results = editableRows.map((row) => ({ parameterId: row.parameterId, value: row.value, sampleId: row.sampleId || undefined }));
      await resultsService.saveResults(selectedOrder.id, results);
      setSelectedOrder(await ordersService.getOrder(selectedOrder.id));
      setNotice('Results saved.');
      await loadOrders();
    } catch (e: any) { setError(errorMessage(e, 'Unable to save results')); }
    finally { setBusy(false); }
  }

  async function verify() {
    if (!selectedOrder || !canEnterResults) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await resultsService.verifyResults(selectedOrder.id);
      setSelectedOrder(await ordersService.getOrder(selectedOrder.id));
      setNotice('Results verified successfully.');
      await loadOrders();
    } catch (e: any) { setError(errorMessage(e, 'Unable to verify results')); }
    finally { setBusy(false); }
  }

  async function finalize() {
    if (!selectedOrder || !canEnterResults) return;
    if (!window.confirm('Finalize this report? The finalized snapshot cannot be edited directly.')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await finalReportsService.finalizeReport(selectedOrder.id);
      setSelectedOrder(await ordersService.getOrder(selectedOrder.id));
      setNotice('Final report generated successfully.');
      await loadOrders();
    } catch (e: any) { setError(errorMessage(e, 'Unable to finalize report')); }
    finally { setBusy(false); }
  }

  async function downloadPdf() {
    if (!selectedOrder || selectedOrder.status !== 'FINAL') return;
    setBusy(true); setError('');
    try {
      const blob = await finalReportsService.downloadFinalReport(selectedOrder.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${selectedOrder.orderNumber || 'lab-report'}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e: any) { setError(errorMessage(e, 'Unable to download PDF')); }
    finally { setBusy(false); }
  }

  async function loadHistory() {
    if (!selectedOrder) return;
    setHistoryLoading(true); setError('');
    try {
      setHistory(listData(await finalReportsService.listReportVersions(selectedOrder.id)));
      setShowHistory(true);
    } catch (e: any) { setError(errorMessage(e, 'Unable to load report history')); }
    finally { setHistoryLoading(false); }
  }

  async function amendReport() {
    if (!selectedOrder || !canAmend || amendReason.trim().length < 5) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await finalReportsService.amendReport(selectedOrder.id, amendReason.trim());
      setAmendReason('');
      setShowAmend(false);
      setSelectedOrder(await ordersService.getOrder(selectedOrder.id));
      await loadOrders();
      await loadHistory();
      setNotice('Report amended and a new immutable version was created.');
    } catch (e: any) { setError(errorMessage(e, 'Unable to amend report')); }
    finally { setBusy(false); }
  }

  const currentStep = workflowIndex(selectedOrder?.status);

  return (
    <section className="orders-page">
      <div className="orders-header">
        <div><div className="eyebrow"><FlaskConical size={15} /> LAB OPERATIONS</div><h1>Orders & Results</h1><p>Manage registration, samples, result entry, verification and immutable final reports.</p></div>
        <div className="orders-actions"><button className="secondary-action" onClick={() => void loadOrders()} disabled={loading || busy}><RefreshCw size={16} /> Refresh</button>{canCreateOrder && <button className="primary-action" onClick={() => setShowCreate(true)}><Plus size={17} /> New Order</button>}</div>
      </div>

      {error && <div className="alert danger-alert">{error}</div>}
      {notice && <div className="alert success-alert">{notice}</div>}

      <div className="order-layout">
        <div className="orders-card">
          <div className="orders-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void loadOrders()} placeholder="Search order number..." /></div><select value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All statuses' : statusLabel(item)}</option>)}</select></div>
          {loading ? <div className="empty-state">Loading orders…</div> : orders.length === 0 ? <div className="empty-state"><ClipboardList size={32} /><strong>No orders found</strong><span>{canCreateOrder ? 'Create the first lab order to start the workflow.' : 'No orders match the current filters.'}</span></div> : <div className="orders-table-wrap"><table><thead><tr><th>Order</th><th>Patient</th><th>Tests</th><th>Status</th><th>Ordered</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected-row' : ''} onClick={() => void openOrder(order)}><td><strong>{order.orderNumber}</strong></td><td>{order.patient?.name ?? '—'}</td><td>{listData(order.items).length}</td><td><span className={`status-pill ${statusTone(order.status)}`}>{statusLabel(order.status)}</span></td><td>{order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div>}
        </div>

        <div className="order-detail-card">
          {!selectedOrder ? <div className="empty-state detail-empty"><TestTube2 size={38} /><strong>Select an order</strong><span>Choose an order from the list to manage its workflow.</span></div> : <>
            <div className="detail-heading"><div><span className="detail-order-number">{selectedOrder.orderNumber}</span><h2>{selectedOrder.patient?.name ?? 'Patient'}</h2><p>{selectedOrder.patient?.mobile ?? 'No mobile'} · {selectedOrder.patient?.gender ?? '—'}</p></div><span className={`status-pill ${statusTone(selectedOrder.status)}`}>{statusLabel(selectedOrder.status)}</span></div>

            <div className="workflow-steps">{workflow.map((step, index) => <div key={step} className={`workflow-step ${index <= currentStep && selectedOrder.status !== 'CANCELLED' ? 'active' : ''} ${index < currentStep && selectedOrder.status !== 'CANCELLED' ? 'complete' : ''}`}><span>{index + 1}</span>{statusLabel(step)}</div>)}</div>
            {selectedOrder.status === 'CANCELLED' && <div className="immutable-note danger-note">This order is cancelled and no further workflow actions are available.</div>}
            {selectedOrder.status === 'FINAL' && <div className="immutable-note"><FileCheck2 size={16} /><span><strong>Final report is immutable.</strong> Any correction must use the Amend Report flow, which records a mandatory reason and creates a new version.</span></div>}

            <div className="detail-section"><div className="section-title"><h3><TestTube2 size={17} /> Samples</h3>{canOperateSamples && !listData(selectedOrder.samples).length && selectedOrder.status === 'REGISTERED' && <button className="small-primary" onClick={() => void createSamples()} disabled={busy}>Generate Samples</button>}</div>
              {listData(selectedOrder.samples).length === 0 ? <p className="muted">No samples generated yet.</p> : <div className="sample-list">{listData(selectedOrder.samples).map((sample) => <div className="sample-row" key={sample.id}><div><strong>{sample.accessionNumber}</strong><span>{sample.specimenType} · {sample.container || 'Container not specified'}</span></div><select value={sample.status} disabled={busy || !canOperateSamples || sample.status === 'COMPLETED' || sample.status === 'REJECTED'} onChange={(e) => void updateSample(sample, e.target.value)}><option value="PENDING">Pending</option><option value="COLLECTED">Collected</option><option value="RECEIVED">Received</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="REJECTED">Rejected</option></select></div>)}</div>}
              {!canOperateSamples && <p className="permission-note">Your role is view-only for sample operations.</p>}
            </div>

            <div className="detail-section"><div className="section-title"><h3><ClipboardList size={17} /> Result Entry</h3>{canEditResults && <button className="small-primary" onClick={() => void saveResults()} disabled={busy || !editableRows.length}>Save Results</button>}</div>
              {!editableRows.length ? <p className="muted">No test parameters are available for this order.</p> : <div className="results-table-wrap"><table className="results-table"><thead><tr><th>Test</th><th>Parameter</th><th>Result</th><th>Unit</th><th>Reference</th><th>Flag</th></tr></thead><tbody>{editableRows.map((row) => { const numeric = Number(row.value); const min = row.normalMin; const max = row.normalMax; const flag = row.value !== '' && Number.isFinite(numeric) && min != null && max != null ? numeric < Number(min) ? 'LOW' : numeric > Number(max) ? 'HIGH' : 'NORMAL' : '—'; const key = `${row.orderItemId}:${row.id}`; return <tr key={key}><td>{row.testName}</td><td><strong>{row.name}</strong></td><td><input disabled={!canEditResults || busy} value={row.value} onChange={(e) => setDraftResults((current) => ({ ...current, [key]: { ...current[key], value: e.target.value } }))} placeholder="Enter result" /></td><td>{row.unit || '—'}</td><td>{row.normalMin != null && row.normalMax != null ? `${row.normalMin} – ${row.normalMax}` : '—'}</td><td><span className={`result-flag ${flag.toLowerCase()}`}>{flag}</span></td></tr>; })}</tbody></table></div>}
              {!canEnterResults && <p className="permission-note">Your role cannot enter or verify results. A technician or administrator must complete this step.</p>}
            </div>

            <div className="detail-footer-actions">
              {selectedOrder.status === 'RESULT_ENTERED' && canEnterResults && <button className="verify-action" onClick={() => void verify()} disabled={busy}><CheckCircle2 size={17} /> Verify Results</button>}
              {selectedOrder.status === 'VERIFIED' && canEnterResults && <button className="finalize-action" onClick={() => void finalize()} disabled={busy}><FileCheck2 size={17} /> Finalize Report</button>}
              {selectedOrder.status === 'FINAL' && <><button className="secondary-action" onClick={() => void loadHistory()} disabled={historyLoading}><History size={17} /> Version History</button><button className="primary-action" onClick={() => void downloadPdf()} disabled={busy}><FileCheck2 size={17} /> Download Final PDF</button>{canAmend && <button className="finalize-action" onClick={() => setShowAmend(true)} disabled={busy}>Amend Report</button>}</>}
            </div>

            {showHistory && <div className="history-panel"><div className="history-heading"><div><strong>Report version history</strong><span>Immutable snapshots created during finalization and amendments.</span></div><button className="secondary-action" onClick={() => setShowHistory(false)}>Close</button></div>{historyLoading ? <p className="muted">Loading versions…</p> : history.length === 0 ? <p className="muted">No report versions found.</p> : <div className="history-list">{history.map((version, index) => <div className="history-row" key={version.id ?? index}><div><strong>Version {version.version ?? version.versionNumber ?? index + 1}</strong><span>{version.createdAt ? new Date(version.createdAt).toLocaleString() : 'Date unavailable'} · {version.createdBy?.email ?? version.createdBy?.username ?? 'System user'}</span></div><span className="version-badge">Immutable</span></div>)}</div>}</div>}
          </>}
        </div>
      </div>

      {showCreate && <CreateOrderModal patients={patients} tests={tests} busy={busy} onClose={() => setShowCreate(false)} onCreated={async (order) => { setShowCreate(false); await loadOrders(); setSelectedOrder(order); }} onError={setError} />}
      {showAmend && selectedOrder && <div className="orders-modal-backdrop"><div className="orders-modal"><div className="eyebrow">AMEND FINAL REPORT</div><h2>Record correction</h2><p className="modal-description">The current report remains part of the audit history. Enter a clear reason for this amendment; a new immutable version will be created.</p><div className="modal-field"><label>Reason * (minimum 5 characters)</label><textarea autoFocus value={amendReason} onChange={(e) => setAmendReason(e.target.value)} maxLength={500} placeholder="Explain what was corrected and why" /><small>{amendReason.trim().length}/500</small></div><div className="modal-actions"><button className="secondary-action" onClick={() => { setShowAmend(false); setAmendReason(''); }} disabled={busy}>Cancel</button><button className="finalize-action" onClick={() => void amendReport()} disabled={busy || amendReason.trim().length < 5}>Create New Version</button></div></div></div>}

      <style>{` .orders-page{padding:2rem;max-width:1600px;margin:0 auto}.orders-header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1.5rem}.orders-header h1{margin:.25rem 0 .35rem;color:var(--text-bold);font-size:2rem}.orders-header p,.muted{color:var(--text);margin:0}.eyebrow{display:flex;align-items:center;gap:.4rem;color:var(--primary);font-size:.75rem;font-weight:800;letter-spacing:.08em}.orders-actions{display:flex;gap:.65rem}.primary-action,.secondary-action,.small-primary,.verify-action,.finalize-action{border:0;border-radius:9px;padding:.72rem 1rem;display:inline-flex;align-items:center;gap:.45rem;font-weight:700;cursor:pointer}.primary-action,.small-primary{background:var(--primary);color:#fff}.secondary-action{background:var(--panel-bg);color:var(--text-bold);border:1px solid var(--border)}.small-primary{font-size:.8rem;padding:.55rem .75rem}.verify-action{background:#0f766e;color:#fff}.finalize-action{background:#7c3aed;color:#fff}.primary-action:disabled,.secondary-action:disabled,.small-primary:disabled,.verify-action:disabled,.finalize-action:disabled{opacity:.55;cursor:not-allowed}.alert{padding:.75rem 1rem;border-radius:9px;margin-bottom:1rem}.danger-alert{background:#fee2e2;color:#991b1b}.success-alert{background:#dcfce7;color:#166534}.order-layout{display:grid;grid-template-columns:minmax(520px,1fr) minmax(600px,1.35fr);gap:1rem}.orders-card,.order-detail-card{background:var(--panel-bg);border:1px solid var(--border);border-radius:14px;box-shadow:0 5px 18px rgba(15,23,42,.04);overflow:hidden}.orders-toolbar{padding:1rem;border-bottom:1px solid var(--border);display:flex;gap:.75rem}.search-box{display:flex;align-items:center;gap:.5rem;border:1px solid var(--border);border-radius:9px;padding:0 .75rem;flex:1}.search-box input{border:0;outline:0;background:transparent;color:var(--text-bold);width:100%;padding:.65rem 0}.orders-toolbar select,.sample-row select{border:1px solid var(--border);border-radius:8px;background:var(--panel-bg);color:var(--text-bold);padding:.65rem}.orders-table-wrap,.results-table-wrap{overflow:auto}.orders-card table,.results-table{width:100%;border-collapse:collapse}.orders-card th,.orders-card td,.results-table th,.results-table td{text-align:left;padding:.8rem;border-bottom:1px solid var(--border);font-size:.84rem}.orders-card th,.results-table th{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:var(--text);white-space:nowrap}.orders-card tbody tr{cursor:pointer}.orders-card tbody tr:hover,.selected-row{background:rgba(6,96,137,.05)}.status-pill,.result-flag{display:inline-flex;border-radius:999px;padding:.25rem .55rem;font-size:.68rem;font-weight:800}.status-pill.success,.result-flag.normal{background:#dcfce7;color:#166534}.status-pill.warning,.result-flag.high,.result-flag.low{background:#fef3c7;color:#92400e}.status-pill.danger{background:#fee2e2;color:#991b1b}.status-pill.neutral{background:#e2e8f0;color:#475569}.order-detail-card{padding:1.25rem}.detail-heading{display:flex;justify-content:space-between;gap:1rem}.detail-order-number{font-size:.72rem;color:var(--primary);font-weight:800}.detail-heading h2{margin:.25rem 0;font-size:1.35rem;color:var(--text-bold)}.detail-heading p{margin:0;color:var(--text);font-size:.82rem}.workflow-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem;margin:1.25rem 0}.workflow-step{font-size:.66rem;color:var(--text);display:flex;align-items:center;gap:.35rem}.workflow-step span{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#e2e8f0;color:#475569;font-weight:800;flex:none}.workflow-step.active{color:var(--primary);font-weight:800}.workflow-step.active span{background:var(--primary);color:#fff}.workflow-step.complete span{box-shadow:inset 0 0 0 2px var(--panel-bg)}.detail-section{border-top:1px solid var(--border);padding-top:1rem;margin-top:1rem}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}.section-title h3{margin:0;display:flex;align-items:center;gap:.4rem;font-size:.95rem;color:var(--text-bold)}.sample-list{display:grid;gap:.55rem}.sample-row{display:flex;justify-content:space-between;gap:1rem;padding:.7rem;border:1px solid var(--border);border-radius:9px}.sample-row div{display:grid;gap:.2rem}.sample-row span{font-size:.76rem;color:var(--text)}.results-table input{width:110px;border:1px solid var(--border);border-radius:6px;padding:.45rem;background:var(--panel-bg);color:var(--text-bold)}.detail-footer-actions{display:flex;justify-content:flex-end;gap:.6rem;margin-top:1.25rem;flex-wrap:wrap}.empty-state{min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;color:var(--text);padding:2rem}.empty-state strong{color:var(--text-bold)}.detail-empty{min-height:600px}.permission-note{font-size:.72rem;color:var(--text);margin:.6rem 0 0}.immutable-note{display:flex;gap:.5rem;align-items:flex-start;margin-top:1rem;padding:.75rem;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);font-size:.76rem;color:var(--text)}.immutable-note strong{color:var(--text-bold)}.danger-note{background:#fff7f7;color:#991b1b}.history-panel{border-top:1px solid var(--border);margin-top:1.25rem;padding-top:1rem}.history-heading{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:.75rem}.history-heading div{display:grid;gap:.2rem}.history-heading span{font-size:.72rem;color:var(--text)}.history-list{display:grid;gap:.5rem}.history-row{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.7rem;border:1px solid var(--border);border-radius:9px}.history-row div{display:grid;gap:.2rem}.history-row span{font-size:.72rem;color:var(--text)}.version-badge{border-radius:999px;padding:.25rem .5rem;background:#e2e8f0;color:#475569;font-weight:800;white-space:nowrap}.orders-modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);display:grid;place-items:center;padding:1rem;z-index:1000}.orders-modal{background:var(--panel-bg);border-radius:14px;border:1px solid var(--border);width:min(760px,100%);max-height:90vh;overflow:auto;padding:1.25rem}.orders-modal h2{margin:.2rem 0;color:var(--text-bold)}.modal-description{font-size:.78rem;color:var(--text);line-height:1.5}.modal-field{display:grid;gap:.35rem;margin-top:1rem}.modal-field label{font-size:.75rem;font-weight:700;color:var(--text)}.modal-field textarea{border:1px solid var(--border);border-radius:8px;padding:.65rem;background:var(--panel-bg);color:var(--text-bold);min-height:110px;resize:vertical}.modal-field small{color:var(--text);text-align:right}.modal-actions{display:flex;justify-content:flex-end;gap:.6rem;margin-top:1rem}.modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:1rem}.modal-field.full{grid-column:1/-1}.modal-field input,.modal-field select{border:1px solid var(--border);border-radius:8px;padding:.65rem;background:var(--panel-bg);color:var(--text-bold)}.test-checks{display:grid;grid-template-columns:1fr 1fr;gap:.45rem;max-height:220px;overflow:auto;border:1px solid var(--border);border-radius:8px;padding:.65rem}.test-check{display:flex;gap:.5rem;align-items:flex-start;font-size:.8rem;color:var(--text-bold)}@media(max-width:1100px){.order-layout{grid-template-columns:1fr}.detail-empty{min-height:300px}}@media(max-width:700px){.orders-page{padding:1rem}.orders-header{flex-direction:column}.modal-grid{grid-template-columns:1fr}.modal-field.full{grid-column:auto}.test-checks{grid-template-columns:1fr}.workflow-steps{grid-template-columns:1fr 1fr}.orders-toolbar{flex-direction:column}.sample-row{align-items:flex-start;flex-direction:column}.detail-footer-actions>*{width:100%;justify-content:center}}`}</style>
    </section>
  );
}

function CreateOrderModal({ patients, tests, busy, onClose, onCreated, onError }: { patients: AnyRecord[]; tests: AnyRecord[]; busy: boolean; onClose: () => void; onCreated: (order: AnyRecord) => void; onError: (message: string) => void }) {
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [referredBy, setReferredBy] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  async function submit() {
    if (!patientId || !selectedTests.length) { onError('Select a patient and at least one test.'); return; }
    try {
      const order = await ordersService.createOrder({ patientId, testIds: selectedTests, referredBy: referredBy || undefined, clinicalNotes: clinicalNotes || undefined });
      onCreated(order);
    } catch (e: any) { onError(errorMessage(e, 'Unable to create order')); }
  }

  return <div className="orders-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="orders-modal">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div className="eyebrow">NEW ORDER</div><h2>Create Lab Order</h2></div><button className="secondary-action" onClick={onClose}>Close</button></div>
    <div className="modal-grid"><div className="modal-field full"><label>Patient *</label><select value={patientId} onChange={(e) => setPatientId(e.target.value)}><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} {patient.mobile ? `· ${patient.mobile}` : ''}</option>)}</select></div><div className="modal-field full"><label>Tests *</label><div className="test-checks">{tests.filter((test) => test.isActive !== false).map((test) => <label className="test-check" key={test.id}><input type="checkbox" checked={selectedTests.includes(test.id)} onChange={(e) => setSelectedTests((current) => e.target.checked ? [...current, test.id] : current.filter((id) => id !== test.id))} /><span><strong>{test.name}</strong><br />{test.code || 'No code'} · {test.price != null ? `₹${test.price}` : 'Price not set'}</span></label>)}</div></div><div className="modal-field"><label>Referrer</label><input value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Doctor / clinic" /></div><div className="modal-field"><label>Clinical notes</label><input value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Optional clinical information" /></div></div>
    <div className="modal-actions"><button className="secondary-action" onClick={onClose}>Cancel</button><button className="primary-action" onClick={() => void submit()} disabled={busy}><Plus size={16} /> Create Order</button></div>
  </div></div>;
}

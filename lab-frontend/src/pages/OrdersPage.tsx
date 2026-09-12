import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, FileCheck2, FlaskConical, History, Plus, RefreshCw, Search, TestTube2 } from 'lucide-react';
import ordersService from '../services/ordersService';
import samplesService from '../services/samplesService';
import resultsService from '../services/resultsService';
import finalReportsService from '../services/finalReportsService';
import patientsService from '../services/patientsService';
import TestCatalogPicker from '../components/TestCatalogPicker';

type AnyRecord = Record<string, any>;
type Role = 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | string | undefined;

const statuses = ['ALL', 'REGISTERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'RESULT_ENTERED', 'VERIFIED', 'FINAL', 'CANCELLED'];
const workflow = ['REGISTERED', 'SAMPLE_COLLECTED', 'RESULT_ENTERED', 'VERIFIED', 'FINAL'];

function listData(value: any): AnyRecord[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}
function statusLabel(status?: string) { return (status ?? '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()); }
function statusTone(status?: string) {
  if (status === 'FINAL' || status === 'VERIFIED') return 'success';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'danger';
  if (status === 'PROCESSING' || status === 'RESULT_ENTERED') return 'warning';
  return 'neutral';
}
function workflowIndex(status?: string) { if (status === 'FINAL') return 4; if (status === 'VERIFIED') return 3; if (status === 'RESULT_ENTERED') return 2; if (status === 'PROCESSING' || status === 'SAMPLE_COLLECTED') return 1; return 0; }
function errorMessage(error: any, fallback: string) { return error?.message || error?.response?.message || fallback; }

export default function OrdersPage({ role }: { role?: Role }) {
  const [orders, setOrders] = useState<AnyRecord[]>([]);
  const [patients, setPatients] = useState<AnyRecord[]>([]);
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
    setLoading(true); setError('');
    try { const data = await ordersService.listOrders({ search: search || undefined, status: status === 'ALL' ? undefined : status, limit: 50 }); setOrders(listData(data)); }
    catch (e: any) { setError(errorMessage(e, 'Unable to load orders')); }
    finally { setLoading(false); }
  }
  async function loadMasters() {
    try { setPatients(listData(await patientsService.listPatients())); }
    catch (e: any) { setError(errorMessage(e, 'Unable to load patients')); }
  }
  useEffect(() => { void loadMasters(); }, []);
  useEffect(() => { void loadOrders(); }, [status]);

  async function openOrder(order: AnyRecord) { setBusy(true); setError(''); setNotice(''); setShowHistory(false); try { setSelectedOrder(await ordersService.getOrder(order.id)); } catch (e: any) { setError(errorMessage(e, 'Unable to load order')); } finally { setBusy(false); } }
  async function createSamples() { if (!selectedOrder || !canOperateSamples) return; setBusy(true); setError(''); setNotice(''); try { const updated = await samplesService.createSamples(selectedOrder.id); setSelectedOrder(updated); setNotice('Samples generated successfully.'); await loadOrders(); } catch (e: any) { setError(errorMessage(e, 'Unable to create samples')); } finally { setBusy(false); } }
  async function updateSample(sample: AnyRecord, nextStatus: string) { if (!selectedOrder || !canOperateSamples) return; setBusy(true); setError(''); setNotice(''); try { await samplesService.updateSampleStatus(sample.id, nextStatus); setSelectedOrder(await ordersService.getOrder(selectedOrder.id)); setNotice('Sample status updated.'); await loadOrders(); } catch (e: any) { setError(errorMessage(e, 'Unable to update sample')); } finally { setBusy(false); } }

  const resultRows = useMemo(() => {
    if (!selectedOrder) return [] as AnyRecord[];
    return listData(selectedOrder.items).flatMap((item: AnyRecord) => listData(item.test?.parameters).map((parameter: AnyRecord) => {
      const existing = listData(selectedOrder.results).find((result: AnyRecord) => result.parameterId === parameter.id && result.orderItemId === item.id);
      const sample = listData(selectedOrder.samples).find((s: AnyRecord) => s.specimenType === item.test?.sampleType);
      return { ...parameter, orderItemId: item.id, testName: item.test?.name, value: existing?.value ?? '', sampleId: existing?.sampleId ?? sample?.id ?? '' };
    }));
  }, [selectedOrder]);

  const [draftResults, setDraftResults] = useState<Record<string, { value: string; sampleId: string }>>({});
  useEffect(() => { const next: Record<string, { value: string; sampleId: string }> = {}; resultRows.forEach((row) => { next[`${row.orderItemId}:${row.id}`] = { value: row.value, sampleId: row.sampleId }; }); setDraftResults(next); }, [resultRows]);
  const editableRows = resultRows.map((row) => { const draft = draftResults[`${row.orderItemId}:${row.id}`]; return { ...row, value: draft?.value ?? row.value, sampleId: draft?.sampleId ?? row.sampleId }; });
  const canEditResults = Boolean(selectedOrder && canEnterResults && !['VERIFIED', 'FINAL', 'CANCELLED'].includes(selectedOrder.status));

  async function saveResults() { if (!selectedOrder || !canEditResults) return; setBusy(true); setError(''); setNotice(''); try { await resultsService.saveResults(selectedOrder.id, editableRows.map((row) => ({ parameterId: row.parameterId, value: row.value, sampleId: row.sampleId || undefined }))); setSelectedOrder(await ordersService.getOrder(selectedOrder.id)); setNotice('Results saved.'); await loadOrders(); } catch (e: any) { setError(errorMessage(e, 'Unable to save results')); } finally { setBusy(false); } }
  async function verify() { if (!selectedOrder || !canEnterResults) return; setBusy(true); setError(''); setNotice(''); try { await resultsService.verifyResults(selectedOrder.id); setSelectedOrder(await ordersService.getOrder(selectedOrder.id)); setNotice('Results verified successfully.'); await loadOrders(); } catch (e: any) { setError(errorMessage(e, 'Unable to verify results')); } finally { setBusy(false); } }
  async function finalize() { if (!selectedOrder || !canEnterResults) return; if (!window.confirm('Finalize this report? The finalized snapshot cannot be edited directly.')) return; setBusy(true); setError(''); setNotice(''); try { await finalReportsService.finalizeReport(selectedOrder.id); setSelectedOrder(await ordersService.getOrder(selectedOrder.id)); setNotice('Final report generated successfully.'); await loadOrders(); } catch (e: any) { setError(errorMessage(e, 'Unable to finalize report')); } finally { setBusy(false); } }
  async function downloadPdf() { if (!selectedOrder || selectedOrder.status !== 'FINAL') return; setBusy(true); setError(''); try { const blob = await finalReportsService.downloadFinalReport(selectedOrder.id); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${selectedOrder.orderNumber || 'lab-report'}.pdf`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (e: any) { setError(errorMessage(e, 'Unable to download PDF')); } finally { setBusy(false); } }
  async function loadHistory() { if (!selectedOrder) return; setHistoryLoading(true); setError(''); try { setHistory(listData(await finalReportsService.listReportVersions(selectedOrder.id))); setShowHistory(true); } catch (e: any) { setError(errorMessage(e, 'Unable to load report history')); } finally { setHistoryLoading(false); } }
  async function amendReport() { if (!selectedOrder || !canAmend || amendReason.trim().length < 5) return; setBusy(true); setError(''); setNotice(''); try { await finalReportsService.amendReport(selectedOrder.id, amendReason.trim()); setAmendReason(''); setShowAmend(false); setSelectedOrder(await ordersService.getOrder(selectedOrder.id)); await loadOrders(); await loadHistory(); setNotice('Report amended and a new immutable version was created.'); } catch (e: any) { setError(errorMessage(e, 'Unable to amend report')); } finally { setBusy(false); } }

  const currentStep = workflowIndex(selectedOrder?.status);

  return (
    <section className="orders-page">
      <div className="orders-header"><div><div className="eyebrow"><FlaskConical size={15} /> LAB OPERATIONS</div><h1>Orders & Results</h1><p>Manage registration, samples, result entry, verification and immutable final reports.</p></div><div className="orders-actions"><button className="secondary-action" onClick={() => void loadOrders()} disabled={loading || busy}><RefreshCw size={16} /> Refresh</button>{canCreateOrder && <button className="primary-action" onClick={() => setShowCreate(true)}><Plus size={17} /> New Report</button>}</div></div>
      {error && <div className="alert danger-alert">{error}</div>}{notice && <div className="alert success-alert">{notice}</div>}
      <div className="order-layout">
        <div className="orders-card"><div className="orders-toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void loadOrders()} placeholder="Search order number or patient..." /></div><select value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All statuses' : statusLabel(item)}</option>)}</select></div>{loading ? <div className="empty-state">Loading orders…</div> : orders.length === 0 ? <div className="empty-state"><ClipboardList size={32} /><strong>No orders found</strong><span>{canCreateOrder ? 'Create the first lab order to start the workflow.' : 'No orders match the current filters.'}</span></div> : <div className="orders-table-wrap"><table><thead><tr><th>Order</th><th>Patient</th><th>Tests</th><th>Status</th><th>Ordered</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className={selectedOrder?.id === order.id ? 'selected-row' : ''} onClick={() => void openOrder(order)}><td><strong>{order.orderNumber}</strong></td><td>{order.patient?.name ?? '—'}</td><td>{listData(order.items).length}</td><td><span className={`status-pill ${statusTone(order.status)}`}>{statusLabel(order.status)}</span></td><td>{order.orderedAt ? new Date(order.orderedAt).toLocaleDateString() : '—'}</td></tr>)}</tbody></table></div>}</div>
        <div className="order-detail-card">{!selectedOrder ? <div className="empty-state detail-empty"><TestTube2 size={38} /><strong>Select an order</strong><span>Choose an order from the list to manage its workflow.</span></div> : <>
          <div className="detail-heading"><div><span className="detail-order-number">{selectedOrder.orderNumber}</span><h2>{selectedOrder.patient?.name ?? 'Patient'}</h2><p>{selectedOrder.patient?.mobile ?? 'No mobile'} · {selectedOrder.patient?.gender ?? '—'}</p></div><span className={`status-pill ${statusTone(selectedOrder.status)}`}>{statusLabel(selectedOrder.status)}</span></div>
          <div className="workflow-steps">{workflow.map((step, index) => <div key={step} className={`workflow-step ${index <= currentStep && selectedOrder.status !== 'CANCELLED' ? 'active' : ''} ${index < currentStep && selectedOrder.status !== 'CANCELLED' ? 'complete' : ''}`}><span>{index + 1}</span>{statusLabel(step)}</div>)}</div>
          {selectedOrder.status === 'CANCELLED' && <div className="immutable-note danger-note">This order is cancelled and no further workflow actions are available.</div>}
          {selectedOrder.status === 'FINAL' && <div className="immutable-note"><FileCheck2 size={16} /><span><strong>Final report is immutable.</strong> Any correction must use the Amend Report flow, which records a mandatory reason and creates a new version.</span></div>}
          <div className="detail-section"><div className="section-title"><h3><TestTube2 size={17} /> Samples</h3>{canOperateSamples && !listData(selectedOrder.samples).length && selectedOrder.status === 'REGISTERED' && <button className="small-primary" onClick={() => void createSamples()} disabled={busy}>Generate Samples</button>}</div>{listData(selectedOrder.samples).length === 0 ? <p className="muted">No samples generated yet.</p> : <div className="sample-list">{listData(selectedOrder.samples).map((sample) => <div className="sample-row" key={sample.id}><div><strong>{sample.accessionNumber}</strong><span>{sample.specimenType} · {sample.container || 'Container not specified'}</span></div><select value={sample.status} disabled={busy || !canOperateSamples || sample.status === 'COMPLETED' || sample.status === 'REJECTED'} onChange={(e) => void updateSample(sample, e.target.value)}><option value="PENDING">Pending</option><option value="COLLECTED">Collected</option><option value="RECEIVED">Received</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="REJECTED">Rejected</option></select></div>)}</div>}{!canOperateSamples && <p className="permission-note">Your role is view-only for sample operations.</p>}</div>
          <div className="detail-section"><div className="section-title"><h3><ClipboardList size={17} /> Result Entry</h3>{canEditResults && <button className="small-primary" onClick={() => void saveResults()} disabled={busy || !editableRows.length}>Save Results</button>}</div>{!editableRows.length ? <p className="muted">No test parameters are available for this order.</p> : <div className="results-table-wrap"><table className="results-table"><thead><tr><th>Test</th><th>Parameter</th><th>Result</th><th>Unit</th><th>Reference</th><th>Flag</th></tr></thead><tbody>{editableRows.map((row) => { const numeric = Number(row.value); const min = row.normalMin; const max = row.normalMax; const flag = row.value !== '' && Number.isFinite(numeric) && min != null && max != null ? numeric < Number(min) ? 'LOW' : numeric > Number(max) ? 'HIGH' : 'NORMAL' : '—'; const key = `${row.orderItemId}:${row.id}`; return <tr key={key}><td>{row.testName}</td><td><strong>{row.name}</strong></td><td><input disabled={!canEditResults || busy} value={row.value} onChange={(e) => setDraftResults((current) => ({ ...current, [key]: { ...current[key], value: e.target.value } }))} placeholder="Enter result" /></td><td>{row.unit || '—'}</td><td>{row.normalMin != null && row.normalMax != null ? `${row.normalMin} – ${row.normalMax}` : '—'}</td><td><span className={`result-flag ${flag.toLowerCase()}`}>{flag}</span></td></tr>; })}</tbody></table></div>}{!canEnterResults && <p className="permission-note">Your role cannot enter or verify results. A technician or administrator must complete this step.</p>}</div>
          <div className="detail-footer-actions">{selectedOrder.status === 'RESULT_ENTERED' && canEnterResults && <button className="verify-action" onClick={() => void verify()} disabled={busy}><CheckCircle2 size={17} /> Verify Results</button>}{selectedOrder.status === 'VERIFIED' && canEnterResults && <button className="finalize-action" onClick={() => void finalize()} disabled={busy}><FileCheck2 size={17} /> Finalize Report</button>}{selectedOrder.status === 'FINAL' && <><button className="secondary-action" onClick={() => void loadHistory()} disabled={historyLoading}><History size={17} /> Version History</button><button className="primary-action" onClick={() => void downloadPdf()} disabled={busy}><FileCheck2 size={17} /> Download Final PDF</button>{canAmend && <button className="finalize-action" onClick={() => setShowAmend(true)} disabled={busy}>Amend Report</button>}</>}</div>
          {showHistory && <div className="history-panel"><div className="history-heading"><div><strong>Report version history</strong><span>Immutable snapshots created during finalization and amendments.</span></div><button className="secondary-action" onClick={() => setShowHistory(false)}>Close</button></div>{historyLoading ? <p className="muted">Loading versions…</p> : history.length === 0 ? <p className="muted">No report versions found.</p> : <div className="history-list">{history.map((version, index) => <div className="history-row" key={version.id ?? index}><div><strong>Version {version.version ?? version.versionNumber ?? index + 1}</strong><span>{version.createdAt ? new Date(version.createdAt).toLocaleString() : 'Date unavailable'} · {version.createdBy?.email ?? version.createdBy?.username ?? 'System user'}</span></div><span className="version-badge">Immutable</span></div>)}</div>}</div>}
        </div></>}
      </div>
      {showCreate && <CreateOrderModal patients={patients} busy={busy} onClose={() => setShowCreate(false)} onCreated={async (order) => { setShowCreate(false); await loadOrders(); setSelectedOrder(order); }} onError={setError} />}
      {showAmend && selectedOrder && <div className="orders-modal-backdrop"><div className="orders-modal"><div className="eyebrow">AMEND FINAL REPORT</div><h2>Record correction</h2><p className="modal-description">The current report remains part of the audit history. Enter a clear reason for this amendment; a new immutable version will be created.</p><div className="modal-field"><label>Reason * (minimum 5 characters)</label><textarea autoFocus value={amendReason} onChange={(e) => setAmendReason(e.target.value)} maxLength={500} placeholder="Explain what was corrected and why" /><small>{amendReason.trim().length}/500</small></div><div className="modal-actions"><button className="secondary-action" onClick={() => { setShowAmend(false); setAmendReason(''); }} disabled={busy}>Cancel</button><button className="finalize-action" onClick={() => void amendReport()} disabled={busy || amendReason.trim().length < 5}>Create New Version</button></div></div></div>}

    </section>
  );
}

function CreateOrderModal({ patients, busy, onClose, onCreated, onError }: { patients: AnyRecord[]; busy: boolean; onClose: () => void; onCreated: (order: AnyRecord) => void; onError: (message: string) => void }) {
  const [patientId, setPatientId] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [referredBy, setReferredBy] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  async function submit() {
    if (!patientId || !selectedTests.length) return;
    try { const order = await ordersService.createOrder({ patientId, testIds: selectedTests, referredBy: referredBy || undefined, clinicalNotes: clinicalNotes || undefined }); onCreated(order); }
    catch (e: any) { onError(errorMessage(e, 'Unable to create order')); }
  }

  return <div className="orders-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><div className="orders-modal">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}><div><div className="eyebrow">NEW LAB REPORT</div><h2>Create Laboratory Report</h2><p className="modal-description">Choose a patient and search the complete master test catalog. Only tests enabled for this laboratory can be ordered.</p></div><button className="secondary-action" onClick={onClose}>Close</button></div>
    <div className="modal-grid">
      <div className="modal-field full"><label>Patient *</label><select value={patientId} onChange={(e) => setPatientId(e.target.value)}><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} {patient.mobile ? `· ${patient.mobile}` : ''}</option>)}</select></div>
      <div className="modal-field full create-order-tests"><label>Tests * <span style={{fontWeight:400,color:'var(--text)'}}>· Search by name, code, short name or synonym</span></label><TestCatalogPicker selectedIds={selectedTests} onChange={setSelectedTests} disabled={busy} /></div>
      <div className="modal-field"><label>Referrer</label><input value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="Doctor / clinic" /></div>
      <div className="modal-field"><label>Clinical notes</label><input value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Optional clinical information" /></div>
    </div>
    <div className="modal-actions"><button className="secondary-action" onClick={onClose}>Cancel</button><button className="primary-action" onClick={() => void submit()} disabled={busy || !patientId || !selectedTests.length}><Plus size={16} /> Create Report{selectedTests.length ? ` · ${selectedTests.length}` : ''}</button></div>
  </div></div>;
}

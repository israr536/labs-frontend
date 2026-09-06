import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import criticalResultsService, { type CriticalNotificationMethod, type CriticalResult } from '../services/criticalResultsService';

type Props = { role?: string };

const methods: Array<{ value: CriticalNotificationMethod; label: string }> = [
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'ELECTRONIC', label: 'Electronic' },
  { value: 'OTHER', label: 'Other' },
];

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function CriticalResultsPage({ role }: Props) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<CriticalResult | null>(null);
  const [method, setMethod] = useState<CriticalNotificationMethod>('PHONE');
  const [recipient, setRecipient] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [readBackConfirmed, setReadBackConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(true);
  const [ackNote, setAckNote] = useState('');

  const query = useQuery({
    queryKey: ['critical-results', 'pending'],
    queryFn: criticalResultsService.pending,
    refetchInterval: 30000,
  });

  const notifyMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error('Select a critical result first');
      return criticalResultsService.notify(selected.id, {
        method,
        successful: success,
        recipient: recipient || undefined,
        contactDetails: contactDetails || undefined,
        readBackConfirmed,
        note: notes || undefined,
      });
    },
    onSuccess: () => {
      setRecipient('');
      setContactDetails('');
      setNotes('');
      setReadBackConfirmed(false);
      queryClient.invalidateQueries({ queryKey: ['critical-results', 'pending'] });
      if (selected) criticalResultsService.get(selected.id).then(setSelected).catch(() => setSelected(null));
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error('Select a critical result first');
      return criticalResultsService.acknowledge(selected.id, ackNote || undefined);
    },
    onSuccess: () => {
      setSelected(null);
      setAckNote('');
      queryClient.invalidateQueries({ queryKey: ['critical-results', 'pending'] });
    },
  });

  const pending = query.data ?? [];
  const selectedIsNotified = selected?.status === 'NOTIFIED';
  const canAcknowledge = selectedIsNotified;
  const busy = notifyMutation.isPending || acknowledgeMutation.isPending;
  const errorMessage = useMemo(() => {
    const error = notifyMutation.error || acknowledgeMutation.error || query.error;
    return error instanceof Error ? error.message : error ? 'Unable to complete the critical-result action' : '';
  }, [notifyMutation.error, acknowledgeMutation.error, query.error]);

  if (role === 'RECEPTIONIST') {
    return <section className="saas-page"><div className="saas-page-header"><div><span className="saas-eyebrow">Clinical safety</span><h1>Critical Results</h1><p>Access is restricted to clinical laboratory staff.</p></div></div></section>;
  }

  return <section className="saas-page critical-results-page">
    <div className="saas-page-header">
      <div>
        <span className="saas-eyebrow">Clinical safety</span>
        <h1>Critical Results</h1>
        <p>Review alert results, document every notification attempt and confirm receipt.</p>
      </div>
      <div className="critical-count"><strong>{pending.length}</strong><span>open critical results</span></div>
    </div>

    {errorMessage && <div className="critical-error" role="alert">{errorMessage}</div>}

    <div className="critical-grid">
      <div className="critical-list">
        {query.isLoading && <div className="critical-empty">Loading critical results…</div>}
        {!query.isLoading && !pending.length && <div className="critical-empty"><strong>No open critical results</strong><span>New alert results will appear here automatically.</span></div>}
        {pending.map(item => <button key={item.id} type="button" className={`critical-card ${selected?.id === item.id ? 'is-selected' : ''}`} onClick={() => setSelected(item)}>
          <span className={`critical-direction ${item.direction === 'LOW' ? 'is-low' : 'is-high'}`}>{item.direction === 'LOW' ? 'CRITICAL LOW' : 'CRITICAL HIGH'}</span>
          <strong>{item.patientName}</strong>
          <span>{item.testName} · {item.parameterName}</span>
          <b>{item.value}{item.unit ? ` ${item.unit}` : ''}</b>
          <small>Detected {formatDate(item.detectedAt)} · {item.status}</small>
        </button>)}
      </div>

      <div className="critical-detail">
        {!selected ? <div className="critical-empty"><strong>Select a critical result</strong><span>Use the queue on the left to review and document notification.</span></div> : <>
          <div className="critical-detail-head">
            <div><span className="saas-eyebrow">Alert event</span><h2>{selected.patientName}</h2><p>{selected.testName} · {selected.parameterName}</p></div>
            <span className={`critical-status status-${selected.status.toLowerCase()}`}>{selected.status}</span>
          </div>
          <div className="critical-value"><span>{selected.direction === 'LOW' ? 'Critical low' : 'Critical high'}</span><strong>{selected.value}{selected.unit ? ` ${selected.unit}` : ''}</strong><small>Configured threshold: {selected.criticalThreshold ?? '—'}{selected.unit ? ` ${selected.unit}` : ''}</small></div>
          <div className="critical-history"><strong>Notification history</strong>{!selected.notificationAttempts.length ? <span>No attempts recorded yet.</span> : selected.notificationAttempts.map(attempt => <div key={attempt.id}><span>{attempt.method} · {attempt.successful ? 'Successful' : 'Unsuccessful'}</span><small>{attempt.contactedName || 'No recipient'} · {formatDate(attempt.attemptedAt)}{attempt.readBackConfirmed ? ' · read-back confirmed' : ''}</small></div>)}</div>

          {selected.status !== 'ACKNOWLEDGED' && <div className="critical-form">
            <h3>Record notification attempt</h3>
            <div className="critical-form-grid">
              <label>Method<select value={method} onChange={e => setMethod(e.target.value as CriticalNotificationMethod)}>{methods.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <label>Recipient{<input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Clinician / authorized recipient" />}</label>
              <label>Contact details<input value={contactDetails} onChange={e => setContactDetails(e.target.value)} placeholder="Phone / channel reference" /></label>
              <label>Outcome<select value={success ? 'successful' : 'failed'} onChange={e => setSuccess(e.target.value === 'successful')}><option value="successful">Successful</option><option value="failed">Unsuccessful attempt</option></select></label>
            </div>
            <label>Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Document the communication, escalation or difficulty encountered" /></label>
            {(method === 'PHONE' || method === 'ELECTRONIC') && success && <label className="critical-check"><input type="checkbox" checked={readBackConfirmed} onChange={e => setReadBackConfirmed(e.target.checked)} /> Read-back / receipt confirmation completed</label>}
            <button type="button" className="saas-primary-btn" disabled={busy || (success && !recipient) || (success && (method === 'PHONE' || method === 'ELECTRONIC') && !readBackConfirmed)} onClick={() => notifyMutation.mutate()}>{notifyMutation.isPending ? 'Saving…' : success ? 'Record successful notification' : 'Record failed attempt'}</button>
          </div>}

          {canAcknowledge && <div className="critical-form"><h3>Acknowledge receipt</h3><label>Notes<textarea value={ackNote} onChange={e => setAckNote(e.target.value)} rows={2} placeholder="Optional acknowledgement note" /></label><button type="button" className="saas-primary-btn" disabled={busy} onClick={() => acknowledgeMutation.mutate()}>{acknowledgeMutation.isPending ? 'Saving…' : 'Acknowledge critical result'}</button></div>}
        </>}
      </div>
    </div>

    <style>{`.critical-results-page{max-width:1280px}.critical-count{display:flex;align-items:center;gap:9px;padding:11px 14px;border:1px solid var(--border);border-radius:12px;background:var(--panel-bg)}.critical-count strong{font-size:1.15rem;color:var(--danger)}.critical-count span{font-size:.68rem;color:var(--text)}.critical-error{margin-bottom:14px;padding:11px 13px;border:1px solid color-mix(in srgb,var(--danger) 35%,var(--border));border-radius:10px;background:color-mix(in srgb,var(--danger) 8%,var(--panel-bg));color:var(--danger);font-size:.72rem}.critical-grid{display:grid;grid-template-columns:minmax(300px,.85fr) minmax(0,1.4fr);gap:16px}.critical-list,.critical-detail{min-width:0;padding:14px;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg)}.critical-list{display:grid;align-content:start;gap:8px;max-height:calc(100vh - 180px);overflow:auto}.critical-card{display:grid;gap:4px;width:100%;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--page-bg);color:var(--text);text-align:left;cursor:pointer}.critical-card:hover,.critical-card.is-selected{border-color:var(--danger);box-shadow:0 5px 18px rgba(15,23,42,.06)}.critical-card strong{font-size:.82rem;color:var(--text-bold)}.critical-card span:not(.critical-direction),.critical-card small{font-size:.65rem;color:var(--text)}.critical-card b{font-size:1rem;color:var(--danger)}.critical-direction{width:max-content;padding:3px 6px;border-radius:5px;font-size:.54rem;font-weight:800;letter-spacing:.06em}.critical-direction.is-low,.critical-status.status-pending{color:#b42318;background:#fff0ee}.critical-direction.is-high{color:#9b1c1c;background:#fff0ee}.critical-status{padding:5px 8px;border-radius:7px;font-size:.56rem;font-weight:800;letter-spacing:.06em}.critical-status.status-notified{color:#146c43;background:#eaf8f0}.critical-status.status-acknowledged{color:#2456a6;background:#edf3ff}.critical-detail{display:grid;align-content:start;gap:16px}.critical-detail-head{display:flex;justify-content:space-between;gap:14px}.critical-detail-head h2{margin:4px 0 2px;color:var(--text-bold)}.critical-detail-head p{margin:0;color:var(--text);font-size:.72rem}.critical-value{display:grid;gap:3px;padding:15px;border:1px solid var(--border);border-radius:12px;background:var(--page-bg)}.critical-value span,.critical-value small{font-size:.64rem;color:var(--text)}.critical-value strong{font-size:1.55rem;color:var(--danger)}.critical-history{display:grid;gap:7px}.critical-history>strong,.critical-form h3{font-size:.75rem;color:var(--text-bold)}.critical-history>span{font-size:.68rem;color:var(--text)}.critical-history div{display:grid;gap:2px;padding:9px 10px;border-left:3px solid var(--border);background:var(--page-bg)}.critical-history div span{font-size:.67rem;font-weight:700}.critical-history div small{font-size:.61rem;color:var(--text)}.critical-form{display:grid;gap:10px;padding-top:14px;border-top:1px solid var(--border)}.critical-form h3{margin:0}.critical-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.critical-form label{display:grid;gap:5px;font-size:.63rem;font-weight:700;color:var(--text)}.critical-form input,.critical-form select,.critical-form textarea{width:100%;padding:9px 10px;border:1px solid var(--border);border-radius:8px;background:var(--page-bg);color:var(--text);font:inherit;font-size:.68rem}.critical-check{display:flex!important;grid-template-columns:none!important;align-items:center;gap:7px!important}.critical-check input{width:auto}.critical-empty{min-height:150px;display:grid;place-content:center;gap:5px;text-align:center;color:var(--text)}.critical-empty strong{font-size:.78rem;color:var(--text-bold)}.critical-empty span{font-size:.65rem}@media(max-width:900px){.critical-grid{grid-template-columns:1fr}.critical-list{max-height:none}.critical-form-grid{grid-template-columns:1fr}}`}</style>
  </section>;
}

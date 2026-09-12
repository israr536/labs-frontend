import { useEffect, useState } from 'react';
import criticalResultsService, { type CriticalNotificationMethod, type CriticalResult } from '../services/criticalResultsService';

type Props = { role?: string };

const methods: Array<{ value: CriticalNotificationMethod; label: string }> = [
  { value: 'PHONE', label: 'Phone' },
  { value: 'IN_PERSON', label: 'In person' },
  { value: 'ELECTRONIC', label: 'Electronic' },
  { value: 'OTHER', label: 'Other' },
];

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function CriticalResultsPage({ role }: Props) {
  const [items, setItems] = useState<CriticalResult[]>([]);
  const [selected, setSelected] = useState<CriticalResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState<CriticalNotificationMethod>('PHONE');
  const [recipient, setRecipient] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [readBackConfirmed, setReadBackConfirmed] = useState(false);
  const [successful, setSuccessful] = useState(true);
  const [notes, setNotes] = useState('');
  const [ackNote, setAckNote] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await criticalResultsService.pending());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load critical results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshSelected = async (id: string) => {
    try {
      const next = await criticalResultsService.get(id);
      setSelected(next);
    } catch {
      setSelected(null);
    }
  };

  const submitNotification = async () => {
    if (!selected) return;
    if (successful && !recipient.trim()) {
      setError('Recipient name is required for a successful notification');
      return;
    }
    if (successful && (method === 'PHONE' || method === 'ELECTRONIC') && !readBackConfirmed) {
      setError('Read-back / receipt confirmation is required');
      return;
    }
    setSaving(true);
    try {
      await criticalResultsService.notify(selected.id, {
        method,
        successful,
        recipient: recipient.trim() || undefined,
        contactDetails: contactDetails.trim() || undefined,
        readBackConfirmed,
        note: notes.trim() || undefined,
      });
      setRecipient('');
      setContactDetails('');
      setNotes('');
      setReadBackConfirmed(false);
      await load();
      await refreshSelected(selected.id);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to record notification attempt');
    } finally {
      setSaving(false);
    }
  };

  const acknowledge = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await criticalResultsService.acknowledge(selected.id, ackNote.trim() || undefined);
      setSelected(null);
      setAckNote('');
      await load();
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to acknowledge critical result');
    } finally {
      setSaving(false);
    }
  };

  if (role === 'RECEPTIONIST') return <section className="saas-page"><div className="saas-page-header"><div><span className="saas-eyebrow">Clinical safety</span><h1>Critical Results</h1><p>Access is restricted to clinical laboratory staff.</p></div></div></section>;

  return <section className="saas-page critical-results-page">
    <div className="saas-page-header">
      <div><span className="saas-eyebrow">Clinical safety</span><h1>Critical Results</h1><p>Review alert results, document notification attempts and confirm receipt.</p></div>
      <div className="critical-count"><strong>{items.length}</strong><span>open critical results</span></div>
    </div>
    {error && <div className="critical-error" role="alert">{error}</div>}
    <div className="critical-grid">
      <div className="critical-list">
        {loading && <div className="critical-empty">Loading critical results…</div>}
        {!loading && !items.length && <div className="critical-empty"><strong>No open critical results</strong><span>New alert results will appear here automatically.</span></div>}
        {items.map(item => <button key={item.id} type="button" className={`critical-card ${selected?.id === item.id ? 'is-selected' : ''}`} onClick={() => { setSelected(item); setError(''); }}>
          <span className="critical-direction">{item.direction === 'LOW' ? 'CRITICAL LOW' : 'CRITICAL HIGH'}</span>
          <strong>{item.patientName}</strong><span>{item.testName} · {item.parameterName}</span>
          <b>{item.value}{item.unit ? ` ${item.unit}` : ''}</b><small>Detected {formatDate(item.detectedAt)} · {item.status}</small>
        </button>)}
      </div>
      <div className="critical-detail">
        {!selected ? <div className="critical-empty"><strong>Select a critical result</strong><span>Choose an alert from the queue to document notification.</span></div> : <>
          <div className="critical-detail-head"><div><span className="saas-eyebrow">Alert event</span><h2>{selected.patientName}</h2><p>{selected.testName} · {selected.parameterName}</p></div><span className="critical-status">{selected.status}</span></div>
          <div className="critical-value"><span>{selected.direction === 'LOW' ? 'Critical low' : 'Critical high'}</span><strong>{selected.value}{selected.unit ? ` ${selected.unit}` : ''}</strong><small>Configured threshold: {selected.criticalThreshold ?? '—'}{selected.unit ? ` ${selected.unit}` : ''}</small></div>
          <div className="critical-history"><strong>Notification history</strong>{!selected.notificationAttempts.length ? <span>No attempts recorded yet.</span> : selected.notificationAttempts.map(attempt => <div key={attempt.id}><span>{attempt.method} · {attempt.successful ? 'Successful' : 'Unsuccessful'}</span><small>{attempt.contactedName || 'No recipient'} · {formatDate(attempt.attemptedAt)}{attempt.readBackConfirmed ? ' · read-back confirmed' : ''}</small></div>)}</div>
          {selected.status !== 'ACKNOWLEDGED' && <div className="critical-form"><h3>Record notification attempt</h3><div className="critical-form-grid">
            <label>Method<select value={method} onChange={event => setMethod(event.target.value as CriticalNotificationMethod)}>{methods.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label>Outcome<select value={successful ? 'successful' : 'failed'} onChange={event => setSuccessful(event.target.value === 'successful')}><option value="successful">Successful</option><option value="failed">Unsuccessful attempt</option></select></label>
            <label>Recipient<input value={recipient} onChange={event => setRecipient(event.target.value)} placeholder="Clinician / authorized recipient" /></label>
            <label>Contact details<input value={contactDetails} onChange={event => setContactDetails(event.target.value)} placeholder="Phone / channel reference" /></label>
          </div><label>Notes<textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} placeholder="Document communication, escalation or difficulty" /></label>
          {successful && (method === 'PHONE' || method === 'ELECTRONIC') && <label className="critical-check"><input type="checkbox" checked={readBackConfirmed} onChange={event => setReadBackConfirmed(event.target.checked)} /> Read-back / receipt confirmation completed</label>}
          <button type="button" className="saas-primary-btn" disabled={saving} onClick={() => void submitNotification()}>{saving ? 'Saving…' : successful ? 'Record successful notification' : 'Record failed attempt'}</button></div>}
          {selected.status === 'NOTIFIED' && <div className="critical-form"><h3>Acknowledge receipt</h3><label>Notes<textarea value={ackNote} onChange={event => setAckNote(event.target.value)} rows={2} placeholder="Optional acknowledgement note" /></label><button type="button" className="saas-primary-btn" disabled={saving} onClick={() => void acknowledge()}>{saving ? 'Saving…' : 'Acknowledge critical result'}</button></div>}
        </>}
      </div>
    </div>

  </section>;
}

import { useEffect, useMemo, useState } from 'react';
import { Edit3, Mail, MapPin, Phone, Plus, RefreshCw, Search, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import patientsService, { type PatientRecord } from '../services/patientsService';
import Pagination from '../components/Pagination';

type Role = 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | 'PATHOLOGIST' | string | undefined;
type FormState = { name: string; age: string; gender: string; mobile: string; email: string; address: string };
const blank: FormState = { name: '', age: '', gender: 'FEMALE', mobile: '', email: '', address: '' };
const label = (value?: string) => (value ?? '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function PatientsPage({ role }: { role?: Role }) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>(blank);
  const [editing, setEditing] = useState<PatientRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const canManage = role === 'ADMIN' || role === 'RECEPTIONIST';

  async function load() {
    setLoading(true); setError('');
    try { setPatients(await patientsService.listPatients(search.trim()) as PatientRecord[]); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load patient records.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => search.trim() ? patients.filter((p) => `${p.name} ${p.mobile ?? ''} ${p.email ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())) : patients, [patients, search]);
  const pageSize = 12;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  function startCreate() { setEditing(null); setForm(blank); setNotice(''); setError(''); setOpen(true); }
  function startEdit(patient: PatientRecord) { setEditing(patient); setForm({ name: patient.name, age: patient.age == null ? '' : String(patient.age), gender: patient.gender || 'OTHER', mobile: patient.mobile || '', email: patient.email || '', address: patient.address || '' }); setNotice(''); setError(''); setOpen(true); }
  async function save() {
    if (!form.name.trim()) { setError('Patient name is required.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const payload = { name: form.name.trim(), age: form.age ? Number(form.age) : undefined, gender: form.gender, mobile: form.mobile.trim() || undefined, email: form.email.trim() || undefined, address: form.address.trim() || undefined };
      if (editing) { await patientsService.updatePatient(editing.id, payload); setNotice('Patient record updated.'); } else { await patientsService.createPatient(payload); setNotice('Patient registered and ready for a new order.'); }
      setOpen(false); setEditing(null); setForm(blank); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save patient record.'); }
    finally { setBusy(false); }
  }
  async function remove(patient: PatientRecord) {
    if (!window.confirm(`Delete ${patient.name}'s patient record? This cannot be undone.`)) return;
    setBusy(true); setError('');
    try { await patientsService.deletePatient(patient.id); setPatients((items) => items.filter((item) => item.id !== patient.id)); setNotice('Patient record deleted.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to delete patient record.'); }
    finally { setBusy(false); }
  }

  return <section className="saas-page patients-page">
    <div className="saas-page-header"><div><span className="saas-eyebrow">Patient records</span><h1>Patient registry</h1><p>Maintain a trusted patient record across registration, orders, samples, results, and final reports.</p></div><div className="page-actions"><button className="saas-secondary-btn" onClick={() => void load()} disabled={loading || busy}><RefreshCw size={15} /> Refresh</button>{canManage && <button className="saas-primary-btn" onClick={startCreate}><Plus size={16} /> Register patient</button>}</div></div>
    <div className="saas-alert saas-alert-info"><ShieldCheck size={16} /><span><strong>Controlled access and patient privacy.</strong> Patient data is scoped to authorized workspace members. Keep contact details current for reliable report delivery and follow-up.</span></div>
    {error && <div className="saas-alert saas-alert-danger">{error}</div>}{notice && <div className="saas-alert saas-alert-success">{notice}</div>}
    <div className="patient-toolbar"><div className="patient-search"><Search size={16} /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onKeyDown={(e) => { if (e.key === 'Enter') void load(); }} placeholder="Search by patient name, phone or email" aria-label="Search patients" /></div><span className="patient-count">{filtered.length} record{filtered.length === 1 ? '' : 's'}</span></div>
    <div className="saas-card patient-table-card"><div className="saas-table-wrap"><table className="saas-table"><thead><tr><th scope="col">Patient</th><th scope="col">Contact</th><th scope="col">Demographics</th><th scope="col">Address</th><th scope="col">Registered</th><th scope="col" aria-label="Actions" /></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="table-empty">Loading patient records…</td></tr> : paginated.map((patient) => <tr key={patient.id}><td><div className="patient-name"><span className="patient-avatar"><UserRound size={15} /></span><span><strong>{patient.name}</strong><small>{patient.id.slice(0, 8).toUpperCase()}</small></span></div></td><td><div className="contact-stack">{patient.mobile && <span><Phone size={13} />{patient.mobile}</span>}{patient.email && <span><Mail size={13} />{patient.email}</span>}{!patient.mobile && !patient.email && <span className="muted">No contact details</span>}</div></td><td>{patient.age != null ? `${patient.age} years` : 'Age not set'}<small className="table-subtext">{label(patient.gender)}</small></td><td><span className="address-cell"><MapPin size={13} />{patient.address || 'Not provided'}</span></td><td>{patient.createdAt ? new Date(String(patient.createdAt)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td><td><div className="table-actions">{canManage && <><button className="icon-action" onClick={() => startEdit(patient)} title={`Edit ${patient.name}`} aria-label={`Edit ${patient.name}`}><Edit3 size={15} /></button><button className="icon-action danger" onClick={() => void remove(patient)} disabled={busy} title={`Delete ${patient.name}`} aria-label={`Delete ${patient.name}`}><Trash2 size={15} /></button></>}</div></td></tr>)}{!loading && !filtered.length && <tr><td colSpan={6} className="table-empty"><UserRound size={28} /><strong>No patient records found</strong><span>Register your first patient or change the search term.</span>{canManage && <button className="saas-primary-btn" onClick={startCreate}><Plus size={15} /> Register patient</button>}</td></tr>}</tbody></table></div><Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} label="patients" /></div>
    {open && <div className="modal-backdrop"><div className="patient-modal" role="dialog" aria-modal="true"><div className="modal-heading"><div><span className="saas-eyebrow">{editing ? 'Update record' : 'New record'}</span><h2>{editing ? 'Edit patient' : 'Register patient'}</h2><p>Use the legal name and contact details that should appear in the laboratory workflow.</p></div><button className="icon-action" onClick={() => setOpen(false)} title="Close"><X size={18} /></button></div><div className="patient-form"><label>Patient name<input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aisha Khan" /></label><label>Age<input type="number" min="0" max="130" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Years" /></label><label>Gender<select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option></select></label><label>Mobile number<input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 98…" /></label><label className="wide">Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="patient@example.com" /></label><label className="wide">Address<textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional mailing address" /></label></div><div className="modal-actions"><button className="saas-secondary-btn" onClick={() => setOpen(false)}>Cancel</button><button className="saas-primary-btn" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Register patient'}</button></div></div></div>}

  </section>;
}

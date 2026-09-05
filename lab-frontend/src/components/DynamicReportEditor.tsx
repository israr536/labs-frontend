import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, X, Activity } from 'lucide-react';
import type { LabReport, TestParameter } from '../data/samples';
import reportsService from '../services/reportsService';
import testCatalogService, { type CatalogParameter, type LabTest } from '../services/testCatalogService';
import { useToast } from './Toast';

type Props = { editingReport: LabReport | null; onSaveReport: (report: LabReport) => void; onCancel: () => void };
type EditableParameter = TestParameter & { inputType?: CatalogParameter['inputType']; options?: string[]; required?: boolean; validation?: unknown; decimalPlaces?: number | null; defaultValue?: string | null; criticalLow?: number | null; criticalHigh?: number | null; formula?: string | null };

export default function DynamicReportEditor({ editingReport, onSaveReport, onCancel }: Props) {
  const toast = useToast();
  const { data: tests = [], isLoading } = useQuery({ queryKey: ['tests'], queryFn: () => testCatalogService.myTests(), staleTime: 60_000 });
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'Male'|'Female'|'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referredBy, setReferredBy] = useState('Dr. Self / Walk-in');
  const [dateCollected, setDateCollected] = useState('');
  const [testId, setTestId] = useState('');
  const [status, setStatus] = useState<LabReport['status']>('Draft');
  const [parameters, setParameters] = useState<EditableParameter[]>([]);
  const [interpretation, setInterpretation] = useState('');

  const selectedTest = tests.find((test) => test.id === testId);
  const createParameters = (test: LabTest, existing: TestParameter[] = []): EditableParameter[] => test.parameters.map((p) => {
    const saved = existing.find((item) => item.name.toLowerCase() === p.name.toLowerCase());
    return {
      name: p.name,
      value: saved?.value ?? p.defaultValue ?? '',
      unit: p.unit || '',
      refRange: formatRange(p),
      minRef: p.normalMin ?? undefined,
      maxRef: p.normalMax ?? undefined,
      inputType: p.inputType,
      options: Array.isArray(p.options) ? p.options.filter((value): value is string => typeof value === 'string') : undefined,
      status: saved?.status ?? 'Normal',
      required: p.isRequired,
      validation: p.validation,
      decimalPlaces: p.decimalPlaces,
      defaultValue: p.defaultValue,
      criticalLow: p.criticalLow,
      criticalHigh: p.criticalHigh,
      formula: p.formula,
    };
  });

  useEffect(() => {
    const reportTestId = (editingReport as LabReport & { testId?: string } | null)?.testId;
    if (editingReport) {
      setPatientName(editingReport.patientName); setAge(editingReport.age); setGender(editingReport.gender); setPhone(editingReport.phone); setEmail(editingReport.email || ''); setReferredBy(editingReport.referredBy); setDateCollected(editingReport.dateCollected); setStatus(editingReport.status); setInterpretation(editingReport.interpretation); setTestId(reportTestId || '');
      const catalogTest = reportTestId ? tests.find((test) => test.id === reportTestId) : undefined;
      setParameters(catalogTest ? createParameters(catalogTest, editingReport.parameters) : editingReport.parameters as EditableParameter[]);
    } else if (!testId && tests[0]) {
      setTestId(tests[0].id); setParameters(createParameters(tests[0]));
    }
  }, [editingReport, tests]);

  const selectTest = (id: string) => { setTestId(id); const test = tests.find((item) => item.id === id); if (test) setParameters(createParameters(test)); };
  const changeValue = (index: number, value: string) => setParameters((current) => current.map((p, i) => i === index ? { ...p, value, status: flagForValue(value, p) } : p));
  const changeFlag = (index: number, statusValue: TestParameter['status']) => setParameters((current) => current.map((p, i) => i === index ? { ...p, status: statusValue } : p));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientName.trim() || !phone.trim() || !testId) { toast.show({ type: 'error', message: 'Patient name, phone and test are required.' }); return; }
    const missing = parameters.filter((parameter) => parameter.required && !parameter.value.trim());
    if (missing.length && status !== 'Draft') { toast.show({ type: 'error', message: `Required result fields missing: ${missing.map((item) => item.name).join(', ')}` }); return; }
    const invalid = parameters.find((parameter) => !passesValidation(parameter.value, parameter.validation));
    if (invalid) { toast.show({ type: 'error', message: `Invalid value for ${invalid.name}. Please check the field validation.` }); return; }
    const payload: LabReport & { testId: string } = { id: editingReport?.id || `draft-${Date.now()}`, patientName, age, gender, phone, email, referredBy, dateCollected, dateReported: new Date().toISOString(), testType: selectedTest?.name || '', status, parameters, interpretation, testId };
    try { const saved = editingReport ? await reportsService.updateReport(payload.id, payload) : await reportsService.createReport(payload); onSaveReport(saved); }
    catch (error) { toast.show({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save report.' }); }
  };

  return <div className="editor-container animate-fade-in"><div className="editor-header"><div><span className="saas-eyebrow">Result entry</span><h1>{editingReport ? 'Edit diagnostic report' : 'Create diagnostic report'}</h1><p className="subtitle">All result fields, units and reference metadata come from your laboratory test configuration.</p></div><button onClick={onCancel} className="btn btn-outline"><X size={18}/>Cancel</button></div>
    <form onSubmit={submit} className="editor-form"><div className="form-grid-layout"><div className="glass-panel editor-demographics-card"><div className="card-header border-b"><h3>Patient & test</h3></div>
      <div className="form-group"><label className="form-label">Patient Full Name</label><input className="form-input" value={patientName} onChange={(e)=>setPatientName(e.target.value)} required/></div>
      <div className="grid-2-col"><div className="form-group"><label className="form-label">Age</label><input className="form-input" type="number" min="0" max="130" value={age} onChange={(e)=>setAge(Number(e.target.value))}/></div><div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={gender} onChange={(e)=>setGender(e.target.value as typeof gender)}><option>Male</option><option>Female</option><option>Other</option></select></div></div>
      <div className="grid-2-col"><div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={(e)=>setPhone(e.target.value)} required/></div><div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}/></div></div>
      <div className="form-group"><label className="form-label">Referred By</label><input className="form-input" value={referredBy} onChange={(e)=>setReferredBy(e.target.value)}/></div>
      <div className="form-group"><label className="form-label">Sample Collected</label><input className="form-input" type="datetime-local" value={dateCollected} onChange={(e)=>setDateCollected(e.target.value)}/></div>
      <div className="form-group"><label className="form-label">Laboratory Test</label><select className="form-select" value={testId} onChange={(e)=>selectTest(e.target.value)} disabled={!!editingReport || isLoading} required><option value="">Select a configured test</option>{tests.map((test)=> <option key={test.id} value={test.id}>{test.name} ({test.code})</option>)}</select></div>
      <div className="form-group"><label className="form-label">Workflow Status</label><select className="form-select" value={status} onChange={(e)=>setStatus(e.target.value as LabReport['status'])}><option value="Draft">Draft</option><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Critical">Critical</option></select></div>
    </div><div className="glass-panel editor-parameters-card"><div className="card-header border-b"><Activity size={18}/><h3>{selectedTest?.name || 'Test parameters'}</h3></div>
      {!selectedTest && <div className="empty-state">Select a test configured by your laboratory.</div>}
      <div className="param-form-list">{parameters.map((param,index)=><ParameterInput key={`${param.name}-${index}`} parameter={param} onChange={(value)=>changeValue(index,value)} onFlagChange={(value)=>changeFlag(index,value)} />)}</div>
      <div className="preview-divider"/><div className="form-group"><label className="form-label">Clinical Notes</label><textarea className="form-input form-textarea" rows={4} value={interpretation} onChange={(e)=>setInterpretation(e.target.value)} placeholder="Clinical notes or interpretation"/></div><div className="editor-actions-row"><button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary"><Save size={18}/>Save Diagnostic Report</button></div>
    </div></div></form></div>;
}

function ParameterInput({ parameter, onChange, onFlagChange }: { parameter: EditableParameter; onChange: (value: string) => void; onFlagChange: (value: TestParameter['status']) => void }) {
  const type = parameter.inputType || 'TEXT';
  const common = { className: 'form-input param-val-input', value: parameter.value, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value), required: parameter.required };
  let control: React.ReactNode;
  if (type === 'SELECT' || type === 'QUALITATIVE') control = <select {...common} className="form-select param-val-input"><option value="">Select value</option>{(parameter.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  else if (type === 'BOOLEAN') control = <select {...common} className="form-select param-val-input"><option value="">Select</option><option value="true">Yes</option><option value="false">No</option></select>;
  else if (type === 'MULTILINE_TEXT') control = <textarea {...common} className="form-input form-textarea param-val-input" rows={3} placeholder="Enter result" />;
  else control = <input {...common} type={type === 'NUMBER' || type === 'PERCENTAGE' ? 'number' : type === 'DATE' ? 'date' : type === 'DATETIME' ? 'datetime-local' : type === 'TIME' ? 'time' : 'text'} step={type === 'NUMBER' || type === 'PERCENTAGE' ? decimalStep(parameter.decimalPlaces) : undefined} min={type === 'NUMBER' || type === 'PERCENTAGE' ? parameter.minRef : undefined} max={type === 'NUMBER' || type === 'PERCENTAGE' ? parameter.maxRef : undefined} placeholder={parameter.defaultValue || 'Observed value'} />;
  return <div className="param-input-item"><div className="param-name-ref-row"><span className="param-form-name">{parameter.name}{parameter.required ? ' *' : ''}</span><span className="param-form-ref">{parameter.refRange} · {parameter.unit || 'no unit'}</span></div><div className="param-value-flag-row">{control}<select className="form-select param-flag-select" value={parameter.status} onChange={(e)=>onFlagChange(e.target.value as TestParameter['status'])} aria-label={`Result flag for ${parameter.name}`}><option>Normal</option><option>High</option><option>Low</option><option>Abnormal</option></select></div>{parameter.criticalLow != null || parameter.criticalHigh != null ? <small className="param-critical-note">Critical: {parameter.criticalLow ?? '—'} to {parameter.criticalHigh ?? '—'}</small> : null}</div>;
}

function formatRange(parameter: CatalogParameter) { if (parameter.referenceRange && typeof parameter.referenceRange === 'object') return Object.entries(parameter.referenceRange as Record<string, unknown>).map(([key,value]) => `${key}: ${String(value)}`).join(' · '); const min=parameter.normalMin; const max=parameter.normalMax; if(min!=null&&max!=null)return `${min} - ${max}`; if(min!=null)return `>= ${min}`; if(max!=null)return `<= ${max}`; return 'Clinical / qualitative reference'; }
function flagForValue(value:string, parameter:TestParameter):TestParameter['status'] { const n=Number(value); if(value.trim()!==''&&Number.isFinite(n)){if(parameter.minRef!=null&&n<parameter.minRef)return 'Low';if(parameter.maxRef!=null&&n>parameter.maxRef)return 'High';} return 'Normal'; }
function decimalStep(decimalPlaces?: number | null) { if (decimalPlaces == null) return 'any'; return decimalPlaces === 0 ? '1' : String(1 / 10 ** decimalPlaces); }
function passesValidation(value: string, validation: unknown) { if (!value.trim() || !validation || typeof validation !== 'object') return true; const rule = validation as Record<string, unknown>; const minLength = typeof rule.minLength === 'number' ? rule.minLength : undefined; const maxLength = typeof rule.maxLength === 'number' ? rule.maxLength : undefined; const pattern = typeof rule.pattern === 'string' ? rule.pattern : undefined; if (minLength != null && value.length < minLength) return false; if (maxLength != null && value.length > maxLength) return false; if (pattern) { try { if (!new RegExp(pattern).test(value)) return false; } catch { return false; } } return true; }

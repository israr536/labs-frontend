import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Save, X, Activity, Search } from 'lucide-react';
import type { LabReport, TestParameter } from '../data/samples';
import reportsService from '../services/reportsService';
import testCatalogService, { type CatalogParameter, type LabTest } from '../services/testCatalogService';
import TestCatalogPicker from './TestCatalogPicker';
import { useToast } from './Toast';

type Props = { editingReport: LabReport | null; onSaveReport: (report: LabReport) => void; onCancel: () => void };
type EditableParameter = Omit<TestParameter, 'inputType' | 'options'> & {
  inputType?: CatalogParameter['inputType'];
  options?: string[];
  required?: boolean;
  validation?: unknown;
  decimalPlaces?: number | null;
  defaultValue?: string | null;
  criticalLow?: number | null;
  criticalHigh?: number | null;
  formula?: string | null;
};
type CombinedReportPayload = Partial<LabReport> & { testIds: string[]; parametersByTest: Record<string, TestParameter[]> };

export default function DynamicReportEditor({ editingReport, onSaveReport, onCancel }: Props) {
  const toast = useToast();
  const { data: tests = [], isLoading } = useQuery({ queryKey: ['tests', 'new-report'], queryFn: () => testCatalogService.myTests(), staleTime: 60_000 });
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referredBy, setReferredBy] = useState('Dr. Self / Walk-in');
  const [dateCollected, setDateCollected] = useState('');
  const [testIds, setTestIds] = useState<string[]>([]);
  const [status, setStatus] = useState<LabReport['status']>('Draft');
  const [parametersByTest, setParametersByTest] = useState<Record<string, EditableParameter[]>>({});
  const [interpretation, setInterpretation] = useState('');

  const createParameters = (test: LabTest, existing: TestParameter[] = []): EditableParameter[] => test.parameters.map((p) => {
    const saved = existing.find((item) => item.name.toLowerCase() === p.name.toLowerCase());
    return { name: p.name, value: saved?.value ?? p.defaultValue ?? '', unit: p.unit || '', refRange: formatRange(p), minRef: p.normalMin ?? undefined, maxRef: p.normalMax ?? undefined, inputType: p.inputType, options: Array.isArray(p.options) ? p.options.filter((value): value is string => typeof value === 'string') : undefined, status: saved?.status ?? 'Normal', required: p.isRequired, validation: p.validation, decimalPlaces: p.decimalPlaces, defaultValue: p.defaultValue, criticalLow: p.criticalLow, criticalHigh: p.criticalHigh, formula: p.formula };
  });

  useEffect(() => {
    if (editingReport) {
      const reportAny = editingReport as any;
      const reportTestIds: string[] = Array.isArray(reportAny.testIds)
        ? reportAny.testIds
        : reportAny.testId
          ? [reportAny.testId]
          : [];
      setPatientName(editingReport.patientName);
      setAge(editingReport.age);
      setGender(editingReport.gender);
      setPhone(editingReport.phone);
      setEmail(editingReport.email || '');
      setReferredBy(editingReport.referredBy);
      setDateCollected(editingReport.dateCollected);
      setStatus(editingReport.status);
      setInterpretation(editingReport.interpretation);
      setTestIds(reportTestIds);
      const nextParams: Record<string, EditableParameter[]> = {};
      for (const id of reportTestIds) {
        const catalogTest = tests.find((t) => t.id === id);
        nextParams[id] = catalogTest ? createParameters(catalogTest, editingReport.parameters) : [];
      }
      setParametersByTest(nextParams);
    } else if (!testIds.length && tests[0]) {
      setTestIds([tests[0].id]);
      setParametersByTest({ [tests[0].id]: createParameters(tests[0]) });
    }
  }, [editingReport, tests]);

  const selectTests = (ids: string[]) => {
    const uniqueIds = [...new Set(ids)]; setTestIds(uniqueIds);
    setParametersByTest((current) => { const next = { ...current }; uniqueIds.forEach((id) => { if (!next[id]) { const test = tests.find((item) => item.id === id); if (test) next[id] = createParameters(test); } }); Object.keys(next).forEach((id) => { if (!uniqueIds.includes(id)) delete next[id]; }); return next; });
  };

  const changeValue = (testId: string, index: number, value: string) => setParametersByTest((current) => ({ ...current, [testId]: (current[testId] || []).map((p, i) => i === index ? { ...p, value, status: flagForValue(value, p) } : p) }));
  const changeFlag = (testId: string, index: number, statusValue: TestParameter['status']) => setParametersByTest((current) => ({ ...current, [testId]: (current[testId] || []).map((p, i) => i === index ? { ...p, status: statusValue } : p) }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!patientName.trim() || !phone.trim() || !testIds.length) { toast.show({ type: 'error', message: 'Patient name, phone and at least one test are required.' }); return; }
    for (const id of testIds) {
      const parameters = parametersByTest[id] || [];
      const missing = parameters.filter((parameter) => parameter.required && !String(parameter.value ?? '').trim());
      if (missing.length && status !== 'Draft') { toast.show({ type: 'error', message: `Required result fields missing for ${tests.find((t) => t.id === id)?.name || 'selected test'}: ${missing.map((item) => item.name).join(', ')}` }); return; }
      const invalid = parameters.find((parameter) => !passesValidation(String(parameter.value ?? ''), parameter.validation));
      if (invalid) { toast.show({ type: 'error', message: `Invalid value for ${invalid.name}. Please check the field validation.` }); return; }
    }

    try {
      if (editingReport) {
        const id = testIds[0]; const test = tests.find((item) => item.id === id);
        const payload = { id: editingReport.id, patientName, age, gender, phone, email, referredBy, dateCollected, dateReported: new Date().toISOString(), status, parameters: (parametersByTest[id] || []) as TestParameter[], interpretation, testType: test?.name || '', testId: id };
        const saved = await reportsService.updateReport(payload.id, payload); onSaveReport(saved); return;
      }

      const payload: CombinedReportPayload = {
        patientName, age, gender, phone, email, referredBy, dateCollected, dateReported: new Date().toISOString(), status, interpretation,
        testIds,
        parametersByTest: Object.fromEntries(testIds.map((id) => [id, (parametersByTest[id] || []) as TestParameter[]]))
      };
      const saved = await reportsService.createCombinedReport(payload);
      onSaveReport(saved);
    } catch (error) { toast.show({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save report.' }); }
  };

  return <div className="editor-container animate-fade-in report-editor-page">
    <div className="editor-header"><div><span className="saas-eyebrow">Result entry</span><h1>{editingReport ? 'Edit diagnostic report' : 'Create diagnostic report'}</h1><p className="subtitle">Search the complete laboratory catalog and enter configured patient results.</p></div><button type="button" onClick={onCancel} className="btn btn-outline"><X size={18} />Cancel</button></div>
    <form onSubmit={submit} className="editor-form"><div className="form-grid-layout">
      <div className="glass-panel editor-demographics-card"><div className="card-header border-b"><h3>Patient & test</h3></div>
        <div className="form-group"><label className="form-label">Patient Full Name</label><input className="form-input" value={patientName} onChange={(e) => setPatientName(e.target.value)} required /></div>
        <div className="grid-2-col"><div className="form-group"><label className="form-label">Age</label><input className="form-input" type="number" min="0" max="130" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div><div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}><option>Male</option><option>Female</option><option>Other</option></select></div></div>
        <div className="grid-2-col"><div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div><div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="form-group"><label className="form-label">Referred By</label><input className="form-input" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Sample Collected</label><input className="form-input" type="datetime-local" value={dateCollected} onChange={(e) => setDateCollected(e.target.value)} /></div>
        <div className="form-group test-selection-field"><div className="test-selection-heading"><div><label className="form-label">Laboratory Test</label><span>Select one or multiple tests for this patient.</span></div><Search size={17} /></div><TestCatalogPicker selectedIds={testIds} onChange={selectTests} disabled={Boolean(editingReport) || isLoading} />{testIds.length > 0 && <small className="selected-test-count">{testIds.length} test{testIds.length === 1 ? '' : 's'} selected</small>}</div>
        <div className="form-group"><label className="form-label">Workflow Status</label><select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as LabReport['status'])}><option value="Draft">Draft</option><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Critical">Critical</option></select></div>
      </div>
      <div className="glass-panel editor-parameters-card"><div className="card-header border-b"><Activity size={18} /><h3>Test parameters</h3></div>{!testIds.length && <div className="empty-state">Select an enabled test from the catalog.</div>}
        <div className="selected-test-parameters">{testIds.map((id) => { const test = tests.find((item) => item.id === id); const parameters = parametersByTest[id] || []; if (!test) return null; return <section className="test-parameter-section" key={id}><div className="test-parameter-title"><strong>{test.name}</strong><span>{parameters.length} parameter{parameters.length === 1 ? '' : 's'}</span></div><div className="param-form-list">{parameters.map((param, index) => <ParameterInput key={`${id}-${param.name}-${index}`} parameter={param} onChange={(value) => changeValue(id, index, value)} onFlagChange={(value) => changeFlag(id, index, value)} />)}</div></section>; })}</div>
        <div className="preview-divider" /><div className="form-group"><label className="form-label">Clinical Notes</label><textarea className="form-input form-textarea" rows={4} value={interpretation} onChange={(e) => setInterpretation(e.target.value)} placeholder="Clinical notes or interpretation" /></div>
        <div className="editor-actions-row"><button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary"><Save size={18} />Save Diagnostic Report</button></div>
      </div>
    </div></form>
    <style>{`.report-editor-page{width:100%;max-width:1440px;margin:0 auto;padding:clamp(1rem,2vw,2rem);min-width:0}.report-editor-page *{min-width:0}.report-editor-page .editor-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1.25rem}.report-editor-page .editor-header>div{min-width:0}.report-editor-page .editor-header h1{font-size:clamp(1.45rem,2.5vw,2rem);margin:.25rem 0 .35rem}.report-editor-page .subtitle{color:var(--text);max-width:760px}.report-editor-page .editor-form,.report-editor-page .form-grid-layout{width:100%;min-width:0}.report-editor-page .form-grid-layout{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(0,1.2fr);gap:1rem;align-items:start}.report-editor-page .glass-panel{min-width:0;max-width:100%;overflow:hidden}.report-editor-page .editor-parameters-card{min-width:0}.report-editor-page .test-parameter-section{padding-bottom:1rem;margin-bottom:1rem;border-bottom:1px solid var(--border)}.report-editor-page .test-parameter-section:last-child{border-bottom:0;margin-bottom:0}.report-editor-page .test-parameter-title{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.75rem}.report-editor-page .test-parameter-title span,.report-editor-page .selected-test-count{font-size:.75rem;color:var(--text)}.report-editor-page .test-selection-field{min-width:0}.report-editor-page .test-selection-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem;color:var(--primary);margin-bottom:.35rem}.report-editor-page .test-selection-heading>div{display:grid;gap:.15rem}.report-editor-page .test-selection-heading span{font-size:.68rem;color:var(--text)}.report-editor-page .test-catalog-picker{min-width:0}.report-editor-page .test-catalog-picker .picker-list{grid-template-columns:1fr;max-height:300px}.report-editor-page .test-catalog-picker .picker-toolbar{grid-template-columns:minmax(0,1fr)}.report-editor-page .test-catalog-picker .picker-summary{align-items:flex-start}.report-editor-page .test-catalog-picker .picker-test{grid-template-columns:20px 30px minmax(0,1fr) auto}.report-editor-page .param-name-ref-row{min-width:0}.report-editor-page .param-form-ref{min-width:0;overflow-wrap:anywhere}.report-editor-page .param-value-flag-row{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:.6rem;align-items:start}.report-editor-page .param-val-input{width:100%;min-width:0}.report-editor-page .param-flag-select{width:100%;min-width:0}.report-editor-page .editor-actions-row{display:flex;justify-content:flex-end;gap:.6rem;flex-wrap:wrap}.report-editor-page .editor-actions-row .btn{max-width:100%}@media(max-width:1050px){.report-editor-page .form-grid-layout{grid-template-columns:1fr}}@media(max-width:720px){.report-editor-page{padding:1rem}.report-editor-page .editor-header{flex-direction:column}.report-editor-page .editor-header .btn{width:100%}.report-editor-page .test-catalog-picker .picker-list{grid-template-columns:1fr}.report-editor-page .param-value-flag-row{grid-template-columns:1fr}.report-editor-page .editor-actions-row>*{width:100%}}`}</style>
  </div>;
}

function ParameterInput({ parameter, onChange, onFlagChange }: { parameter: EditableParameter; onChange: (value: string) => void; onFlagChange: (value: TestParameter['status']) => void }) {
  const type = parameter.inputType || 'TEXT';
  const common = { className: 'form-input param-val-input', value: String(parameter.value ?? ''), onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value), required: parameter.required };
  let control: ReactNode;
  if (type === 'SELECT' || type === 'QUALITATIVE') control = <select {...common} className="form-select param-val-input"><option value="">Select value</option>{(parameter.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  else if (type === 'BOOLEAN') control = <select {...common} className="form-select param-val-input"><option value="">Select</option><option value="true">Yes</option><option value="false">No</option></select>;
  else if (type === 'MULTILINE_TEXT') control = <textarea {...common} className="form-input form-textarea param-val-input" rows={3} placeholder="Enter result" />;
  else control = <input {...common} type={type === 'NUMBER' || type === 'PERCENTAGE' ? 'number' : type === 'DATE' ? 'date' : type === 'DATETIME' ? 'datetime-local' : type === 'TIME' ? 'time' : 'text'} step={type === 'NUMBER' || type === 'PERCENTAGE' ? decimalStep(parameter.decimalPlaces) : undefined} min={type === 'NUMBER' || type === 'PERCENTAGE' ? parameter.minRef : undefined} max={type === 'NUMBER' || type === 'PERCENTAGE' ? parameter.maxRef : undefined} placeholder={parameter.defaultValue || 'Observed value'} />;
  return <div className="param-input-item"><div className="param-name-ref-row"><span className="param-form-name">{parameter.name}{parameter.required ? ' *' : ''}</span><span className="param-form-ref">{parameter.refRange} · {parameter.unit || 'no unit'}</span></div><div className="param-value-flag-row">{control}<select className="form-select param-flag-select" value={parameter.status} onChange={(e) => onFlagChange(e.target.value as TestParameter['status'])} aria-label={`Result flag for ${parameter.name}`}><option>Normal</option><option>High</option><option>Low</option><option>Abnormal</option></select></div>{parameter.criticalLow != null || parameter.criticalHigh != null ? <small className="param-critical-note">Critical: {parameter.criticalLow ?? '—'} to {parameter.criticalHigh ?? '—'}</small> : null}</div>;
}

function formatRange(parameter: CatalogParameter) {
  if (parameter.referenceRange && typeof parameter.referenceRange === 'object' && !Array.isArray(parameter.referenceRange)) return Object.entries(parameter.referenceRange as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`).join(' · ');
  const min = parameter.normalMin; const max = parameter.normalMax;
  if (min != null && max != null) return `${min} - ${max}`; if (min != null) return `>= ${min}`; if (max != null) return `<= ${max}`; return 'Clinical / qualitative reference';
}
function flagForValue(value: string, parameter: Pick<EditableParameter, 'minRef' | 'maxRef'>): TestParameter['status'] { const n = Number(value); if (value.trim() !== '' && Number.isFinite(n)) { if (parameter.minRef != null && n < parameter.minRef) return 'Low'; if (parameter.maxRef != null && n > parameter.maxRef) return 'High'; } return 'Normal'; }
function decimalStep(decimalPlaces?: number | null) { if (decimalPlaces == null || decimalPlaces <= 0) return undefined; return Number(`0.${'0'.repeat(decimalPlaces - 1)}1`); }
function passesValidation(value: string, validation: unknown) { if (!value.trim() || !validation || typeof validation !== 'object') return true; const rules = validation as Record<string, unknown>; if (typeof rules.min === 'number' && Number(value) < rules.min) return false; if (typeof rules.max === 'number' && Number(value) > rules.max) return false; if (typeof rules.pattern === 'string') { try { return new RegExp(rules.pattern).test(value); } catch { return true; } } return true; }

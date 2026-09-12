import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Save, X, Activity, Search, UserRound, ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';
import type { LabReport, TestParameter } from '../data/samples';
import reportsService from '../services/reportsService';
import { getCombinedReportEditData, updateCombinedReport } from '../services/combinedReportUpdateService';
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
    let cancelled = false;
    const load = async () => {
      if (editingReport) {
        const reportAny = editingReport as LabReport & { testIds?: string[]; testId?: string; orderId?: string; patientId?: string };
        const fallbackTestIds = Array.isArray(reportAny.testIds) ? reportAny.testIds : reportAny.testId ? [reportAny.testId] : [];
        setPatientName(editingReport.patientName);
        setAge(editingReport.age);
        setGender(editingReport.gender);
        setPhone(editingReport.phone);
        setEmail(editingReport.email || '');
        setReferredBy(editingReport.referredBy);
        setDateCollected(editingReport.dateCollected);
        setStatus(editingReport.status);
        setInterpretation(editingReport.interpretation);
        setTestIds(fallbackTestIds);

        try {
          const detail = await getCombinedReportEditData(reportAny.orderId || editingReport.id);
          if (cancelled) return;
          const ids = detail.testIds.length ? detail.testIds : fallbackTestIds;
          setTestIds(ids);
          const nextParams: Record<string, EditableParameter[]> = {};
          for (const id of ids) {
            const catalogTest = tests.find((t) => t.id === id);
            const existing = detail.parametersByTest[id] || [];
            nextParams[id] = catalogTest ? createParameters(catalogTest, existing) : existing as EditableParameter[];
          }
          setParametersByTest(nextParams);
        } catch {
          if (cancelled) return;
          const nextParams: Record<string, EditableParameter[]> = {};
          for (const id of fallbackTestIds) {
            const catalogTest = tests.find((t) => t.id === id);
            nextParams[id] = catalogTest ? createParameters(catalogTest, editingReport.parameters) : [];
          }
          setParametersByTest(nextParams);
        }
      } else if (!testIds.length && tests[0]) {
        setTestIds([tests[0].id]);
        setParametersByTest({ [tests[0].id]: createParameters(tests[0]) });
      }
    };
    void load();
    return () => { cancelled = true; };
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
        const reportAny = editingReport as LabReport & { testIds?: string[]; testId?: string; orderId?: string; patientId?: string };
        const saved = await updateCombinedReport({
          id: editingReport.id,
          orderId: reportAny.orderId || editingReport.id,
          patientId: reportAny.patientId,
          patientName,
          age,
          gender,
          phone,
          email,
          referredBy,
          dateCollected,
          dateReported: new Date().toISOString(),
          status,
          interpretation,
          testIds,
          parametersByTest: Object.fromEntries(testIds.map((id) => [id, (parametersByTest[id] || []) as TestParameter[]])),
        });
        onSaveReport(saved);
        return;
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
    <div className="editor-header report-editor-hero"><div><span className="saas-eyebrow">Report workspace</span><h1>{editingReport ? 'Edit diagnostic report' : 'New diagnostic report'}</h1><p className="subtitle">Register the patient, choose the required tests, and enter verified results in one focused workflow.</p></div><div className="report-editor-hero-actions"><span className="report-draft-pill"><span />{status} report</span><button type="button" onClick={onCancel} className="btn btn-outline"><X size={17} />Exit</button></div></div>
    <div className="report-workflow-steps" aria-label="Report creation progress"><div className="report-step is-complete"><span><UserRound size={15} /></span><div><strong>Patient & tests</strong><small>Required details</small></div></div><ArrowRight className="report-step-arrow" size={16} /><div className={`report-step ${testIds.length ? 'is-complete' : 'is-current'}`}><span>{testIds.length ? <CheckCircle2 size={15} /> : <ClipboardList size={15} />}</span><div><strong>Enter results</strong><small>{testIds.length ? `${testIds.length} test${testIds.length === 1 ? '' : 's'} selected` : 'Select tests to continue'}</small></div></div><ArrowRight className="report-step-arrow" size={16} /><div className="report-step"><span><Save size={15} /></span><div><strong>Save report</strong><small>Review before saving</small></div></div></div>
    <form onSubmit={submit} className="editor-form"><div className="form-grid-layout">
      <div className="glass-panel editor-demographics-card"><div className="card-header border-b report-card-heading"><div><span className="report-card-kicker">Step 1</span><h3>Patient & test selection</h3></div><UserRound size={18} /></div>
        <div className="form-group"><label className="form-label" htmlFor="report-patient-name">Patient Full Name</label><input id="report-patient-name" className="form-input" value={patientName} onChange={(e) => setPatientName(e.target.value)} required /></div>
        <div className="grid-2-col"><div className="form-group"><label className="form-label" htmlFor="report-age">Age</label><input id="report-age" className="form-input" type="number" min="0" max="130" value={age} onChange={(e) => setAge(Number(e.target.value))} /></div><div className="form-group"><label className="form-label" htmlFor="report-gender">Gender</label><select id="report-gender" className="form-select" value={gender} onChange={(e) => setGender(e.target.value as typeof gender)}><option>Male</option><option>Female</option><option>Other</option></select></div></div>
        <div className="grid-2-col"><div className="form-group"><label className="form-label" htmlFor="report-phone">Phone</label><input id="report-phone" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div><div className="form-group"><label className="form-label" htmlFor="report-email">Email</label><input id="report-email" className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
        <div className="form-group"><label className="form-label" htmlFor="report-referred-by">Referred By</label><input id="report-referred-by" className="form-input" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} /></div>
        <div className="form-group"><label className="form-label" htmlFor="report-date-collected">Sample Collected</label><input id="report-date-collected" className="form-input" type="datetime-local" value={dateCollected} onChange={(e) => setDateCollected(e.target.value)} /></div>
        <div className="form-group test-selection-field"><div className="test-selection-heading"><div><label className="form-label">Laboratory Test</label><span>Select one or multiple tests for this patient.</span></div><Search size={17} /></div><TestCatalogPicker selectedIds={testIds} onChange={selectTests} disabled={Boolean(editingReport) || isLoading} />{testIds.length > 0 && <small className="selected-test-count">{testIds.length} test{testIds.length === 1 ? '' : 's'} selected</small>}</div>
        <div className="form-group"><label className="form-label" htmlFor="report-status">Workflow Status</label><select id="report-status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value as LabReport['status'])}><option value="Draft">Draft</option><option value="Pending">Pending</option><option value="Completed">Completed</option><option value="Critical">Critical</option></select></div>
      </div>
      <div className="glass-panel editor-parameters-card"><div className="card-header border-b report-card-heading"><div><span className="report-card-kicker">Step 2</span><h3>Enter test results</h3></div><Activity size={18} /></div>{!testIds.length && <div className="empty-state report-empty-results"><ClipboardList size={28} /><strong>Results appear here</strong><span>Select at least one enabled test from the left panel to begin entering values.</span></div>}
        <div className="selected-test-parameters">{testIds.map((id) => { const test = tests.find((item) => item.id === id); const parameters = parametersByTest[id] || []; if (!test) return null; return <section className="test-parameter-section" key={id}><div className="test-parameter-title"><strong>{test.name}</strong><span>{parameters.length} parameter{parameters.length === 1 ? '' : 's'}</span></div><div className="param-form-list">{parameters.map((param, index) => <ParameterInput key={`${id}-${param.name}-${index}`} parameter={param} onChange={(value) => changeValue(id, index, value)} onFlagChange={(value) => changeFlag(id, index, value)} />)}</div></section>; })}</div>
        <div className="preview-divider" /><div className="form-group"><label className="form-label" htmlFor="report-clinical-notes">Clinical Notes</label><textarea id="report-clinical-notes" className="form-input form-textarea" rows={4} value={interpretation} onChange={(e) => setInterpretation(e.target.value)} placeholder="Clinical notes or interpretation" /></div>
        <div className="editor-actions-row report-editor-actions"><div><span className="report-action-hint">{testIds.length ? `${testIds.length} test${testIds.length === 1 ? '' : 's'} ready for review` : 'Select a test before saving'}</span></div><button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary"><Save size={18} />Save report</button></div>
      </div>
    </div></form>
  </div>;
}

function ParameterInput({ parameter, onChange, onFlagChange }: { parameter: EditableParameter; onChange: (value: string) => void; onFlagChange: (value: TestParameter['status']) => void }) {
  const type = parameter.inputType || 'TEXT';
  const common = { className: 'form-input param-val-input', value: String(parameter.value ?? ''), onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value), required: parameter.required, 'aria-label': `Result for ${parameter.name}` };
  let control: ReactNode;
  if (type === 'SELECT' || type === 'QUALITATIVE') control = <select {...common} className="form-select param-val-input"><option value="">Select value</option>{(parameter.options || []).map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  else if (type === 'BOOLEAN') control = <select {...common} className="form-select param-val-input"><option value="">Select</option><option value="true">Yes</option><option value="false">No</option></select>;
  else if (type === 'MULTILINE_TEXT') control = <textarea {...common} className="form-input form-textarea param-val-input" rows={3} placeholder="Enter result" />;
  else control = <input {...common} type={type === 'NUMBER' || type === 'PERCENTAGE' ? 'number' : type === 'DATE' ? 'date' : type === 'DATETIME' ? 'datetime-local' : type === 'TIME' ? 'time' : 'text'} step={type === 'NUMBER' || type === 'PERCENTAGE' ? decimalStep(parameter.decimalPlaces) : undefined} placeholder={parameter.defaultValue || 'Observed value'} />;
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

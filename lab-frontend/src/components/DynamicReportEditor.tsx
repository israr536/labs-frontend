import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, X, Activity } from 'lucide-react';
import type { LabReport, TestParameter } from '../data/samples';
import reportsService from '../services/reportsService';
import testCatalogService, { type LabTest } from '../services/testCatalogService';
import { useToast } from './Toast';

type Props = { editingReport: LabReport | null; onSaveReport: (report: LabReport) => void; onCancel: () => void };

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
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [interpretation, setInterpretation] = useState('');

  const selectedTest = tests.find((test) => test.id === testId);
  const createParameters = (test: LabTest) => test.parameters.map((p) => ({ name: p.name, value: '', unit: p.unit || '', refRange: formatRange(p), minRef: p.normalMin ?? undefined, maxRef: p.normalMax ?? undefined, inputType: p.inputType, options: Array.isArray(p.options) ? p.options as string[] : undefined, status: 'Normal' as const }));

  useEffect(() => {
    if (editingReport) {
      setPatientName(editingReport.patientName); setAge(editingReport.age); setGender(editingReport.gender); setPhone(editingReport.phone); setEmail(editingReport.email || ''); setReferredBy(editingReport.referredBy); setDateCollected(editingReport.dateCollected); setStatus(editingReport.status); setParameters(editingReport.parameters); setInterpretation(editingReport.interpretation); setTestId((editingReport as LabReport & { testId?: string }).testId || '');
    } else if (!testId && tests[0]) {
      setTestId(tests[0].id); setParameters(createParameters(tests[0]));
    }
  }, [editingReport, tests]);

  const selectTest = (id: string) => { setTestId(id); const test = tests.find((item) => item.id === id); if (test) setParameters(createParameters(test)); };
  const changeValue = (index: number, value: string) => setParameters((current) => current.map((p, i) => i === index ? { ...p, value, status: flagForValue(value, p) } : p));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientName.trim() || !phone.trim() || !testId) { toast.show({ type: 'error', message: 'Patient name, phone and test are required.' }); return; }
    const payload: LabReport & { testId: string } = { id: editingReport?.id || `draft-${Date.now()}`, patientName, age, gender, phone, email, referredBy, dateCollected, dateReported: new Date().toISOString(), testType: selectedTest?.name || '', status, parameters, interpretation, testId };
    try {
      const saved = editingReport ? await reportsService.updateReport(payload.id, payload) : await reportsService.createReport(payload);
      onSaveReport(saved);
    } catch (error) { toast.show({ type: 'error', message: error instanceof Error ? error.message : 'Unable to save report.' }); }
  };

  return <div className="editor-container animate-fade-in"><div className="editor-header"><div><span className="saas-eyebrow">Result entry</span><h1>{editingReport ? 'Edit diagnostic report' : 'Create diagnostic report'}</h1><p className="subtitle">Test fields are loaded from your laboratory catalog.</p></div><button onClick={onCancel} className="btn btn-outline"><X size={18}/>Cancel</button></div>
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
      <div className="param-form-list">{parameters.map((param,index)=><div key={`${param.name}-${index}`} className="param-input-item"><div className="param-name-ref-row"><span className="param-form-name">{param.name}</span><span className="param-form-ref">{param.refRange} · {param.unit || 'no unit'}</span></div><div className="param-value-flag-row">{param.inputType === 'SELECT' && Array.isArray(param.options) ? <select className="form-select param-val-input" value={param.value} onChange={(e)=>changeValue(index,e.target.value)}><option value="">Select value</option>{param.options.map((o)=><option key={o} value={o}>{o}</option>)}</select> : param.inputType === 'BOOLEAN' ? <select className="form-select param-val-input" value={param.value} onChange={(e)=>changeValue(index,e.target.value)}><option value="">Select</option><option value="true">Yes</option><option value="false">No</option></select> : <input className="form-input param-val-input" type={param.inputType === 'NUMBER' || param.inputType === 'PERCENTAGE' ? 'number' : 'text'} value={param.value} onChange={(e)=>changeValue(index,e.target.value)} placeholder="Observed value"/>}<select className="form-select param-flag-select" value={param.status} onChange={(e)=>setParameters((current)=>current.map((p,i)=>i===index?{...p,status:e.target.value as TestParameter['status']}:p))}><option>Normal</option><option>High</option><option>Low</option><option>Abnormal</option></select></div></div>)}</div>
      <div className="preview-divider"/><div className="form-group"><label className="form-label">Clinical Notes</label><textarea className="form-input form-textarea" rows={4} value={interpretation} onChange={(e)=>setInterpretation(e.target.value)} placeholder="Clinical notes or interpretation"/></div><div className="editor-actions-row"><button type="button" onClick={onCancel} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary"><Save size={18}/>Save Diagnostic Report</button></div>
    </div></div></form></div>;
}

function formatRange(parameter: LabTest['parameters'][number]) { const min=parameter.normalMin; const max=parameter.normalMax; if(min!=null&&max!=null)return `${min} - ${max}`; if(min!=null)return `>= ${min}`; if(max!=null)return `<= ${max}`; return 'Clinical reference'; }
function flagForValue(value:string, parameter:TestParameter):TestParameter['status'] { const n=Number(value); if(value.trim()!==''&&Number.isFinite(n)){if(parameter.minRef!=null&&n<parameter.minRef)return 'Low';if(parameter.maxRef!=null&&n>parameter.maxRef)return 'High';} return 'Normal'; }

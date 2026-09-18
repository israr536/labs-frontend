import { useState, useEffect } from 'react';
import {
  Save,
  X,
  Activity,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { TEST_TEMPLATES } from '../data/samples';
import type { LabReport, TestParameter } from '../data/samples';
import reportsService from '../services/reportsService';
import { useToast } from './Toast';

interface ReportEditorProps {
  editingReport: LabReport | null;
  onSaveReport: (report: LabReport) => void;
  onCancel: () => void;
}

export default function ReportEditor({ editingReport, onSaveReport, onCancel }: ReportEditorProps) {
  const isEditMode = !!editingReport;
  const toast = useToast();

  // Initialize report form state
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referredBy, setReferredBy] = useState('Dr. Self / Walk-in');
  const [dateCollected, setDateCollected] = useState('');
  const [dateReported, setDateReported] = useState('');
  const [testType, setTestType] = useState('Complete Blood Count (CBC)');
  const [status, setStatus] = useState<'Completed' | 'Pending' | 'Critical' | 'Draft'>('Completed');
  const [parameters, setParameters] = useState<TestParameter[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [, setFieldErrors] = useState<Record<string, string>>({});
  const [, setIsSubmitting] = useState(false);

  // Set default timestamps
  useEffect(() => {
    if (!isEditMode) {
      const now = new Date();
      const formatTime = (d: Date) => {
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setDateCollected(formatTime(now));

      // Date reported standard: 4 hours later
      const reportedTime = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      setDateReported(formatTime(reportedTime));
    }
  }, [isEditMode]);

  // Load report data if editing
  useEffect(() => {
    if (editingReport) {
      setPatientName(editingReport.patientName);
      setAge(editingReport.age);
      setGender(editingReport.gender);
      setPhone(editingReport.phone);
      setEmail(editingReport.email || '');
      setReferredBy(editingReport.referredBy);
      setDateCollected(editingReport.dateCollected);
      setDateReported(editingReport.dateReported);
      setTestType(editingReport.testType);
      setStatus(editingReport.status);
      setParameters(editingReport.parameters);
      setInterpretation(editingReport.interpretation);
    } else {
      // Default to CBC template parameters
      loadTemplateParameters('Complete Blood Count (CBC)');
    }
  }, [editingReport]);

  const loadTemplateParameters = (selectedTemplate: string) => {
    const templateFields = TEST_TEMPLATES[selectedTemplate];
    if (templateFields) {
      const paramsList: TestParameter[] = templateFields.map(field => ({
        name: field.name,
        value: '',
        unit: field.unit,
        refRange: field.refRange,
        minRef: field.minRef,
        maxRef: field.maxRef,
        inputType: field.inputType,
        options: field.options,
        status: 'Normal'
      }));
      setParameters(paramsList);

      // Auto pre-populate dummy clinical interpretation
      setInterpretation(getDefaultInterpretation(selectedTemplate));
    }
  };

  const getDefaultInterpretation = (type: string) => {
    switch (type) {
      case 'Complete Blood Count (CBC)':
        return "Hematology profile: parameters evaluated. MCV, MCH, MCHC within acceptable clinical limits. WBC indices demonstrate stable leukocyte levels. Please correlate findings clinically.";
      case 'Lipid Profile':
        return "Lipid profile parameters. Elevated levels indicate dyslipidemia. Dietary review, aerobic exercise, and clinical follow-up regarding cardiovascular risk assessment are advised.";
      case 'Thyroid Profile':
        return "Thyroid indices evaluated. Normal levels indicate euthyroid state. In case of abnormal findings, levothyroxine therapy adjustments may be clinically indicated.";
      default:
        return "Test report parameters evaluated. Observed findings fall within physiological reference thresholds. Clinical review advised.";
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setTestType(selected);
    loadTemplateParameters(selected);
  };

  // Perform auto-calculation of Normal / High / Low status
  const handleParameterValueChange = (index: number, val: string) => {
    const updated = [...parameters];
    const param = updated[index];
    param.value = val;

    const numericVal = parseFloat(val);
    if (!isNaN(numericVal)) {
      if (param.minRef !== undefined && param.maxRef !== undefined) {
        if (numericVal < param.minRef) {
          param.status = 'Low';
        } else if (numericVal > param.maxRef) {
          param.status = 'High';
        } else {
          param.status = 'Normal';
        }
      } else if (param.minRef !== undefined) {
        if (numericVal < param.minRef) {
          param.status = 'Low';
        } else {
          param.status = 'Normal';
        }
      } else if (param.maxRef !== undefined) {
        if (numericVal > param.maxRef) {
          param.status = 'High';
        } else {
          param.status = 'Normal';
        }
      }
    } else {
      // For string values (like Urine pH or Nitrite Positive/Negative)
      if (val.toLowerCase() === 'positive' || val.toLowerCase() === 'cloudy' || val.toLowerCase() === 'trace') {
        param.status = 'Abnormal';
      } else {
        param.status = 'Normal';
      }
    }

    setParameters(updated);

    // Auto-update report status if there is a 'High' or 'Low' or 'Abnormal' status parameter
    const hasAbnormal = updated.some(p => p.status === 'High' || p.status === 'Low' || p.status === 'Abnormal');
    if (hasAbnormal && status === 'Completed') {
      // Optionally let it mark asCompleted but warn, or auto-set status.
      // We will allow the user to select status, but can auto-alert
    }
  };

  const handleParameterStatusChange = (index: number, newStatus: 'Normal' | 'High' | 'Low' | 'Abnormal') => {
    const updated = [...parameters];
    updated[index].status = newStatus;
    setParameters(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setValidationError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!patientName.trim()) errors.patientName = 'Patient name is required';
    if (!Number.isFinite(Number(age)) || Number(age) < 0 || Number(age) > 130) errors.age = 'Age must be between 0 and 130';
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'Invalid email address';
    if (!dateReported) errors.dateReported = 'Report date is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setValidationError('Fix the highlighted fields before saving.');
      return;
    }

    const reportId = editingReport ? editingReport.id : `REP-2026-${Math.floor(100 + Math.random() * 900)}`;

    const payload: LabReport = {
      id: reportId,
      patientName,
      age: Number(age),
      gender,
      phone,
      email,
      referredBy,
      dateCollected,
      dateReported,
      testType,
      status,
      parameters,
      interpretation,
    };

    // Submit to API and show inline errors if any
    (async () => {
      setIsSubmitting(true);
      try {
        let saved: any = null;
        if (editingReport) {
          saved = await reportsService.updateReport(payload.id, payload);
        } else {
          saved = await reportsService.createReport(payload);
        }

        const savedReport = saved && saved.id ? (saved as LabReport) : payload;
        onSaveReport(savedReport);
      } catch (err: any) {
        // Try to extract field-level errors from the API response if present
        const body = err?.body || err?.message || null;
        if (body && typeof body === 'object') {
          // If API returned an object with validation details
          const newFieldErrors: Record<string, string> = {};
          if (body.errors && typeof body.errors === 'object') {
            for (const k of Object.keys(body.errors)) {
              newFieldErrors[k] = String(body.errors[k]);
            }
          }
          if (Object.keys(newFieldErrors).length) {
            setFieldErrors(newFieldErrors);
            setValidationError('Server validation errors.');
            toast.show({ type: 'error', message: 'Server validation errors' });
          } else {
            setValidationError(String(body.message || 'Failed to save report'));
            toast.show({ type: 'error', message: String(body.message || 'Failed to save report') });
          }
        } else {
          setValidationError(String(err?.message || 'Failed to save report'));
          toast.show({ type: 'error', message: String(err?.message || 'Failed to save report') });
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="editor-container animate-fade-in">
      <div className="editor-header">
        <div>
          <h1>{isEditMode ? `Edit Report [${editingReport.id}]` : "Create Diagnostic Report"}</h1>
          <p className="subtitle">{isEditMode ? "Modify existing diagnostic record parameters" : "Draft a new medical report using clinical templates"}</p>
        </div>
        <button onClick={onCancel} className="btn btn-outline">
          <X size={18} />
          <span>Cancel</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        {validationError && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{validationError}</span>
          </div>
        )}

        <div className="form-grid-layout">
          {/* Left panel: Patient demographics */}
          <div className="glass-panel editor-demographics-card">
            <div className="card-header border-b">
              <Sparkles size={18} className="text-secondary" />
              <h3>Patient Demographics</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => { setPatientName(e.target.value); setValidationError(null); }}
                className="form-input"
                placeholder="First and last name"
                required
              />
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Patient Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="form-input"
                  min="0"
                  max="130"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Patient Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="form-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Contact Phone (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setValidationError(null); }}
                  className="form-input"
                  placeholder="Patient phone number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Patient email address"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Referred By (Doctor) (Optional)</label>
              <input
                type="text"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="form-input"
                placeholder="Doctor name, qualification"
              />
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Sample Collected Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={dateCollected}
                  onChange={(e) => setDateCollected(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Report Generated Date</label>
                <input
                  type="datetime-local"
                  value={dateReported}
                  onChange={(e) => setDateReported(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Diagnostic Test Category</label>
                <select
                  value={testType}
                  onChange={handleTemplateChange}
                  className="form-select"
                  disabled={isEditMode} /* Keep consistency when editing */
                >
                  {Object.keys(TEST_TEMPLATES).map((tmpl) => (
                    <option key={tmpl} value={tmpl}>{tmpl}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Clinical Workflow Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="form-select"
                >
                  <option value="Completed">Completed (Signed)</option>
                  <option value="Critical">Critical (Immediate Alert)</option>
                  <option value="Pending">Pending (Lab Review)</option>
                  <option value="Draft">Draft (Unreleased)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right panel: Parameters Form & Interpretation */}
          <div className="glass-panel editor-parameters-card">
            <div className="card-header border-b">
              <Activity size={18} className="text-primary" />
              <h3>Report Test Parameters</h3>
            </div>

            <div className="param-form-list">
              {parameters.map((param, index) => (
                <div key={index} className="param-input-item">
                  <div className="param-name-ref-row">
                    <span className="param-form-name">{param.name}</span>
                    <span className="param-form-ref">Range: {param.refRange} ({param.unit || "no unit"})</span>
                  </div>
                  <div className="param-value-flag-row">
                    {param.inputType === 'SELECT' && Array.isArray(param.options) ? (
                      <select
                        value={param.value || ''}
                        onChange={(e) => handleParameterValueChange(index, e.target.value)}
                        className="form-select param-val-input"
                      >
                        <option value="">Select value</option>
                        {param.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={param.inputType === 'NUMBER' ? 'number' : 'text'}
                        value={param.value}
                        onChange={(e) => handleParameterValueChange(index, e.target.value)}
                        className="form-input param-val-input"
                        placeholder="Observed Value"
                      />
                    )}
                    <select
                      value={param.status}
                      onChange={(e) => handleParameterStatusChange(index, e.target.value as any)}
                      className="form-select param-flag-select"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Low">Low</option>
                      <option value="Abnormal">Abnormal</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="preview-divider"></div>

            <div className="form-group">
              <label className="form-label">Clinical Interpretation & Advisor Note</label>
              <textarea
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
                rows={4}
                className="form-input form-textarea"
                placeholder="Doctor's diagnostic summaries, diet advisory, and medication indicators..."
              />
            </div>

            <div className="editor-actions-row">
              <button type="button" onClick={onCancel} className="btn btn-outline">
                <span>Cancel</span>
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={18} />
                <span>Save Diagnostic Report</span>
              </button>
            </div>
          </div>
        </div>
      </form>


    </div>
  );
}

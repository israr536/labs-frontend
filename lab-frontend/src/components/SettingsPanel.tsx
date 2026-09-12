import { useState } from 'react';
import {
  Save,
  Building2,
  FileCheck,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import type { LabSettings } from '../data/samples';

interface SettingsPanelProps {
  settings: LabSettings;
  onSaveSettings: (settings: LabSettings) => void;
}

export default function SettingsPanel({ settings, onSaveSettings }: SettingsPanelProps) {
  const [formData, setFormData] = useState<LabSettings>({ ...settings });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSuccessMsg(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please choose a PNG, JPG, or WEBP image for the laboratory logo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('The laboratory logo must be smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, logoDataUrl: String(reader.result ?? '') }));
      setErrorMsg(null);
      setSuccessMsg(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDoctorChange = (index: number, field: string, value: string) => {
    const updatedDoctors = formData.doctors.map((doc, idx) => {
      if (idx === index) {
        return { ...doc, [field]: value };
      }
      return doc;
    });
    setFormData(prev => ({ ...prev, doctors: updatedDoctors }));
    setSuccessMsg(false);
  };

  const addDoctor = () => {
    setFormData(prev => ({
      ...prev,
      doctors: [
        ...prev.doctors,
        { name: "Dr. New Doctor, MD", qualification: "MD Pathology", designation: "Pathologist" }
      ]
    }));
    setSuccessMsg(false);
  };

  const removeDoctor = (index: number) => {
    if (formData.doctors.length <= 1) {
      setErrorMsg("At least one authorized signing doctor is required for medical reports.");
      setTimeout(() => setErrorMsg(null), 4000);
      return;
    }
    const updatedDoctors = formData.doctors.filter((_, idx) => idx !== index);
    setFormData(prev => ({ ...prev, doctors: updatedDoctors }));
    setSuccessMsg(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.labName.trim()) {
      setErrorMsg("Laboratory Name cannot be empty.");
      return;
    }
    onSaveSettings(formData);
    setSuccessMsg(true);
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <h1>Laboratory Settings</h1>
        <p className="subtitle">Configure medical facility metadata, registrations, and authorized signatures</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {errorMsg && (
          <div className="settings-alert alert-error">
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="settings-alert alert-success">
            <FileCheck size={20} />
            <span>Laboratory settings updated successfully! Custom details will appear on all reports.</span>
          </div>
        )}

        <div className="settings-grid">
          {/* Lab Profile */}
          <div className="glass-panel settings-card">
            <div className="card-header">
              <Building2 size={20} className="text-primary" />
              <h3>Facility Profile</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Laboratory Name</label>
              <input
                type="text"
                name="labName"
                value={formData.labName}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Apex Diagnostics"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slogan / Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Precision diagnostics for healthcare"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="form-input form-textarea"
                placeholder="Full clinical address"
              />
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Phone Numbers</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Facility phone numbers"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Facility support email"
                />
              </div>
            </div>

            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">Website Domain</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. www.apexdiagnostics.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clinical License Code</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. DL-342-MED"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ISO / Accreditation Certifications</label>
              <input
                type="text"
                name="isoCertification"
                value={formData.isoCertification}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. ISO 9001:2015 & NABL Accredited"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Laboratory Logo</label>
              <div className="logo-upload-row">
                <div className="logo-preview">
                  {formData.logoDataUrl ? <img src={formData.logoDataUrl} alt="Laboratory logo preview" /> : <Building2 size={22} />}
                </div>
                <div className="logo-upload-copy">
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} aria-label="Upload laboratory logo" />
                  <small>Displayed on the left side of every report header. PNG or JPG, maximum 2 MB.</small>
                  {formData.logoDataUrl && <button type="button" className="logo-remove" onClick={() => setFormData(prev => ({ ...prev, logoDataUrl: '' }))}>Remove logo</button>}
                </div>
              </div>
            </div>

            <div className="report-setting-toggle">
              <div>
                <strong>Show test method names on reports</strong>
                <small>Display the configured method below each test name in downloaded and printed reports.</small>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.showMethodNames}
                  onChange={(e) => { setFormData(prev => ({ ...prev, showMethodNames: e.target.checked })); setSuccessMsg(false); }}
                  aria-label="Show test method names on reports"
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Doctor Signatures */}
          <div className="glass-panel settings-card flex-col">
            <div className="card-header border-b">
              <div className="flex-align">
                <FileCheck size={20} className="text-secondary" />
                <h3>Authorized Signatories</h3>
              </div>
              <button type="button" onClick={addDoctor} className="btn-add-doc">
                <Plus size={16} />
                <span>Add Doctor</span>
              </button>
            </div>

            <p className="card-sub text-margin">
              Pathologists and clinical researchers listed below will appear at the foot of all PDF reports as authorized signatures.
            </p>

            <div className="doctors-list">
              {formData.doctors.map((doctor, idx) => (
                <div key={idx} className="doctor-item-box">
                  <div className="doc-item-header">
                    <h4>Signatory #{idx + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeDoctor(idx)}
                      className="btn-delete-doc"
                      title="Remove Signatory"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={doctor.name}
                      onChange={(e) => handleDoctorChange(idx, 'name', e.target.value)}
                      className="form-input"
                      placeholder="e.g. Dr. Jane Doe, MD"
                    />
                  </div>

                  <div className="grid-2-col">
                    <div className="form-group">
                      <label className="form-label">Qualifications</label>
                      <input
                        type="text"
                        value={doctor.qualification}
                        onChange={(e) => handleDoctorChange(idx, 'qualification', e.target.value)}
                        className="form-input"
                        placeholder="e.g. MD (Pathology)"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation / Role</label>
                      <input
                        type="text"
                        value={doctor.designation}
                        onChange={(e) => handleDoctorChange(idx, 'designation', e.target.value)}
                        className="form-input"
                        placeholder="e.g. Laboratory Director"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-submit-row">
          <button type="submit" className="btn btn-primary btn-save">
            <Save size={18} />
            <span>Save Lab Configurations</span>
          </button>
        </div>
      </form>


    </div>
  );
}

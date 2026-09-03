import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader } from 'lucide-react';
import patientsService from '../services/patientsService';
import { useToast } from './Toast';
import Modal from './Modal';

interface Patient {
  id: string;
  name: string;
  age?: number;
  gender: string;
  mobile?: string;
  email?: string;
  address?: string;
}

interface PatientListProps {
  onSelectPatient?: (patient: Patient) => void;
  onAddNew?: () => void;
}

export default function PatientList({ onSelectPatient, onAddNew }: PatientListProps) {
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      const data = await patientsService.listPatients(search);
      setPatients(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.show({ type: 'error', message: error.message || 'Failed to load patients' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await patientsService.deletePatient(deleteId);
      setPatients(patients.filter(p => p.id !== deleteId));
      toast.show({ type: 'success', message: 'Patient deleted' });
      setDeleteId(null);
    } catch (error: any) {
      toast.show({ type: 'error', message: error.message || 'Failed to delete patient' });
    }
  }

  return (
    <div className="patient-list">
      <div className="list-header">
        <h2>Patients</h2>
        <button className="btn btn-primary" onClick={onAddNew}>
          <Plus size={16} /> Add Patient
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={() => loadPatients()}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <p>No patients found</p>
          <button className="btn btn-secondary" onClick={onAddNew}>
            Create first patient
          </button>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map(patient => (
            <div key={patient.id} className="patient-card">
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p className="text-sm">Age: {patient.age || 'N/A'} | {patient.gender}</p>
                {patient.mobile && <p className="text-sm text-muted">{patient.mobile}</p>}
              </div>
              <div className="patient-actions">
                <button
                  onClick={() => onSelectPatient?.(patient)}
                  className="btn btn-sm btn-secondary"
                >
                  <Edit2 size={14} /> Select
                </button>
                <button
                  onClick={() => setDeleteId(patient.id)}
                  className="btn btn-sm btn-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <Modal
          title="Delete Patient"
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          confirmText="Delete"
          isDangerous
        >
          <p>Are you sure you want to delete this patient? This action cannot be undone.</p>
        </Modal>
      )}

      <style>{`
        .patient-list { display: flex; flex-direction: column; gap: 20px; }
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .list-header h2 { margin: 0; }
        .search-bar { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(148,163,184,0.05); border-radius: 12px; border: 1px solid rgba(148,163,184,0.2); }
        .search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 14px; }
        .loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; text-align: center; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .patient-card { padding: 16px; background: rgba(255,255,255,0.5); border: 1px solid rgba(148,163,184,0.2); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .patient-info h3 { margin: 0 0 8px 0; font-size: 16px; }
        .patient-info p { margin: 4px 0; font-size: 13px; }
        .text-sm { font-size: 13px; }
        .text-muted { color: var(--text); opacity: 0.7; }
        .patient-actions { display: flex; gap: 8px; }
        .btn-sm { padding: 8px 12px; font-size: 12px; }
        .btn-danger { background: #dc2626; color: white; }
      `}</style>
    </div>
  );
}

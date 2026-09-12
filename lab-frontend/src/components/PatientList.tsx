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


    </div>
  );
}

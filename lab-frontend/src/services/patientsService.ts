import { request } from './api';

export interface PatientRecord { id: string; name: string; age?: number; gender: string; mobile?: string; email?: string; address?: string; [key: string]: unknown; }
export function listPatients(search?: string) { const q = search ? `?search=${encodeURIComponent(search)}` : ''; return request<PatientRecord[]>(`patients${q}`); }
export function getPatient(id: string) { return request<PatientRecord>(`patients/${id}`); }
export function createPatient(body: unknown) { return request<PatientRecord>('patients', { method: 'POST', body: JSON.stringify(body) }); }
export function updatePatient(id: string, body: unknown) { return request<PatientRecord>(`patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); }
export function deletePatient(id: string) { return request<{ success: boolean }>(`patients/${id}`, { method: 'DELETE' }); }
export default { listPatients, getPatient, createPatient, updatePatient, deletePatient };

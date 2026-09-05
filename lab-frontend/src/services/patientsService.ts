import { request } from './api';

type AnyRecord = Record<string, any>;
export function listPatients(search?: string) { const q = search ? `?search=${encodeURIComponent(search)}` : ''; return request<AnyRecord[]>(`patients${q}`); }
export function getPatient(id: string) { return request<AnyRecord>(`patients/${id}`); }
export function createPatient(body: unknown) { return request<AnyRecord>('patients', { method: 'POST', body: JSON.stringify(body) }); }
export function updatePatient(id: string, body: unknown) { return request<AnyRecord>(`patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); }
export function deletePatient(id: string) { return request<AnyRecord>(`patients/${id}`, { method: 'DELETE' }); }
export default { listPatients, getPatient, createPatient, updatePatient, deletePatient };

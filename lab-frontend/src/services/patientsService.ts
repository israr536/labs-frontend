import { request } from './api';

export function listPatients(search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`patients${q}`);
}

export function getPatient(id: string) {
  return request(`patients/${id}`);
}

export function createPatient(body: unknown) {
  return request('patients', { method: 'POST', body: JSON.stringify(body) });
}

export function updatePatient(id: string, body: unknown) {
  return request(`patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function deletePatient(id: string) {
  return request(`patients/${id}`, { method: 'DELETE' });
}

export default { listPatients, getPatient, createPatient, updatePatient, deletePatient };

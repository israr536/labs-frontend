import { request } from './api';

export interface PatientRecord { id: string; name: string; age?: number; gender: string; mobile?: string; email?: string; address?: string; [key: string]: unknown; }

const listCache = new Map<string, { expiresAt: number; value: PatientRecord[] }>();
const inFlight = new Map<string, Promise<PatientRecord[]>>();
const CACHE_TTL = 60_000;

export function listPatients(search?: string) {
  const key = (search ?? '').trim().toLowerCase();
  const cached = listCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);
  if (cached) listCache.delete(key);
  const pending = inFlight.get(key);
  if (pending) return pending;
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const requestPromise = request<PatientRecord[]>(`patients${q}`).then((value) => {
    listCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL });
    inFlight.delete(key);
    return value;
  }).catch((error) => {
    inFlight.delete(key);
    throw error;
  });
  inFlight.set(key, requestPromise);
  return requestPromise;
}

export function invalidatePatientCache() { listCache.clear(); }
export function getPatient(id: string) { return request<PatientRecord>(`patients/${id}`); }
export function createPatient(body: unknown) { return request<PatientRecord>('patients', { method: 'POST', body: JSON.stringify(body) }).then((patient) => { invalidatePatientCache(); return patient; }); }
export function updatePatient(id: string, body: unknown) { return request<PatientRecord>(`patients/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then((patient) => { invalidatePatientCache(); return patient; }); }
export function deletePatient(id: string) { return request<{ success: boolean }>(`patients/${id}`, { method: 'DELETE' }).then((result) => { invalidatePatientCache(); return result; }); }
export default { listPatients, getPatient, createPatient, updatePatient, deletePatient, invalidatePatientCache };

import { request } from './api';

export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN';
export interface LabUser { id: string; username: string; email: string; mobile: string; role: UserRole; isActive: boolean; createdAt?: string; }

export function listUsers() { return request<LabUser[]>('users'); }
export function getUser(id: string) { return request<LabUser>(`users/${id}`); }
export function createUser(body: { email: string; mobile: string; password: string; role: UserRole; isActive?: boolean }) { return request<LabUser>('users', { method: 'POST', body: JSON.stringify(body) }); }
export function updateUser(id: string, body: Partial<{ email: string; mobile: string; password: string; role: UserRole; isActive: boolean }>) { return request<LabUser>(`users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); }
export function deleteUser(id: string) { return request<{ success: boolean }>(`users/${id}`, { method: 'DELETE' }); }

export default { listUsers, getUser, createUser, updateUser, deleteUser };

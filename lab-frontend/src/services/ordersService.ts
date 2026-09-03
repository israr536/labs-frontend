import { request } from './api';

export interface CreateOrderInput {
  patientId: string;
  testIds: string[];
  referredBy?: string;
  clinicalNotes?: string;
}

export function listOrders(params?: { page?: number; limit?: number; search?: string; status?: string }) {
  const query = new URLSearchParams();
  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.min(100, Math.max(1, params?.limit ?? 20));
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (params?.search?.trim()) query.set('search', params.search.trim());
  if (params?.status) query.set('status', params.status);
  return request(`orders?${query.toString()}`);
}

export function getOrder(id: string) { return request(`orders/${id}`); }
export function createOrder(body: CreateOrderInput) { return request('orders', { method: 'POST', body: JSON.stringify(body) }); }
export default { listOrders, getOrder, createOrder };

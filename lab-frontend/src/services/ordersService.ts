import { request } from './api';

export interface CreateOrderInput {
  patientId: string;
  testIds: string[];
  referredBy?: string;
  clinicalNotes?: string;
}

export function listOrders(params?: { page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.page) search.set('skip', String(Math.max(0, (params.page - 1) * (params.limit ?? 20))));
  if (params?.limit) search.set('take', String(params.limit));
  const query = search.toString();
  return request(`orders${query ? `?${query}` : ''}`);
}

export function getOrder(id: string) { return request(`orders/${id}`); }
export function createOrder(body: CreateOrderInput) { return request('orders', { method: 'POST', body: JSON.stringify(body) }); }
export default { listOrders, getOrder, createOrder };

import { request } from './api';

export interface CreateOrderInput {
  patientId: string;
  testIds: string[];
  referredBy?: string;
  clinicalNotes?: string;
}

export function listOrders(params?: { search?: string; status?: string; page?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.search) search.set('search', params.search);
  if (params?.status) search.set('status', params.status);
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return request(`orders${query ? `?${query}` : ''}`);
}

export function getOrder(id: string) {
  return request(`orders/${id}`);
}

export function createOrder(body: CreateOrderInput) {
  return request('orders', { method: 'POST', body: JSON.stringify(body) });
}

export default { listOrders, getOrder, createOrder };

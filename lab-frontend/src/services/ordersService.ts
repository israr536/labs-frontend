import { request } from './api';

export const ORDER_STATUSES = [
  'REGISTERED',
  'SAMPLE_COLLECTED',
  'PROCESSING',
  'RESULT_ENTERED',
  'VERIFIED',
  'FINAL',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface CreateOrderInput {
  patientId: string;
  testIds: string[];
  referredBy?: string;
  clinicalNotes?: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
}

export interface OrderListResponse<T = unknown> {
  data: T[];
  pagination: {
    total: number;
    skip: number;
    take: number;
    page: number;
    pages: number;
  };
}

export function listOrders(params: ListOrdersParams = {}) {
  const query = new URLSearchParams();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(params.limit ?? 20)));

  query.set('page', String(page));
  query.set('limit', String(limit));
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.status) query.set('status', params.status);

  return request<OrderListResponse>(`orders?${query.toString()}`);
}

export function getOrder(id: string) {
  return request(`orders/${encodeURIComponent(id)}`);
}

export function createOrder(body: CreateOrderInput) {
  const patientId = body.patientId.trim();
  const testIds = [...new Set(body.testIds.map((id) => id.trim()).filter(Boolean))];

  if (!patientId) throw new Error('Patient is required');
  if (!testIds.length) throw new Error('At least one test is required');

  return request('orders', {
    method: 'POST',
    body: JSON.stringify({
      patientId,
      testIds,
      referredBy: body.referredBy?.trim() || undefined,
      clinicalNotes: body.clinicalNotes?.trim() || undefined,
    }),
  });
}

export default { listOrders, getOrder, createOrder, ORDER_STATUSES };

import { request } from './api';
export const ORDER_STATUSES = ['REGISTERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'RESULT_ENTERED', 'VERIFIED', 'FINAL', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
type AnyRecord = Record<string, any>;
export interface CreateOrderInput { patientId: string; testIds: string[]; referredBy?: string; clinicalNotes?: string; }
export interface ListOrdersParams { page?: number; limit?: number; search?: string; status?: OrderStatus | string; includeTotal?: boolean; }
export interface OrderListResponse<T = AnyRecord> { data: T[]; pagination: { total?: number; skip: number; take: number; page: number; pages?: number; hasMore?: boolean; }; }
const listCache = new Map<string, { expiresAt: number; value: OrderListResponse }>();
const detailCache = new Map<string, { expiresAt: number; value: AnyRecord }>();
const detailInFlight = new Map<string, Promise<AnyRecord>>();
const CACHE_TTL = 30000;
const DETAIL_CACHE_TTL = 15000;
export function listOrders(params: ListOrdersParams = {}) {
  const query = new URLSearchParams();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const limit = Math.min(100, Math.max(1, Math.floor(params.limit ?? 20)));
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.status && ORDER_STATUSES.includes(params.status as OrderStatus)) query.set('status', params.status);
  if (params.includeTotal !== false) query.set('includeTotal', 'true');
  const key = query.toString();
  const cached = listCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);
  if (cached) listCache.delete(key);
  return request<OrderListResponse>(`orders?${key}`).then((response) => { listCache.set(key, { value: response, expiresAt: Date.now() + CACHE_TTL }); return response; });
}
export function invalidateOrderListCache() { listCache.clear(); }
export function invalidateOrderCache(id?: string) { if (id) detailCache.delete(id); else detailCache.clear(); }
export function getOrder(id: string) {
  const key = encodeURIComponent(id);
  const cached = detailCache.get(id);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);
  if (cached) detailCache.delete(id);
  const pending = detailInFlight.get(id);
  if (pending) return pending;
  const requestPromise = request<any>(`orders/${key}`).then((order) => {
    detailCache.set(id, { value: order, expiresAt: Date.now() + DETAIL_CACHE_TTL });
    detailInFlight.delete(id);
    return order;
  }).catch((error) => {
    detailInFlight.delete(id);
    throw error;
  });
  detailInFlight.set(id, requestPromise);
  return requestPromise;
}
export function createOrder(body: CreateOrderInput) {
  const patientId = body.patientId.trim();
  const testIds = [...new Set(body.testIds.map((id) => id.trim()).filter(Boolean))];
  if (!patientId) throw new Error('Patient is required');
  if (!testIds.length) throw new Error('At least one test is required');
  return request<any>('orders', { method: 'POST', body: JSON.stringify({ patientId, testIds, referredBy: body.referredBy?.trim() || undefined, clinicalNotes: body.clinicalNotes?.trim() || undefined }) }).then((order) => {
    invalidateOrderListCache();
    if (order?.id) detailCache.set(order.id, { value: order, expiresAt: Date.now() + DETAIL_CACHE_TTL });
    return order;
  });
}
export default { listOrders, getOrder, createOrder, invalidateOrderListCache, invalidateOrderCache, ORDER_STATUSES };

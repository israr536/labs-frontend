import { request } from './api';

export function createSamples(orderId: string) {
  return request(`samples/orders/${orderId}`, { method: 'POST' });
}

export function listSamples(params?: { status?: string; orderId?: string }) {
  const search = new URLSearchParams();
  if (params?.status) search.set('status', params.status);
  if (params?.orderId) search.set('orderId', params.orderId);
  const query = search.toString();
  return request(`samples${query ? `?${query}` : ''}`);
}

export function getSample(id: string) {
  return request(`samples/${id}`);
}

export function updateSampleStatus(id: string, status: string, rejectedReason?: string) {
  return request(`samples/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectedReason }),
  });
}

export default { createSamples, listSamples, getSample, updateSampleStatus };

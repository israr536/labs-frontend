import { request } from './api';

export function createSamples(orderId: string, body?: { specimenType?: string; container?: string }) {
  return request(`samples/orders/${encodeURIComponent(orderId)}`, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function listSamples(params?: { orderId?: string }) {
  const search = new URLSearchParams();
  if (params?.orderId) search.set('orderId', params.orderId);
  const query = search.toString();
  return request(`samples${query ? `?${query}` : ''}`);
}

export function getSample(id: string) {
  return request(`samples/${encodeURIComponent(id)}`);
}

export function updateSampleStatus(
  id: string,
  status: string,
  rejectedReason?: string,
) {
  const body: { status: string; rejectedReason?: string } = { status };
  if (rejectedReason?.trim()) body.rejectedReason = rejectedReason.trim();

  return request(`samples/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export default { createSamples, listSamples, getSample, updateSampleStatus };

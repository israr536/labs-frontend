import { request } from './api';

export interface ResultInput {
  parameterId: string;
  value: string;
  sampleId?: string;
}

export function getResults(orderId: string) {
  return request(`orders/${orderId}/results`);
}

export function saveResults(orderId: string, results: ResultInput[]) {
  return request(`orders/${orderId}/results`, {
    method: 'PATCH',
    body: JSON.stringify({ results }),
  });
}

export function verifyResults(orderId: string) {
  return request(`orders/${orderId}/verify`, { method: 'POST' });
}

export default { getResults, saveResults, verifyResults };

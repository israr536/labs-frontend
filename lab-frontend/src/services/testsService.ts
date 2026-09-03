import { request } from './api';

export function listTests(includeInactive?: string) {
  const q = includeInactive ? `?includeInactive=${encodeURIComponent(includeInactive)}` : '';
  return request(`tests${q}`);
}

export function getTest(id: string) {
  return request(`tests/${id}`);
}

export function createTest(body: unknown) {
  return request('tests', { method: 'POST', body: JSON.stringify(body) });
}

export function updateTest(id: string, body: unknown) {
  return request(`tests/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function deleteTest(id: string) {
  return request(`tests/${id}`, { method: 'DELETE' });
}

export function addParameter(testId: string, body: unknown) {
  return request(`tests/${testId}/parameters`, { method: 'POST', body: JSON.stringify(body) });
}

export function updateParameter(testId: string, parameterId: string, body: unknown) {
  return request(`tests/${testId}/parameters/${parameterId}`, { method: 'PATCH', body: JSON.stringify(body) });
}

export function removeParameter(testId: string, parameterId: string) {
  return request(`tests/${testId}/parameters/${parameterId}`, { method: 'DELETE' });
}

export default {
  listTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  addParameter,
  updateParameter,
  removeParameter,
};

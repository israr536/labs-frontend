import { request } from './api';

export function finalizeReport(orderId: string) { return request(`orders/${orderId}/finalize`, { method: 'POST' }); }
export function getFinalReport(orderId: string) { return request(`orders/${orderId}/report`); }
export function listReportVersions(orderId: string) { return request(`orders/${orderId}/report/versions`); }
export function amendReport(orderId: string, reason: string) { return request(`orders/${orderId}/report/amend`, { method: 'POST', body: JSON.stringify({ reason }) }); }

export async function downloadFinalReport(orderId: string) {
  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  const token = localStorage.getItem('lab_access_token');
  const res = await fetch(`${API_BASE}/orders/${orderId}/report/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!res.ok) throw new Error('Unable to download final report');
  return res.blob();
}

export default { finalizeReport, getFinalReport, listReportVersions, amendReport, downloadFinalReport };

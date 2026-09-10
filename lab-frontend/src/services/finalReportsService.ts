import { request, requestBlob } from './api';

export interface FinalReport {
  id: string;
  reportNumber: string;
  version: number;
  finalizedAt: string;
  finalizedBy?: { id: string; username: string; role: string };
  [key: string]: unknown;
}

export function finalizeReport(orderId: string): Promise<FinalReport> { return request<FinalReport>(`orders/${orderId}/finalize`, { method: 'POST' }); }
export function getFinalReport(orderId: string): Promise<FinalReport> { return request<FinalReport>(`orders/${orderId}/report`); }
export function listReportVersions(orderId: string) { return request(`orders/${orderId}/report/versions`); }
export function amendReport(orderId: string, reason: string) { const normalizedReason = reason.trim(); if (normalizedReason.length < 5) throw new Error('Amendment reason must be at least 5 characters'); return request(`orders/${orderId}/report/amend`, { method: 'POST', body: JSON.stringify({ reason: normalizedReason }) }); }

export function downloadFinalReport(orderId: string): Promise<Blob> {
  return requestBlob(`orders/${orderId}/report/pdf`);
}

export default { finalizeReport, getFinalReport, listReportVersions, amendReport, downloadFinalReport };

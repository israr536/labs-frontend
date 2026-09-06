import { request } from './api';

export type CriticalNotificationMethod = 'PHONE' | 'IN_PERSON' | 'ELECTRONIC' | 'OTHER';
export type CriticalResultStatus = 'PENDING' | 'NOTIFIED' | 'ACKNOWLEDGED' | 'SUPERSEDED';

export interface CriticalNotificationAttempt {
  id: string;
  method: CriticalNotificationMethod;
  attemptedAt: string;
  contactedName?: string | null;
  contactDetails?: string | null;
  successful: boolean;
  readBackConfirmed: boolean;
  notes?: string | null;
  attemptedById: string;
}

export interface CriticalResult {
  id: string;
  orderResultId: string;
  patientId: string;
  testId: string;
  parameterId: string;
  occurrence: number;
  value: string;
  unit?: string | null;
  direction: 'LOW' | 'HIGH';
  criticalThreshold?: number | null;
  referenceRangeSnapshot?: unknown;
  status: CriticalResultStatus;
  detectedAt: string;
  notifiedAt?: string | null;
  notifiedTo?: string | null;
  acknowledgedAt?: string | null;
  acknowledgementNote?: string | null;
  patientName: string;
  testName: string;
  parameterName: string;
  notificationAttempts: CriticalNotificationAttempt[];
}

const criticalResultsService = {
  pending: () => request<CriticalResult[]>('critical-results/pending'),
  get: (id: string) => request<CriticalResult>(`critical-results/${id}`),
  notify: (id: string, body: {
    method: CriticalNotificationMethod;
    successful: boolean;
    recipient?: string;
    contactDetails?: string;
    readBackConfirmed?: boolean;
    note?: string;
  }) => request<CriticalResult>(`critical-results/${id}/notification-attempt`, { method: 'PATCH', body: JSON.stringify(body) }),
  acknowledge: (id: string, note?: string) => request<CriticalResult>(`critical-results/${id}/acknowledge`, { method: 'PATCH', body: JSON.stringify({ note }) }),
};

export default criticalResultsService;

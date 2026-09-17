import { request } from './api';

export interface DashboardSummary {
  totalPatients: number;
  totalReports: number;
  completedReports: number;
  pendingReports: number;
  criticalReports: number;
}

export function getSummary() {
  return request<DashboardSummary>('dashboard/summary');
}

export default { getSummary };

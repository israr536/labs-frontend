import { request } from './api';

export type UsageResource = 'users' | 'patients' | 'tests' | 'orders';

export interface SubscriptionLimits {
  maxUsers: number | null;
  maxPatients: number | null;
  maxTests: number | null;
  maxOrders: number | null;
}

export interface SubscriptionUsage {
  users: number;
  patients: number;
  tests: number;
  orders: number;
}

export interface SubscriptionStatus {
  plan: string;
  planName: string;
  status: 'active' | 'scheduled' | 'pending' | 'expired' | string;
  trial?: boolean;
  startsAt: string | null;
  endsAt: string | null;
  limits: SubscriptionLimits;
  usage: SubscriptionUsage;
}

export function getStatus() {
  return request<SubscriptionStatus>('subscription/status');
}

export default { getStatus };

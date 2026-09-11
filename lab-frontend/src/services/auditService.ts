import { request } from './api';

export interface AuditActor { id: string; username?: string | null; role?: string | null }
export interface AuditLogRecord {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: AuditActor | null;
}

export function listAuditLogs(params: { entity?: string; entityId?: string; limit?: number; offset?: number } = {}) {
  const query = new URLSearchParams();
  if (params.entity) query.set('entity', params.entity);
  if (params.entityId) query.set('entityId', params.entityId);
  if (params.limit != null) query.set('limit', String(params.limit));
  if (params.offset != null) query.set('offset', String(params.offset));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request<AuditLogRecord[]>(`audit-logs${suffix}`);
}

export default { listAuditLogs };

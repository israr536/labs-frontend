import type { LabReport, TestParameter } from '../data/samples';
import { request } from './api';
import patientsService from './patientsService';
import testsService from './testsService';

type ApiReport = Record<string, any>;
type ReportListApi = { data: ApiReport[]; pagination?: any };
export type ReportTemplateId = 'classic' | 'modern' | 'compact' | 'detailed' | 'premium' | 'minimal';
export type ReportTemplate = { id: ReportTemplateId; name: string; description: string };
type CombinedReportBody = Partial<LabReport> & { testIds?: string[]; parametersByTest?: Record<string, TestParameter[]> };

export async function listReportTemplates(): Promise<ReportTemplate[]> { return request<ReportTemplate[]>('reports/templates'); }
export function getSavedReportTemplate(): ReportTemplateId { try { const value = localStorage.getItem('lab_report_template'); return ['classic','modern','compact','detailed','premium','minimal'].includes(value || '') ? value as ReportTemplateId : 'classic'; } catch { return 'classic'; } }
export function saveReportTemplate(template: ReportTemplateId) { try { localStorage.setItem('lab_report_template', template); } catch {} }

/**
 * Patient Register is order-based. A LabOrder is the single clinical record for
 * one patient visit and can contain many tests. Do not read the legacy /reports
 * table here because that table is one-test-per-report and would split a panel.
 */
export async function listReports(filters?: { status?: string; search?: string; patientId?: string; testId?: string; skip?: number; take?: number }): Promise<{ data: LabReport[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
  if (filters?.take !== undefined) params.append('take', String(filters.take));
  const q = params.toString() ? `?${params.toString()}` : '';
  const orders = await request<ReportListApi | ApiReport[]>(`orders${q}`);
  const orderRows = Array.isArray(orders) ? orders : orders.data;
  const details = await Promise.all(orderRows.map((order) => request<ApiReport>(`orders/${order.id}`)));
  let data = details.map((order) => mapOrderAsReport(order));
  if (filters?.status && filters.status !== 'All') data = data.filter((report) => report.status === filters.status);
  if (filters?.patientId) data = data.filter((report) => report.patientId === filters.patientId);
  if (filters?.testId) data = data.filter((report) => (report as any).testIds?.includes(filters.testId));
  return { data, pagination: Array.isArray(orders) ? undefined : orders.pagination };
}

export async function getReport(id: string): Promise<LabReport> { return mapOrderAsReport(await request<ApiReport>(`orders/${id}`)); }

/** Creates exactly one LabOrder containing all selected tests, then writes all test results into that order. */
export async function createCombinedReport(body: CombinedReportBody): Promise<LabReport> {
  const patient = await ensurePatient(body);
  const testIds = [...new Set((body.testIds ?? []).map((id) => id.trim()).filter(Boolean))];
  if (!testIds.length) throw new Error('Please select at least one configured laboratory test.');

  const order = await request<ApiReport>('orders', { method: 'POST', body: JSON.stringify({ patientId: patient.id, testIds, referredBy: body.referredBy, clinicalNotes: body.interpretation }) });
  const samples = await request<ApiReport[]>(`samples/orders/${order.id}`, { method: 'POST', body: JSON.stringify({}) });
  for (const sample of samples) {
    await request<ApiReport>(`samples/${sample.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'COLLECTED' }) });
    await request<ApiReport>(`samples/${sample.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'RECEIVED' }) });
    await request<ApiReport>(`samples/${sample.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'PROCESSING' }) });
    await request<ApiReport>(`samples/${sample.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED' }) });
  }

  const allResults = testIds.flatMap((testId) => (body.parametersByTest?.[testId] ?? []).map((parameter) => ({ parameter, testId })));
  const testCache = new Map<string, any>();
  for (const testId of testIds) testCache.set(testId, await testsService.getTest(testId));
  const results = allResults.map(({ testId, parameter }) => {
    const test = testCache.get(testId);
    const apiParameter = test?.parameters?.find((item: any) => item.name?.toLowerCase() === parameter.name.toLowerCase());
    return apiParameter && String(parameter.value ?? '').trim() ? { parameterId: apiParameter.id, value: String(parameter.value).trim() } : null;
  }).filter(Boolean);

  if (results.length) await request<ApiReport>(`orders/${order.id}/results`, { method: 'PATCH', body: JSON.stringify({ results }) });

  if (body.status === 'Completed' || body.status === 'Critical') {
    await request<ApiReport>(`orders/${order.id}/verify`, { method: 'POST' });
    await request<ApiReport>(`orders/${order.id}/finalize`, { method: 'POST' });
    return mapFinalReport(await request<ApiReport>(`orders/${order.id}/report`));
  }

  return mapOrderAsReport(await request<ApiReport>(`orders/${order.id}`));
}

export async function createReport(body: Partial<LabReport>): Promise<LabReport> { return createCombinedReport(body); }
export async function updateReport(id: string, body: Partial<LabReport>): Promise<LabReport> {
  const patientId = (body as any).patientId; if (patientId) await patientsService.updatePatient(patientId, toPatientPayload(body));
  const testId = requireTestId(body); const test = await testsService.getTest(testId);
  const updated = await request<ApiReport>(`reports/${id}`, { method: 'PATCH', body: JSON.stringify({ referredBy: body.referredBy, sampleCollectedAt: toIso(body.dateCollected), doctorNotes: body.interpretation, remarks: body.status === 'Critical' ? 'Critical result review required' : undefined, results: toApiResults(body.parameters ?? [], test.parameters ?? []) }) });
  if (body.status === 'Completed' || body.status === 'Critical') return finalizeReport(id); return mapApiReport(updated);
}
export function deleteReport(id: string) { return request<ApiReport>(`reports/${id}`, { method: 'DELETE' }); }
export async function generateReport(id: string): Promise<LabReport> { return mapGeneratedReport(await request<ApiReport>(`reports/${id}/generate`)); }
export async function finalizeReport(id: string): Promise<LabReport> { return mapApiReport(await request<ApiReport>(`reports/${id}/finalize`, { method: 'POST' })); }

export async function downloadReportPdf(id: string, fileName?: string, template: ReportTemplateId = getSavedReportTemplate()) {
  const base = (await import('./api')).default.API_BASE;
  let response = await fetch(`${base}/orders/${id}/report/pdf`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) response = await fetch(`${base}/reports/${id}/pdf?template=${encodeURIComponent(template)}`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) throw new Error('Failed to download PDF');
  const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName || `report-${id}-${template}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
}

export async function openReportPdf(id: string, template: ReportTemplateId = getSavedReportTemplate()) {
  const base = (await import('./api')).default.API_BASE;
  let response = await fetch(`${base}/orders/${id}/report/pdf`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) response = await fetch(`${base}/reports/${id}/pdf?template=${encodeURIComponent(template)}`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) throw new Error('Failed to generate PDF');
  const blob = await response.blob(); const url = window.URL.createObjectURL(blob); window.open(url, '_blank', 'noopener,noreferrer'); setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}

function mapApiReport(report: ApiReport): LabReport { const resultByParameterId = new Map((report.results ?? []).map((result: any) => [result.parameterId, result])); const parametersSource = report.test?.parameters?.length ? report.test.parameters : (report.results ?? []).map((result: any) => result.parameter); const parameters = parametersSource.map((parameter: any) => mapParameter(parameter, resultByParameterId.get(parameter.id))); return { id: report.id, patientName: report.patient?.name ?? 'Unknown patient', age: report.patient?.age ?? 0, gender: mapGenderFromApi(report.patient?.gender), phone: report.patient?.mobile ?? '', email: report.patient?.email ?? '', referredBy: report.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(report.sampleCollectedAt ?? report.createdAt), dateReported: toDateTimeLocal(report.reportedAt ?? report.updatedAt ?? report.createdAt), testType: report.test?.name ?? 'Diagnostic Test', status: mapReportStatus(report.status, parameters), parameters, interpretation: report.doctorNotes ?? report.remarks ?? '', ...(report.reportNumber ? { reportNumber: report.reportNumber } : {}), ...(report.patientId ? { patientId: report.patientId } : {}), ...(report.testId ? { testId: report.testId } : {}) } as LabReport; }
function mapGeneratedReport(data: ApiReport): LabReport { const parameters = (data.results ?? []).map((result: any) => mapParameter({ id: result.parameterId, name: result.name, unit: result.unit, normalMin: result.normalMin, normalMax: result.normalMax, referenceRange: result.referenceRange, inputType: result.inputType, options: result.options, decimalPlaces: result.decimalPlaces, isRequired: result.isRequired, criticalLow: result.criticalLow, criticalHigh: result.criticalHigh, formula: result.formula }, result)); return { id: data.report?.id, patientName: data.patient?.name ?? 'Unknown patient', age: data.patient?.age ?? 0, gender: mapGenderFromApi(data.patient?.gender), phone: data.patient?.mobile ?? '', email: data.patient?.email ?? '', referredBy: data.report?.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(data.report?.sampleCollectedAt ?? data.report?.createdAt), dateReported: toDateTimeLocal(data.report?.reportedAt ?? data.report?.createdAt), testType: data.test?.name ?? 'Diagnostic Test', status: mapReportStatus(data.report?.status, parameters), parameters, interpretation: data.report?.doctorNotes ?? data.report?.remarks ?? '', reportNumber: data.report?.reportNumber, patientId: data.patient?.id, testId: data.test?.id } as LabReport; }
function mapFinalReport(data: ApiReport): LabReport { const tests = data.order?.tests ?? []; const parameters: TestParameter[] = tests.flatMap((item: any) => (item.parameters ?? []).map((parameter: any) => ({ name: `${item.test?.name ?? 'Test'} — ${parameter.name ?? 'Parameter'}`, value: parameter.value ?? '', unit: parameter.unit ?? '', refRange: formatRange(parameter), minRef: parameter.normalMin ?? undefined, maxRef: parameter.normalMax ?? undefined, status: mapFlag(parameter.flag), inputType: parameter.inputType, required: true } as TestParameter))); return { id: data.order?.id, patientName: data.order?.patient?.name ?? 'Unknown patient', age: data.order?.patient?.age ?? 0, gender: mapGenderFromApi(data.order?.patient?.gender), phone: data.order?.patient?.mobile ?? '', email: data.order?.patient?.email ?? '', referredBy: data.order?.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(data.order?.samples?.[0]?.collectedAt ?? data.order?.orderedAt), dateReported: toDateTimeLocal(data.finalizedAt ?? data.order?.orderedAt), testType: tests.map((item: any) => item.test?.name).filter(Boolean).join(' + ') || 'Diagnostic Test', status: mapFinalStatus(tests), parameters, interpretation: data.order?.clinicalNotes ?? '', reportNumber: data.reportNumber, patientId: data.order?.patient?.id, orderId: data.order?.id } as LabReport & { orderId: string }; }

function mapOrderAsReport(order: ApiReport): LabReport {
  const items = order.items ?? [];
  const parameters: TestParameter[] = items.flatMap((item: any) => {
    const resultByParameterId = new Map((item.results ?? []).map((result: any) => [result.parameterId, result]));
    return (item.test?.parameters ?? []).map((p: any) => mapParameter(p, resultByParameterId.get(p.id)));
  });
  const status = mapOrderStatus(order.status, parameters);
  const testNames = items.map((item: any) => item.test?.name).filter(Boolean);
  return {
    id: order.id,
    patientName: order.patient?.name ?? 'Unknown patient',
    age: order.patient?.age ?? 0,
    gender: mapGenderFromApi(order.patient?.gender),
    phone: order.patient?.mobile ?? '',
    email: order.patient?.email ?? '',
    referredBy: order.referredBy ?? 'Dr. Self / Walk-in',
    dateCollected: toDateTimeLocal(order.samples?.[0]?.collectedAt ?? order.createdAt),
    dateReported: toDateTimeLocal(order.updatedAt ?? order.createdAt),
    testType: testNames.join(' + ') || 'Diagnostic Test',
    status,
    parameters,
    interpretation: order.clinicalNotes ?? '',
    reportNumber: order.orderNumber,
    patientId: order.patient?.id,
    orderId: order.id,
    testIds: items.map((item: any) => item.testId),
  } as LabReport & { orderId: string; testIds: string[] };
}

function mapOrderStatus(status: string | undefined, parameters: TestParameter[]): LabReport['status'] {
  if (status === 'FINAL') return parameters.some((p) => p.status === 'High' || p.status === 'Low' || p.status === 'Abnormal') ? 'Critical' : 'Completed';
  if (status === 'VERIFIED') return parameters.some((p) => p.status === 'High' || p.status === 'Low' || p.status === 'Abnormal') ? 'Critical' : 'Completed';
  if (status === 'RESULT_ENTERED') return 'Pending';
  if (status === 'SAMPLE_COLLECTED' || status === 'REGISTERED') return 'Pending';
  if (status === 'CANCELLED') return 'Draft';
  return 'Draft';
}

function mapOrderAsDraft(order: ApiReport, testCache: Map<string, any>): LabReport { return mapOrderAsReport({ ...order, items: (order.items ?? []).map((item: any) => ({ ...item, test: item.test ?? testCache.get(item.testId) })) }); }
async function ensurePatient(report: Partial<LabReport>) { const patientId = (report as any).patientId; if (patientId) return patientsService.updatePatient(patientId, toPatientPayload(report)); const search = report.phone || report.patientName || ''; const existing = search ? await patientsService.listPatients(search).catch(() => []) : []; const match = Array.isArray(existing) ? existing.find((patient) => patient.mobile === report.phone && patient.name?.toLowerCase() === report.patientName?.toLowerCase()) : null; if (match) return patientsService.updatePatient(match.id, toPatientPayload(report)); return patientsService.createPatient(toPatientPayload(report)); }
function requireTestId(report: Partial<LabReport>): string { const testId = (report as LabReport & { testId?: string }).testId; if (!testId?.trim()) throw new Error('Please select a configured laboratory test from the Test Catalog.'); return testId; }
function toPatientPayload(report: Partial<LabReport>) { return { name: report.patientName, age: report.age, gender: mapGenderToApi(report.gender), mobile: report.phone, email: report.email || undefined }; }
function toApiResults(parameters: TestParameter[], apiParameters: any[]) { return parameters.map((parameter) => { const apiParameter = apiParameters.find((item: any) => item.name?.toLowerCase() === parameter.name.toLowerCase()); return apiParameter && parameter.value?.trim() ? { parameterId: apiParameter.id, value: parameter.value.trim() } : null; }).filter(Boolean); }
function mapParameter(parameter: any, result: any): TestParameter { return { name: parameter?.name ?? result?.name ?? 'Parameter', value: result?.value ?? '', unit: parameter?.unit ?? result?.unit ?? '', refRange: formatRange(parameter ?? result), minRef: parameter?.normalMin ?? result?.normalMin ?? undefined, maxRef: parameter?.normalMax ?? result?.normalMax ?? undefined, inputType: parameter?.inputType ?? result?.inputType, options: normalizeOptions(parameter?.options ?? result?.options), status: mapFlag(result?.flag), validation: parameter?.validation ?? result?.validation, decimalPlaces: parameter?.decimalPlaces ?? result?.decimalPlaces, required: parameter?.isRequired ?? result?.isRequired } as TestParameter; }
function normalizeOptions(value: unknown): string[] | undefined { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined; }
function mapReportStatus(status: string | undefined, parameters: TestParameter[]): LabReport['status'] { if (status !== 'FINAL') return 'Draft'; return parameters.some((parameter) => parameter.status === 'High' || parameter.status === 'Low' || parameter.status === 'Abnormal') ? 'Critical' : 'Completed'; }
function mapFinalStatus(tests: any[]): LabReport['status'] { return tests.some((item: any) => (item.parameters ?? []).some((p: any) => p.flag === 'HIGH' || p.flag === 'LOW')) ? 'Critical' : 'Completed'; }
function mapFlag(flag: string | null | undefined): TestParameter['status'] { if (flag === 'HIGH') return 'High'; if (flag === 'LOW') return 'Low'; if (flag === 'NORMAL') return 'Normal'; return 'Normal'; }
function mapGenderToApi(gender?: string) { if (gender === 'Female') return 'FEMALE'; if (gender === 'Other') return 'OTHER'; return 'MALE'; }
function mapGenderFromApi(gender?: string): LabReport['gender'] { if (gender === 'FEMALE') return 'Female'; if (gender === 'OTHER') return 'Other'; return 'Male'; }
function formatRange(parameter: any) { const ref = parameter?.referenceRange; if (ref && typeof ref === 'object' && !Array.isArray(ref)) return Object.entries(ref as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`).join(' · '); const min=parameter?.normalMin; const max=parameter?.normalMax; if(min!=null&&max!=null)return `${min} - ${max}`; if(min!=null)return `>= ${min}`; if(max!=null)return `<= ${max}`; return 'Clinical reference'; }
function toDateTimeLocal(value?: string | Date | null) { const date = value ? new Date(value) : new Date(); if (Number.isNaN(date.getTime())) return ''; const pad=(n:number)=>String(n).padStart(2,'0'); return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
function toIso(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString(); }
export default { listReports, createReport, createCombinedReport, getReport, updateReport, deleteReport, generateReport, finalizeReport, downloadReportPdf, openReportPdf, listReportTemplates, getSavedReportTemplate, saveReportTemplate };

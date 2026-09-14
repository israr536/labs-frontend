import { DEFAULT_SETTINGS, type LabReport, type LabSettings, type TestParameter } from '../data/samples';
import { generateReportPdf } from '../utils/pdfGenerator';
import { request } from './api';
import labsService from './labsService';
import patientsService from './patientsService';
import testsService from './testsService';

type ApiReport = Record<string, any>;
type ReportListApi = { data: ApiReport[]; pagination?: any };
export type ReportTemplateId = 'classic' | 'modern' | 'compact' | 'detailed' | 'premium' | 'minimal';
export type ReportTemplate = { id: ReportTemplateId; name: string; description: string };
type CombinedReportBody = Partial<LabReport> & { testIds?: string[]; parametersByTest?: Record<string, TestParameter[]> };
type ReportParameter = TestParameter & { testName?: string; testCode?: string; category?: string; sampleType?: string; method?: string };

export async function listReportTemplates(): Promise<ReportTemplate[]> { return request<ReportTemplate[]>('reports/templates'); }
export function getSavedReportTemplate(): ReportTemplateId { try { const value = localStorage.getItem('lab_report_template'); return ['classic', 'modern', 'compact', 'detailed', 'premium', 'minimal'].includes(value || '') ? value as ReportTemplateId : 'premium'; } catch { return 'premium'; } }
export function saveReportTemplate(template: ReportTemplateId) { try { localStorage.setItem('lab_report_template', template); } catch {} }

function toDateTimeLocal(value: any): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function listReports(filters?: { status?: string; search?: string; patientId?: string; testId?: string; skip?: number; take?: number }): Promise<{ data: LabReport[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
  if (filters?.take !== undefined) params.append('take', String(filters.take));
  const q = params.toString() ? `?${params.toString()}` : '';
  const orders = await request<ReportListApi | ApiReport[]>(`orders${q}`);
  let data = (Array.isArray(orders) ? orders : orders.data).map(mapOrderAsReport);
  if (filters?.status && filters.status !== 'All') data = data.filter((report) => report.status === filters.status);
  if (filters?.patientId) data = data.filter((report) => (report as any).patientId === filters.patientId);
  if (filters?.testId) data = data.filter((report) => (report as any).testIds?.includes(filters.testId));
  return { data, pagination: Array.isArray(orders) ? undefined : orders.pagination };
}

export async function getReport(id: string): Promise<LabReport> { return mapOrderAsReport(await request<ApiReport>(`orders/${id}`)); }

export async function createCombinedReport(body: CombinedReportBody): Promise<LabReport> {
  const testIds = [...new Set((body.testIds ?? []).map((id) => id.trim()).filter(Boolean))];
  if (!testIds.length) throw new Error('Please select at least one configured laboratory test.');
  const response = await request<ApiReport>('orders/complete', {
    method: 'POST',
    body: JSON.stringify({
      patientId: (body as any).patientId,
      patient: { name: body.patientName, age: body.age, gender: mapGenderToApi(body.gender), mobile: body.phone, email: body.email || undefined },
      testIds,
      parametersByTest: body.parametersByTest ?? {},
      referredBy: body.referredBy,
      clinicalNotes: body.interpretation,
      status: body.status,
    }),
  });
  if (response?.order?.tests) return mapFinalReport(response);
  return mapOrderAsReport(response);
}

export async function createReport(body: Partial<LabReport>): Promise<LabReport> { return createCombinedReport(body); }
export async function updateReport(id: string, body: Partial<LabReport>): Promise<LabReport> {
  const patientId = (body as any).patientId;
  if (patientId) await patientsService.updatePatient(patientId, toPatientPayload(body));
  const testId = requireTestId(body);
  const test = await testsService.getTest(testId);
  const resultsPayload = { referredBy: body.referredBy, sampleCollectedAt: toIso(body.dateCollected), doctorNotes: body.interpretation, remarks: body.status === 'Critical' ? 'Critical result review required' : undefined, results: toApiResults(body.parameters ?? [], test.parameters ?? []) };
  try {
    const updated = await request<ApiReport>(`reports/${id}`, { method: 'PATCH', body: JSON.stringify(resultsPayload) });
    if (body.status === 'Completed' || body.status === 'Critical') return finalizeReport(id);
    return mapApiReport(updated);
  } catch (err: any) {
    const statusCode = err instanceof Error && 'status' in err ? (err as any).status : err?.statusCode ?? err?.status;
    if (statusCode !== 404) throw err;
    const orderId = (body as any).orderId || id;
    await request<ApiReport>(`orders/${orderId}/results`, { method: 'PATCH', body: JSON.stringify({ results: toApiResults(body.parameters ?? [], test.parameters ?? []) }) });
    if (body.status === 'Completed' || body.status === 'Critical') {
      await request<ApiReport>(`orders/${orderId}/verify`, { method: 'POST' });
      await request<ApiReport>(`orders/${orderId}/finalize`, { method: 'POST' });
      return mapFinalReport(await request<ApiReport>(`orders/${orderId}/report`));
    }
    return mapOrderAsReport(await request<ApiReport>(`orders/${orderId}`));
  }
}
export function deleteReport(id: string) { return request<ApiReport>(`reports/${id}`, { method: 'DELETE' }); }
export async function generateReport(id: string): Promise<LabReport> { return mapGeneratedReport(await request<ApiReport>(`reports/${id}/generate`)); }
export async function finalizeReport(id: string): Promise<LabReport> { return mapApiReport(await request<ApiReport>(`reports/${id}/finalize`, { method: 'POST' })); }

async function generateLocalPdf(reportId: string, template: ReportTemplateId, fileName?: string) {
  const report = await getReport(reportId);
  const settings = await labsService.getSettings().catch(() => DEFAULT_SETTINGS as LabSettings);
  const doc = generateReportPdf(report, settings, template);
  const blob = doc.output('blob');
  const url = window.URL.createObjectURL(blob);
  return { url, fileName: fileName || `report-${reportId}.pdf` };
}

export async function downloadReportPdf(id: string, fileName?: string, template: ReportTemplateId = getSavedReportTemplate()) {
  try {
    const { url, fileName: finalName } = await generateLocalPdf(id, template, fileName);
    const a = document.createElement('a'); a.href = url; a.download = finalName; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); return;
  } catch {}
  const base = (await import('./api')).default.API_BASE;
  const response = await fetch(`${base}/orders/${encodeURIComponent(id)}/report/pdf`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) throw new Error(`Failed to download PDF (${response.status})`);
  const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName || `report-${id}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
}

export async function openReportPdf(id: string, template: ReportTemplateId = getSavedReportTemplate()) {
  try { const { url } = await generateLocalPdf(id, template); window.open(url, '_blank', 'noopener,noreferrer'); setTimeout(() => window.URL.revokeObjectURL(url), 60000); return; } catch {}
  const base = (await import('./api')).default.API_BASE;
  const response = await fetch(`${base}/orders/${encodeURIComponent(id)}/report/pdf`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) throw new Error(`Failed to generate PDF (${response.status})`);
  const blob = await response.blob(); const url = window.URL.createObjectURL(blob); window.open(url, '_blank', 'noopener,noreferrer'); setTimeout(() => window.URL.revokeObjectURL(url), 60000);
}

function mapApiReport(report: ApiReport): LabReport {
  const resultByParameterId = new Map((report.results ?? []).map((result: any) => [result.parameterId, result]));
  const parametersSource = report.test?.parameters?.length ? report.test.parameters : (report.results ?? []).map((result: any) => result.parameter);
  const parameters = parametersSource.map((parameter: any) => mapParameter(parameter, resultByParameterId.get(parameter.id), report.test));
  return { id: report.id, patientName: report.patient?.name ?? 'Unknown patient', age: report.patient?.age ?? 0, gender: mapGenderFromApi(report.patient?.gender), phone: report.patient?.mobile ?? '', email: report.patient?.email ?? '', referredBy: report.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(report.sampleCollectedAt ?? report.createdAt), dateReported: toDateTimeLocal(report.reportedAt ?? report.updatedAt ?? report.createdAt), testType: report.test?.name ?? 'Diagnostic Test', status: mapReportStatus(report.status, parameters), parameters, interpretation: report.doctorNotes ?? report.remarks ?? '', ...(report.reportNumber ? { reportNumber: report.reportNumber } : {}), ...(report.patientId ? { patientId: report.patientId } : {}), ...(report.testId ? { testId: report.testId } : {}) } as LabReport;
}

function mapGeneratedReport(data: ApiReport): LabReport {
  const parameters = (data.results ?? []).map((result: any) => mapParameter({ id: result.parameterId, name: result.name, unit: result.unit, normalMin: result.normalMin, normalMax: result.normalMax, referenceRange: result.referenceRange, inputType: result.inputType, options: result.options, isRequired: result.isRequired }, result, data.test));
  return { id: data.report?.id, patientName: data.patient?.name ?? 'Unknown patient', age: data.patient?.age ?? 0, gender: mapGenderFromApi(data.patient?.gender), phone: data.patient?.mobile ?? '', email: data.patient?.email ?? '', referredBy: data.report?.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(data.report?.sampleCollectedAt ?? data.report?.createdAt), dateReported: toDateTimeLocal(data.report?.reportedAt ?? data.report?.createdAt), testType: data.test?.name ?? 'Diagnostic Test', status: mapReportStatus(data.report?.status, parameters), parameters, interpretation: data.report?.doctorNotes ?? data.report?.remarks ?? '', reportNumber: data.report?.reportNumber, patientId: data.patient?.id, testId: data.test?.id } as LabReport;
}

function mapFinalReport(data: ApiReport): LabReport {
  const tests = data.order?.tests ?? [];
  const parameters: ReportParameter[] = tests.flatMap((item: any) => (item.parameters ?? []).map((parameter: any) => ({ name: parameter.name ?? 'Parameter', value: parameter.value ?? '', unit: parameter.unit ?? '', refRange: formatRange(parameter), minRef: parameter.normalMin ?? undefined, maxRef: parameter.normalMax ?? undefined, status: mapFlag(parameter.flag, parameter.value, parameter.normalMin, parameter.normalMax), testName: item.test?.name ?? 'Test', testCode: item.test?.code, category: item.test?.category, sampleType: item.test?.sampleType, method: item.test?.method })));
  return { id: data.order?.id, patientName: data.order?.patient?.name ?? 'Unknown patient', age: data.order?.patient?.age ?? 0, gender: mapGenderFromApi(data.order?.patient?.gender), phone: data.order?.patient?.mobile ?? '', email: data.order?.patient?.email ?? '', referredBy: data.order?.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(data.order?.samples?.[0]?.collectedAt ?? data.order?.orderedAt), dateReported: toDateTimeLocal(data.finalizedAt ?? data.order?.orderedAt), testType: tests.map((item: any) => item.test?.name).filter(Boolean).join(' + ') || 'Diagnostic Test', status: mapFinalStatus(tests), parameters, interpretation: data.order?.clinicalNotes ?? '', reportNumber: data.reportNumber, patientId: data.order?.patient?.id, orderId: data.order?.id } as LabReport & { orderId: string };
}

function mapOrderAsReport(order: ApiReport): LabReport {
  const items = order.items ?? [];
  const parameters: ReportParameter[] = items.flatMap((item: any) => {
    const resultByParameterId = new Map((item.results ?? []).map((result: any) => [result.parameterId, result]));
    return (item.test?.parameters ?? []).map((parameter: any) => mapParameter(parameter, resultByParameterId.get(parameter.id), item.test));
  });
  const testNames = items.map((item: any) => item.test?.name).filter(Boolean);
  return { id: order.id, patientName: order.patient?.name ?? 'Unknown patient', age: order.patient?.age ?? 0, gender: mapGenderFromApi(order.patient?.gender), phone: order.patient?.mobile ?? '', email: order.patient?.email ?? '', referredBy: order.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(order.samples?.[0]?.collectedAt ?? order.createdAt), dateReported: toDateTimeLocal(order.updatedAt ?? order.createdAt), testType: testNames.join(' + ') || 'Diagnostic Test', status: mapOrderStatus(order.status, parameters), parameters, interpretation: order.clinicalNotes ?? '', reportNumber: order.orderNumber, patientId: order.patient?.id, orderId: order.id, testIds: items.map((item: any) => item.testId) } as LabReport & { orderId: string; testIds: string[] };
}

function mapParameter(parameter: any, result: any, test?: any): ReportParameter {
  return { name: parameter?.name ?? '', value: result?.value ?? '', unit: parameter?.unit ?? '', refRange: formatRange(parameter), minRef: parameter?.normalMin ?? undefined, maxRef: parameter?.normalMax ?? undefined, status: mapFlag(result?.flag, result?.value, parameter?.normalMin, parameter?.normalMax), inputType: parameter?.inputType, required: parameter?.isRequired ?? true, testName: test?.name, testCode: test?.code, category: test?.category, sampleType: test?.sampleType, method: test?.method } as ReportParameter;
}
function mapOrderStatus(status: string | undefined, parameters: TestParameter[]): LabReport['status'] { if (status === 'FINAL' || status === 'VERIFIED') return parameters.some((p) => p.status !== 'Normal') ? 'Critical' : 'Completed'; if (status === 'RESULT_ENTERED' || status === 'SAMPLE_COLLECTED' || status === 'REGISTERED') return 'Pending'; if (status === 'CANCELLED') return 'Draft'; return 'Draft'; }
function mapReportStatus(status: any, parameters: TestParameter[]): LabReport['status'] { if (status === 'FINAL') return parameters.some((p) => p.status !== 'Normal') ? 'Critical' : 'Completed'; if (status === 'RESULT_ENTERED' || status === 'VERIFIED') return status === 'VERIFIED' ? 'Completed' : 'Pending'; return 'Draft'; }
function mapFinalStatus(tests: any[]): LabReport['status'] { return tests.some((item: any) => (item.parameters ?? []).some((p: any) => p.flag === 'HIGH' || p.flag === 'LOW' || p.flag === 'ABNORMAL')) ? 'Critical' : 'Completed'; }
function mapFlag(flag: any, value?: unknown, minRef?: number, maxRef?: number): TestParameter['status'] {
  if (flag === 'HIGH') return 'High';
  if (flag === 'LOW') return 'Low';
  if (flag === 'ABNORMAL') return 'Abnormal';
  if (flag === 'NORMAL') return 'Normal';
  const numericValue = Number(value);
  if (value !== undefined && value !== null && String(value).trim() !== '' && Number.isFinite(numericValue)) {
    if (minRef !== undefined && numericValue < minRef) return 'Low';
    if (maxRef !== undefined && numericValue > maxRef) return 'High';
  }
  return 'Normal';
}
function formatRange(parameter: any): string { if (parameter?.referenceRange) return typeof parameter.referenceRange === 'string' ? parameter.referenceRange : JSON.stringify(parameter.referenceRange); if (parameter?.normalMin !== undefined && parameter?.normalMax !== undefined) return `${parameter.normalMin} - ${parameter.normalMax}`; if (parameter?.normalMin !== undefined) return `>= ${parameter.normalMin}`; if (parameter?.normalMax !== undefined) return `<= ${parameter.normalMax}`; return ''; }
function mapGenderFromApi(value: any): LabReport['gender'] { return value === 'MALE' ? 'Male' : value === 'FEMALE' ? 'Female' : 'Other'; }
function mapGenderToApi(value: any): 'MALE' | 'FEMALE' | 'OTHER' { return value === 'Male' ? 'MALE' : value === 'Female' ? 'FEMALE' : 'OTHER'; }
function toPatientPayload(report: Partial<LabReport>) { return { name: report.patientName, age: report.age, gender: mapGenderToApi(report.gender), mobile: report.phone, email: report.email || undefined }; }
function requireTestId(report: Partial<LabReport>): string { const testId = (report as LabReport & { testId?: string }).testId; if (!testId?.trim()) throw new Error('Please select a configured laboratory test from the Test Catalog.'); return testId; }
function toApiResults(parameters: TestParameter[], apiParameters: any[]) { return parameters.map((parameter) => { const apiParameter = apiParameters.find((item: any) => item.name?.toLowerCase() === parameter.name.toLowerCase()); return apiParameter && parameter.value?.trim() ? { parameterId: apiParameter.id, value: parameter.value.trim() } : null; }).filter(Boolean); }
function toIso(value: any): string | undefined { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString(); }

const reportsService = { listReportTemplates, getSavedReportTemplate, saveReportTemplate, listReports, getReport, createCombinedReport, createReport, updateReport, deleteReport, generateReport, finalizeReport, downloadReportPdf, openReportPdf };
export default reportsService;

import { DEFAULT_SETTINGS, type LabReport, type LabSettings, type TestParameter } from '../data/samples';
import { request } from './api';
import labsService from './labsService';

type ApiReport = Record<string, any>;
type ReportListApi = { data: ApiReport[]; pagination?: any };
export type ReportTemplateId = 'classic' | 'modern' | 'compact' | 'detailed' | 'premium' | 'minimal';
export type ReportTemplate = { id: ReportTemplateId; name: string; description: string };
type CombinedReportBody = Partial<LabReport> & { testIds?: string[]; parametersByTest?: Record<string, TestParameter[]> };
type ReportParameter = TestParameter & { testName?: string; testCode?: string; category?: string; sampleType?: string; method?: string };

let reportPdfCache = new Map<string, { report: LabReport; settings: LabSettings; expiresAt: number }>();
const REPORT_PDF_CACHE_TTL = 30_000;

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
  if (filters?.status && filters.status !== 'All') params.append('status', filters.status === 'Completed' || filters.status === 'Critical' ? 'FINAL' : filters.status === 'Pending' ? 'RESULT_ENTERED' : 'REGISTERED');
  if (filters?.patientId) params.append('patientId', filters.patientId);
  if (filters?.testId) params.append('testId', filters.testId);
  if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
  if (filters?.take !== undefined) params.append('take', String(filters.take));
  const q = params.toString() ? `?${params.toString()}` : '';
  const orders = await request<ReportListApi | ApiReport[]>(`orders${q}`);
  const data = (Array.isArray(orders) ? orders : orders.data).map(mapOrderAsReport);
  return { data, pagination: Array.isArray(orders) ? undefined : orders.pagination };
}

export async function getReport(id: string): Promise<LabReport> { return mapOrderAsReport(await request<ApiReport>(`orders/${id}`)); }

export async function createCombinedReport(body: CombinedReportBody): Promise<LabReport> {
  const testIds = [...new Set((body.testIds ?? []).map((id) => id.trim()).filter(Boolean))];
  if (!testIds.length) throw new Error('Please select at least one configured laboratory test.');
  const idempotencyKey = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const response = await request<ApiReport>('orders/complete', { method: 'POST', timeout: 90000, headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ patientId: (body as any).patientId, patient: { name: body.patientName, age: body.age, gender: mapGenderToApi(body.gender), mobile: body.phone, email: body.email || undefined }, testIds, parametersByTest: body.parametersByTest ?? {}, referredBy: body.referredBy, clinicalNotes: body.interpretation, status: body.status }) });
  if (response?.finalReport) return mapFinalReport(response.finalReport);
  if (response?.order?.tests) return mapFinalReport(response);
  return mapOrderAsReport(response);
}

export async function createReport(body: Partial<LabReport>): Promise<LabReport> { return createCombinedReport(body); }
export async function updateReport(id: string, body: Partial<LabReport>): Promise<LabReport> {
  const orderId = (body as any).orderId || id;
  const order = await request<ApiReport>(`orders/${encodeURIComponent(orderId)}`);
  const testId = requireTestId(body);
  const item = (order.items ?? []).find((candidate: any) => candidate.testId === testId) ?? order.items?.[0];
  const results = toApiResults(body.parameters ?? [], item?.test?.parameters ?? []);
  const response = await request<ApiReport>(`orders/${encodeURIComponent(orderId)}/report`, {
    method: 'PATCH',
    body: JSON.stringify({ revision: order.revision, patient: toPatientPayload(body), referredBy: body.referredBy, clinicalNotes: body.interpretation, status: body.status, results }),
  });
  return response?.order?.tests ? mapFinalReport(response) : mapOrderAsReport(response);
}
export function deleteReport(id: string) { return request<ApiReport>(`reports/${id}`, { method: 'DELETE' }); }
export async function generateReport(id: string): Promise<LabReport> { return mapGeneratedReport(await request<ApiReport>(`reports/${id}/generate`)); }
export async function finalizeReport(id: string): Promise<LabReport> { return mapApiReport(await request<ApiReport>(`reports/${id}/finalize`, { method: 'POST' })); }

async function getPdfInputs(reportId: string) {
  const now = Date.now();
  const cached = reportPdfCache.get(reportId);
  if (cached && cached.expiresAt > now) return cached;

  const [finalizedResult, settings] = await Promise.all([
    request<ApiReport>(`orders/${reportId}/report`).catch(() => null),
    labsService.getSettings().catch(() => DEFAULT_SETTINGS as LabSettings),
  ]);

  // FinalReport is the preferred immutable print snapshot. Some older/legacy
  // responses can still arrive in the normal order shape, so only trust the
  // snapshot when it actually contains tests and result parameters.
  let report: LabReport | null = null;
  if (finalizedResult) {
    const candidate = mapFinalReport(finalizedResult);
    if (candidate.parameters.length > 0 || Array.isArray(finalizedResult.order?.tests) || Array.isArray(finalizedResult.order?.items)) {
      report = candidate;
    }
  }

  // /orders/:id is the compatibility fallback for draft/legacy orders and for
  // finalized records whose snapshot is unavailable. It is mapped from items[]
  // and therefore preserves parameter definitions + saved result values.
  if (!report) report = await getReport(reportId);

  const entry = { report, settings, expiresAt: now + REPORT_PDF_CACHE_TTL };
  reportPdfCache.set(reportId, entry);
  return entry;
}

async function generateLocalPdf(reportId: string, template: ReportTemplateId, fileName?: string) {
  const { report, settings } = await getPdfInputs(reportId);
  const { generateReportPdf } = await import('../utils/pdfGenerator');
  const started = performance.now();
  const doc = generateReportPdf(report, settings, template);
  const blob = doc.output('blob');
  console.info(`[PDF] generated ${reportId} in ${Math.round(performance.now() - started)}ms`);
  const url = window.URL.createObjectURL(blob);
  return { url, fileName: fileName || `report-${reportId}.pdf` };
}

export async function downloadReportPdf(id: string, fileName?: string, template: ReportTemplateId = getSavedReportTemplate()) {
  const { url, fileName: finalName } = await generateLocalPdf(id, template, fileName);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser time to start the download before revoking the blob URL.
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}

export async function openReportPdf(id: string, template: ReportTemplateId = getSavedReportTemplate()) {
  // Open the tab synchronously from the user click. Browsers can block a
  // window.open() that happens only after async API/PDF work completes.
  const popup = window.open('about:blank', '_blank');
  try {
    const { url } = await generateLocalPdf(id, template);

    if (popup && !popup.closed) {
      popup.location.href = url;
    } else {
      // Graceful fallback when the browser blocks popups.
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener,noreferrer';
      link.click();
    }

    setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    throw error;
  }
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

export function mapFinalReport(data: ApiReport): LabReport {
  const order = data.order ?? {};
  const items = Array.isArray(order.tests)
    ? order.tests
    : Array.isArray(order.items)
      ? order.items
      : [];

  // FinalReport snapshots normally expose tests[].parameters[].value.
  // Legacy order responses expose items[].test.parameters[] + items[].results[].
  const tests = items.map((item: any) => {
    if (Array.isArray(order.tests)) return item;

    const resultByParameterId = new Map(
      (item.results ?? []).map((result: any) => [result.parameterId, result]),
    );

    return {
      orderItemId: item.id,
      test: item.test,
      parameters: (item.test?.parameters ?? []).map((parameter: any) => {
        const result = resultByParameterId.get(parameter.id);
        return {
          parameterId: parameter.id,
          name: parameter.name,
          value: result?.value ?? null,
          unit: result?.referenceRangeSnapshot?.unit ?? parameter.unit,
          referenceRange: result?.referenceRangeSnapshot ?? parameter.referenceRange,
          referenceRangeId: result?.referenceRangeId ?? null,
          referenceRangeVersion: result?.referenceRangeSnapshot?.version ?? null,
          normalMin: result?.referenceRangeSnapshot?.low ?? parameter.normalMin,
          normalMax: result?.referenceRangeSnapshot?.high ?? parameter.normalMax,
          flag: result?.flag ?? null,
          displayOrder: parameter.displayOrder,
          remarks: parameter.remarks,
        };
      }),
    };
  });

  const parameters: ReportParameter[] = tests.flatMap((item: any) =>
    (item.parameters ?? []).map((parameter: any) => ({
      name: parameter.name ?? 'Parameter',
      value: parameter.value ?? '',
      unit: parameter.unit ?? '',
      refRange: formatRange(parameter),
      minRef: parameter.normalMin ?? undefined,
      maxRef: parameter.normalMax ?? undefined,
      status: mapFlag(parameter.flag, parameter.value, parameter.normalMin, parameter.normalMax),
      testName: item.test?.name ?? 'Test',
      testCode: item.test?.code,
      category: item.test?.category,
      sampleType: item.test?.sampleType,
      method: item.test?.method,
    })),
  );

  return {
    id: order.id,
    patientName: order.patient?.name ?? 'Unknown patient',
    age: order.patient?.age ?? 0,
    gender: mapGenderFromApi(order.patient?.gender),
    phone: order.patient?.mobile ?? '',
    email: order.patient?.email ?? '',
    referredBy: order.referredBy ?? 'Dr. Self / Walk-in',
    dateCollected: toDateTimeLocal(order.samples?.[0]?.collectedAt ?? order.orderedAt ?? order.createdAt),
    dateReported: toDateTimeLocal(data.finalizedAt ?? order.orderedAt ?? order.updatedAt ?? order.createdAt),
    testType: tests.map((item: any) => item.test?.name).filter(Boolean).join(' + ') || 'Diagnostic Test',
    status: mapFinalStatus(tests),
    parameters,
    interpretation: order.clinicalNotes ?? '',
    reportNumber: data.reportNumber ?? order.orderNumber,
    patientId: order.patient?.id,
    orderId: order.id,
  } as LabReport & { orderId: string };
}

export function mapOrderAsReport(order: ApiReport): LabReport {
  const items = order.items ?? [];
  const parameters: ReportParameter[] = items.flatMap((item: any) => {
    const resultByParameterId = new Map((item.results ?? []).map((result: any) => [result.parameterId, result]));
    return (item.test?.parameters ?? []).map((parameter: any) => mapParameter(parameter, resultByParameterId.get(parameter.id), item.test));
  });
  const testNames = items.map((item: any) => item.test?.name).filter(Boolean);
  return { id: order.id, patientName: order.patient?.name ?? 'Unknown patient', age: order.patient?.age ?? 0, gender: mapGenderFromApi(order.patient?.gender), phone: order.patient?.mobile ?? '', email: order.patient?.email ?? '', referredBy: order.referredBy ?? 'Dr. Self / Walk-in', dateCollected: toDateTimeLocal(order.samples?.[0]?.collectedAt ?? order.createdAt), dateReported: toDateTimeLocal(order.updatedAt ?? order.createdAt), testType: testNames.join(' + ') || 'Diagnostic Test', status: mapOrderStatus(order.status, parameters), interpretation: order.clinicalNotes ?? '', reportNumber: order.orderNumber, patientId: order.patient?.id, orderId: order.id, testIds: items.map((item: any) => item.testId) } as unknown as LabReport & { orderId: string; testIds: string[] };
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

const reportsService = { listReportTemplates, getSavedReportTemplate, saveReportTemplate, listReports, getReport, createCombinedReport, createReport, updateReport, deleteReport, generateReport, finalizeReport, downloadReportPdf, openReportPdf };
export default reportsService;

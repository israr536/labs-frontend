import type { LabReport, TestParameter } from '../data/samples';
import { request } from './api';
import patientsService from './patientsService';
import testsService from './testsService';

type ApiReport = Record<string, any>;

export async function listReports(filters?: { status?: string; search?: string; patientId?: string; testId?: string; skip?: number; take?: number }): Promise<{ data: LabReport[]; pagination?: any }> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.patientId) params.append('patientId', filters.patientId);
  if (filters?.testId) params.append('testId', filters.testId);
  if (filters?.skip !== undefined) params.append('skip', String(filters.skip));
  if (filters?.take !== undefined) params.append('take', String(filters.take));
  const q = params.toString() ? `?${params.toString()}` : '';
  const data = await request(`reports${q}`);
  if (data?.data && Array.isArray(data.data)) return { data: data.data.map(mapApiReport), pagination: data.pagination };
  return { data: Array.isArray(data) ? data.map(mapApiReport) : [] };
}

export async function getReport(id: string): Promise<LabReport> { return mapApiReport(await request(`reports/${id}`)); }

export async function createReport(body: Partial<LabReport>): Promise<LabReport> {
  const patient = await ensurePatient(body);
  const testId = requireTestId(body);
  const test = await testsService.getTest(testId);
  const created = await request('reports', {
    method: 'POST',
    body: JSON.stringify({
      patientId: patient.id,
      testId: test.id,
      referredBy: body.referredBy,
      sampleCollectedAt: toIso(body.dateCollected),
      doctorNotes: body.interpretation,
      remarks: body.status === 'Critical' ? 'Critical result review required' : undefined,
      results: toApiResults(body.parameters ?? [], test.parameters ?? []),
    }),
  });
  if (body.status === 'Completed' || body.status === 'Critical') return finalizeReport(created.id);
  return mapApiReport(created);
}

export async function updateReport(id: string, body: Partial<LabReport>): Promise<LabReport> {
  const patientId = (body as any).patientId;
  if (patientId) await patientsService.updatePatient(patientId, toPatientPayload(body));
  const testId = requireTestId(body);
  const test = await testsService.getTest(testId);
  const updated = await request(`reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      referredBy: body.referredBy,
      sampleCollectedAt: toIso(body.dateCollected),
      doctorNotes: body.interpretation,
      remarks: body.status === 'Critical' ? 'Critical result review required' : undefined,
      results: toApiResults(body.parameters ?? [], test.parameters ?? []),
    }),
  });
  if (body.status === 'Completed' || body.status === 'Critical') return finalizeReport(id);
  return mapApiReport(updated);
}

export function deleteReport(id: string) { return request(`reports/${id}`, { method: 'DELETE' }); }
export async function generateReport(id: string): Promise<LabReport> { return mapGeneratedReport(await request(`reports/${id}/generate`)); }
export async function finalizeReport(id: string): Promise<LabReport> { return mapApiReport(await request(`reports/${id}/finalize`, { method: 'POST' })); }

export async function downloadReportPdf(id: string, fileName?: string) {
  const response = await fetch(`${(await import('./api')).default.API_BASE}/reports/${id}/pdf`, { headers: { Authorization: `Bearer ${localStorage.getItem('lab_access_token')}` } });
  if (!response.ok) throw new Error('Failed to download PDF');
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName || `report-${id}.pdf`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
}

function mapApiReport(report: ApiReport): LabReport {
  const resultByParameterId = new Map((report.results ?? []).map((result: any) => [result.parameterId, result]));
  const parametersSource = report.test?.parameters?.length ? report.test.parameters : (report.results ?? []).map((result: any) => result.parameter);
  const parameters = parametersSource.map((parameter: any) => mapParameter(parameter, resultByParameterId.get(parameter.id)));
  return {
    id: report.id,
    patientName: report.patient?.name ?? 'Unknown patient', age: report.patient?.age ?? 0, gender: mapGenderFromApi(report.patient?.gender),
    phone: report.patient?.mobile ?? '', email: report.patient?.email ?? '', referredBy: report.referredBy ?? 'Dr. Self / Walk-in',
    dateCollected: toDateTimeLocal(report.sampleCollectedAt ?? report.createdAt), dateReported: toDateTimeLocal(report.reportedAt ?? report.updatedAt ?? report.createdAt),
    testType: report.test?.name ?? 'Diagnostic Test', status: mapReportStatus(report.status, parameters), parameters,
    interpretation: report.doctorNotes ?? report.remarks ?? '',
    ...(report.reportNumber ? { reportNumber: report.reportNumber } : {}), ...(report.patientId ? { patientId: report.patientId } : {}), ...(report.testId ? { testId: report.testId } : {}),
  } as LabReport;
}

function mapGeneratedReport(data: any): LabReport {
  const parameters = (data.results ?? []).map((result: any) => mapParameter({ id: result.parameterId, name: result.name, unit: result.unit, normalMin: result.normalMin, normalMax: result.normalMax, referenceRange: result.referenceRange, inputType: result.inputType, options: result.options, decimalPlaces: result.decimalPlaces, isRequired: result.isRequired, criticalLow: result.criticalLow, criticalHigh: result.criticalHigh, formula: result.formula }, result));
  return {
    id: data.report?.id, patientName: data.patient?.name ?? 'Unknown patient', age: data.patient?.age ?? 0, gender: mapGenderFromApi(data.patient?.gender),
    phone: data.patient?.mobile ?? '', email: data.patient?.email ?? '', referredBy: data.report?.referredBy ?? 'Dr. Self / Walk-in',
    dateCollected: toDateTimeLocal(data.report?.sampleCollectedAt ?? data.report?.createdAt), dateReported: toDateTimeLocal(data.report?.reportedAt ?? data.report?.createdAt),
    testType: data.test?.name ?? 'Diagnostic Test', status: mapReportStatus(data.report?.status, parameters), parameters,
    interpretation: data.report?.doctorNotes ?? data.report?.remarks ?? '', reportNumber: data.report?.reportNumber, patientId: data.patient?.id, testId: data.test?.id,
  } as LabReport;
}

async function ensurePatient(report: Partial<LabReport>) {
  if ((report as any).patientId) return patientsService.updatePatient((report as any).patientId, toPatientPayload(report));
  const search = report.phone || report.patientName || '';
  const existing = search ? await patientsService.listPatients(search).catch(() => []) : [];
  const match = Array.isArray(existing) ? existing.find((patient: any) => patient.mobile === report.phone && patient.name?.toLowerCase() === report.patientName?.toLowerCase()) : null;
  if (match) return patientsService.updatePatient(match.id, toPatientPayload(report));
  return patientsService.createPatient(toPatientPayload(report));
}

function requireTestId(report: Partial<LabReport>): string {
  const testId = (report as LabReport & { testId?: string }).testId;
  if (!testId?.trim()) throw new Error('Please select a configured laboratory test from the Test Catalog.');
  return testId;
}

function toPatientPayload(report: Partial<LabReport>) { return { name: report.patientName, age: report.age, gender: mapGenderToApi(report.gender), mobile: report.phone, email: report.email || undefined }; }

function toApiResults(parameters: TestParameter[], apiParameters: any[]) {
  return parameters.map((parameter) => { const apiParameter = apiParameters.find((item: any) => item.name?.toLowerCase() === parameter.name.toLowerCase()); return apiParameter && parameter.value?.trim() ? { parameterId: apiParameter.id, value: parameter.value.trim() } : null; }).filter(Boolean);
}

function mapParameter(parameter: any, result: any): TestParameter {
  return {
    name: parameter?.name ?? result?.name ?? 'Parameter', value: result?.value ?? '', unit: parameter?.unit ?? result?.unit ?? '', refRange: formatRange(parameter ?? result),
    minRef: parameter?.normalMin ?? result?.normalMin ?? undefined, maxRef: parameter?.normalMax ?? result?.normalMax ?? undefined,
    inputType: parameter?.inputType ?? result?.inputType, options: normalizeOptions(parameter?.options ?? result?.options), status: mapFlag(result?.flag),
    validation: parameter?.validation ?? result?.validation, decimalPlaces: parameter?.decimalPlaces ?? result?.decimalPlaces, required: parameter?.isRequired ?? result?.isRequired,
  } as TestParameter;
}

function normalizeOptions(value: unknown): string[] | undefined { return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined; }
function mapReportStatus(status: string | undefined, parameters: TestParameter[]): LabReport['status'] { if (status !== 'FINAL') return 'Draft'; return parameters.some((parameter) => parameter.status === 'High' || parameter.status === 'Low' || parameter.status === 'Abnormal') ? 'Critical' : 'Completed'; }
function mapFlag(flag: string | null | undefined): TestParameter['status'] { if (flag === 'HIGH') return 'High'; if (flag === 'LOW') return 'Low'; if (flag === 'NORMAL') return 'Normal'; return 'Normal'; }
function mapGenderToApi(gender?: string) { if (gender === 'Female') return 'FEMALE'; if (gender === 'Other') return 'OTHER'; return 'MALE'; }
function mapGenderFromApi(gender?: string): LabReport['gender'] { if (gender === 'FEMALE') return 'Female'; if (gender === 'OTHER') return 'Other'; return 'Male'; }
function formatRange(parameter: any) { const ref = parameter?.referenceRange; if (ref && typeof ref === 'object' && !Array.isArray(ref)) return Object.entries(ref as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`).join(' · '); const min=parameter?.normalMin; const max=parameter?.normalMax; if(min!=null&&max!=null)return `${min} - ${max}`; if(min!=null)return `>= ${min}`; if(max!=null)return `<= ${max}`; return 'Clinical reference'; }
function toDateTimeLocal(value?: string | Date | null) { const date = value ? new Date(value) : new Date(); if (Number.isNaN(date.getTime())) return ''; const pad=(n:number)=>String(n).padStart(2,'0'); return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
function toIso(value?: string) { if (!value) return undefined; const date = new Date(value); return Number.isNaN(date.getTime()) ? undefined : date.toISOString(); }

export default { listReports, getReport, createReport, updateReport, deleteReport, generateReport, finalizeReport, downloadReportPdf };

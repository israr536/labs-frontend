import type { LabReport, TestParameter } from '../data/samples';
import { request } from './api';
import patientsService from './patientsService';
import reportsService from './reportsService';

type EditableReport = Partial<LabReport> & {
  patientId?: string;
  orderId?: string;
  testIds?: string[];
  parametersByTest?: Record<string, TestParameter[]>;
};

type ApiParameter = {
  id: string;
  name?: string;
  unit?: string;
  normalMin?: number | null;
  normalMax?: number | null;
  referenceRange?: unknown;
  inputType?: TestParameter['inputType'];
  isRequired?: boolean;
  validation?: unknown;
  decimalPlaces?: number | null;
  defaultValue?: string | null;
  criticalLow?: number | null;
  criticalHigh?: number | null;
  formula?: string | null;
};

type ApiResult = { parameterId: string; value?: string; flag?: string };
type ApiOrderItem = { testId: string; test?: { parameters?: ApiParameter[] }; results?: ApiResult[] };
type ApiOrder = { id: string; items?: ApiOrderItem[] };

export async function getCombinedReportEditData(orderId: string) {
  const order = await request<ApiOrder>(`orders/${encodeURIComponent(orderId)}`);
  const items = order.items ?? [];
  const parametersByTest: Record<string, TestParameter[]> = {};

  for (const item of items) {
    const results = item.results ?? [];
    const resultByParameterId = new Map(results.map((result) => [result.parameterId, result]));
    parametersByTest[item.testId] = (item.test?.parameters ?? []).map((parameter) => {
      const result = resultByParameterId.get(parameter.id);
      const value = result?.value ?? '';
      let status: TestParameter['status'] = 'Normal';
      if (result?.flag === 'HIGH') status = 'High';
      else if (result?.flag === 'LOW') status = 'Low';
      else if (result?.flag && result.flag !== 'NORMAL') status = 'Abnormal';
      return {
        name: parameter.name ?? '', value: String(value), unit: parameter.unit ?? '', refRange: formatRange(parameter),
        minRef: parameter.normalMin ?? undefined, maxRef: parameter.normalMax ?? undefined, status,
        inputType: parameter.inputType, required: parameter.isRequired ?? true, validation: parameter.validation,
        decimalPlaces: parameter.decimalPlaces, defaultValue: parameter.defaultValue,
        criticalLow: parameter.criticalLow, criticalHigh: parameter.criticalHigh, formula: parameter.formula,
      } as TestParameter;
    });
  }

  return { order, testIds: items.map((item) => item.testId).filter(Boolean), parametersByTest };
}

/** Updates a multi-test order without issuing one GET /tests/:id request per test. */
export async function updateCombinedReport(report: EditableReport): Promise<LabReport> {
  const orderId = report.orderId || report.id;
  if (!orderId) throw new Error('Missing laboratory order ID.');

  const testIds = [...new Set((report.testIds ?? []).filter((id): id is string => typeof id === 'string' && id.trim().length > 0))];
  if (!testIds.length) throw new Error('This report does not contain any laboratory tests.');

  if (report.patientId) {
    await patientsService.updatePatient(report.patientId, {
      name: report.patientName, age: report.age, gender: normalizeGender(report.gender),
      mobile: report.phone, email: report.email || undefined,
    });
  }

  // The order payload already contains each test's parameters. Reuse it instead
  // of doing N sequential GET /tests/:id calls while saving a report.
  const order = await request<ApiOrder>(`orders/${encodeURIComponent(orderId)}`);
  const itemByTestId = new Map((order.items ?? []).map((item) => [item.testId, item]));
  const results: Array<{ parameterId: string; value: string }> = [];

  for (const testId of testIds) {
    const apiParameters = itemByTestId.get(testId)?.test?.parameters ?? [];
    const parameters = report.parametersByTest?.[testId];
    if (!parameters) continue;
    const parameterByName = new Map(apiParameters.map((item) => [item.name?.trim().toLowerCase(), item]));

    for (const parameter of parameters) {
      const value = String(parameter.value ?? '').trim();
      if (!value) continue;
      const apiParameter = parameterByName.get(parameter.name?.trim().toLowerCase());
      if (apiParameter) results.push({ parameterId: apiParameter.id, value });
    }
  }

  if (results.length) {
    await request(`orders/${encodeURIComponent(orderId)}/results`, {
      method: 'PATCH', body: JSON.stringify({ results }),
    });
  }

  if (report.status === 'Completed' || report.status === 'Critical') {
    await request(`orders/${encodeURIComponent(orderId)}/verify`, { method: 'POST' });
    await request(`orders/${encodeURIComponent(orderId)}/finalize`, { method: 'POST' });
  }

  return reportsService.getReport(orderId);
}

function normalizeGender(gender?: string): 'MALE' | 'FEMALE' | 'OTHER' {
  switch (String(gender ?? '').trim().toUpperCase()) {
    case 'FEMALE': return 'FEMALE';
    case 'OTHER': return 'OTHER';
    case 'MALE':
    default: return 'MALE';
  }
}

function formatRange(parameter: ApiParameter): string {
  if (parameter.referenceRange) return typeof parameter.referenceRange === 'string' ? parameter.referenceRange : JSON.stringify(parameter.referenceRange);
  if (parameter.normalMin !== undefined && parameter.normalMax !== undefined) return `${parameter.normalMin} - ${parameter.normalMax}`;
  if (parameter.normalMin !== undefined) return `>= ${parameter.normalMin}`;
  if (parameter.normalMax !== undefined) return `<= ${parameter.normalMax}`;
  return '';
}

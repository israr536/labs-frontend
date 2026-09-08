import type { LabReport, TestParameter } from '../data/samples';
import { request } from './api';
import patientsService from './patientsService';
import testsService from './testsService';
import reportsService from './reportsService';

type EditableReport = Partial<LabReport> & {
  patientId?: string;
  orderId?: string;
  testIds?: string[];
  parametersByTest?: Record<string, TestParameter[]>;
};

type ApiTest = { parameters?: Array<{ id: string; name: string }> };

/**
 * Updates every test in an order. The old edit flow used only testIds[0], which
 * silently dropped all other tests in a multi-test patient report.
 */
export async function updateCombinedReport(report: EditableReport): Promise<LabReport> {
  const orderId = report.orderId || report.id;
  if (!orderId) throw new Error('Missing laboratory order ID.');

  const testIds = [...new Set((report.testIds ?? []).filter((id): id is string => typeof id === 'string' && id.trim().length > 0))];
  if (!testIds.length) throw new Error('This report does not contain any laboratory tests.');

  if (report.patientId) {
    await patientsService.updatePatient(report.patientId, {
      name: report.patientName,
      age: report.age,
      gender: report.gender,
      mobile: report.phone,
      email: report.email || undefined,
    });
  }

  const results: Array<{ parameterId: string; value: string }> = [];
  for (const testId of testIds) {
    const test = await testsService.getTest(testId) as ApiTest;
    const apiParameters = test.parameters ?? [];
    const parameters = report.parametersByTest?.[testId];
    if (!parameters) continue;

    for (const parameter of parameters) {
      const value = String(parameter.value ?? '').trim();
      if (!value) continue;
      const apiParameter = apiParameters.find((item) => item.name?.toLowerCase() === parameter.name?.toLowerCase());
      if (apiParameter) results.push({ parameterId: apiParameter.id, value });
    }
  }

  if (results.length) {
    await request(`orders/${encodeURIComponent(orderId)}/results`, {
      method: 'PATCH',
      body: JSON.stringify({ results }),
    });
  }

  if (report.status === 'Completed' || report.status === 'Critical') {
    await request(`orders/${encodeURIComponent(orderId)}/verify`, { method: 'POST' });
    await request(`orders/${encodeURIComponent(orderId)}/finalize`, { method: 'POST' });
    return reportsService.getReport(orderId);
  }

  return reportsService.getReport(orderId);
}

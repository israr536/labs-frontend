import { request } from './api';

export type ParameterInputType = 'NUMBER' | 'TEXT' | 'SELECT' | 'MULTILINE_TEXT' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'TIME' | 'PERCENTAGE' | 'QUALITATIVE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface CatalogParameter {
  id: string; code?: string; name: string; shortName?: string | null; inputType: ParameterInputType;
  unit?: string | null; normalMin?: number | null; normalMax?: number | null; referenceRange?: unknown;
  options?: unknown; validation?: unknown; criticalLow?: number | null; criticalHigh?: number | null;
  decimalPlaces?: number | null; defaultValue?: string | null; formula?: string | null;
  displayOrder: number; isRequired: boolean; remarks?: string | null;
}
export interface TestCatalogDefinition { id: string; code: string; shortName?: string | null; name: string; category: string; department: string; specimenType?: string | null; container?: string | null; method?: string | null; tat?: number | null; fasting: boolean; sampleHandling?: string | null; stability?: string | null; rejectionCriteria?: string | null; description?: string | null; synonyms?: unknown; externalCodes?: unknown; parameters: CatalogParameter[]; }
export interface LabTest extends TestCatalogDefinition { catalogId?: string | null; sampleType?: string | null; price?: number | null; isActive: boolean; remarks?: string | null; parameters: CatalogParameter[]; }
export interface ReferenceRange { id: string; version: number; gender: Gender | null; ageMinYears: number | null; ageMaxYears: number | null; method: string | null; analyzer: string | null; low: number | null; high: number | null; displayRange: string | null; unit: string | null; effectiveFrom: string; effectiveTo: string | null; }
export interface LabTestUpdate { code?: string; shortName?: string | null; name?: string; category?: string | null; department?: string | null; sampleType?: string | null; price?: number | null; tat?: number | null; method?: string | null; remarks?: string | null; isActive?: boolean; }
export interface ParameterUpdate { name?: string; inputType?: ParameterInputType; unit?: string | null; normalMin?: number | null; normalMax?: number | null; referenceRange?: unknown; options?: unknown; validation?: unknown; criticalLow?: number | null; criticalHigh?: number | null; decimalPlaces?: number | null; defaultValue?: string | null; formula?: string | null; displayOrder?: number; isRequired?: boolean; remarks?: string | null; }
export interface ReferenceRangeInput { gender?: Gender | null; ageMinYears?: number | null; ageMaxYears?: number | null; method?: string | null; analyzer?: string | null; low?: number | null; high?: number | null; displayRange?: string | null; unit?: string | null; effectiveFrom?: string; }
export interface CreateTestInput { code: string; shortName?: string; name: string; category?: string; department?: string; sampleType?: string; price?: number; tat?: number; method?: string; remarks?: string; isActive?: boolean; parameters?: Array<Omit<ParameterUpdate, 'displayOrder'> & { name: string; displayOrder?: number }>; }

const testCatalogService = {
  list: (params: { search?: string; category?: string; department?: string } = {}) => { const query = new URLSearchParams(); if (params.search) query.set('search', params.search); if (params.category) query.set('category', params.category); if (params.department) query.set('department', params.department); return request<TestCatalogDefinition[]>(`test-catalog${query.toString() ? `?${query}` : ''}`); },
  categories: () => request<Array<{ category: string; department: string }>>('test-catalog/categories'),
  get: (id: string) => request<TestCatalogDefinition>(`test-catalog/${id}`),
  enable: (id: string, overrides: Partial<LabTest> = {}) => request<LabTest>(`test-catalog/${id}/enable`, { method: 'POST', body: JSON.stringify(overrides) }),
  myTests: (includeInactive = false) => request<LabTest[]>(`tests${includeInactive ? '?includeInactive=true' : ''}`),
  createTest: (body: CreateTestInput) => request<LabTest>('tests', { method: 'POST', body: JSON.stringify(body) }),
  updateTest: (id: string, body: LabTestUpdate) => request<LabTest>(`tests/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  addParameter: (testId: string, body: ParameterUpdate) => request<CatalogParameter>(`tests/${testId}/parameters`, { method: 'POST', body: JSON.stringify(body) }),
  updateParameter: (testId: string, parameterId: string, body: ParameterUpdate) => request<CatalogParameter>(`tests/${testId}/parameters/${parameterId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  removeParameter: (testId: string, parameterId: string) => request<{ success: boolean }>(`tests/${testId}/parameters/${parameterId}`, { method: 'DELETE' }),
  listReferenceRanges: (parameterId: string) => request<ReferenceRange[]>(`reference-ranges/parameters/${parameterId}`),
  createReferenceRange: (parameterId: string, body: ReferenceRangeInput) => request<ReferenceRange>(`reference-ranges/parameters/${parameterId}`, { method: 'POST', body: JSON.stringify(body) }),
};
export default testCatalogService;

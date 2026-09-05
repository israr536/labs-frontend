import { request } from './api';

export type ParameterInputType = 'NUMBER' | 'TEXT' | 'SELECT' | 'MULTILINE_TEXT' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'TIME' | 'PERCENTAGE' | 'QUALITATIVE';

export interface CatalogParameter {
  id: string;
  code: string;
  name: string;
  shortName?: string | null;
  inputType: ParameterInputType;
  unit?: string | null;
  normalMin?: number | null;
  normalMax?: number | null;
  referenceRange?: unknown;
  options?: unknown;
  validation?: unknown;
  criticalLow?: number | null;
  criticalHigh?: number | null;
  decimalPlaces?: number | null;
  defaultValue?: string | null;
  formula?: string | null;
  displayOrder: number;
  isRequired: boolean;
  remarks?: string | null;
}

export interface TestCatalogDefinition {
  id: string;
  code: string;
  shortName?: string | null;
  name: string;
  category: string;
  department: string;
  specimenType?: string | null;
  container?: string | null;
  method?: string | null;
  tat?: number | null;
  fasting: boolean;
  sampleHandling?: string | null;
  stability?: string | null;
  rejectionCriteria?: string | null;
  description?: string | null;
  synonyms?: unknown;
  externalCodes?: unknown;
  parameters: CatalogParameter[];
}

export interface LabTest {
  id: string;
  catalogId?: string | null;
  code: string;
  shortName?: string | null;
  name: string;
  category?: string | null;
  department?: string | null;
  sampleType?: string | null;
  price?: number | null;
  tat?: number | null;
  method?: string | null;
  isActive: boolean;
  parameters: CatalogParameter[];
}

const testCatalogService = {
  list: (params: { search?: string; category?: string; department?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.department) query.set('department', params.department);
    return request<TestCatalogDefinition[]>(`test-catalog${query.toString() ? `?${query}` : ''}`);
  },
  categories: () => request<Array<{ category: string; department: string }>>('test-catalog/categories'),
  get: (id: string) => request<TestCatalogDefinition>(`test-catalog/${id}`),
  enable: (id: string, overrides: Partial<LabTest> = {}) => request<LabTest>(`test-catalog/${id}/enable`, { method: 'POST', body: JSON.stringify(overrides) }),
  myTests: (includeInactive = false) => request<LabTest[]>(`tests${includeInactive ? '?includeInactive=true' : ''}`),
};

export default testCatalogService;

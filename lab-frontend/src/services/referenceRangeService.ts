import { request } from './api';

export type ReferenceRange = {
  id: string;
  parameterId: string;
  version: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  ageMinYears?: number | null;
  ageMaxYears?: number | null;
  method?: string | null;
  analyzer?: string | null;
  low?: number | null;
  high?: number | null;
  displayRange?: string | null;
  unit?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
};

const referenceRangeService = {
  list: (parameterId: string) => request<ReferenceRange[]>(`reference-ranges/parameter/${parameterId}`),
  create: (payload: Omit<ReferenceRange, 'id' | 'version'>) =>
    request<ReferenceRange>('reference-ranges', { method: 'POST', body: JSON.stringify(payload) }),
};

export default referenceRangeService;

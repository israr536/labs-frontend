import { useMemo, useState } from 'react';
import { Check, Search, TestTube2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import testCatalogService, { type LabTest, type TestCatalogDefinition } from '../services/testCatalogService';

type Props = {
  selectedIds: string[];
  onChange: (ids: string[], readyTest?: LabTest) => void;
  disabled?: boolean;
};

function asRecords(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object') as Record<string, any>[];
  if (value && typeof value === 'object' && Array.isArray((value as any).data)) return asRecords((value as any).data);
  return [];
}

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function searchableText(test: TestCatalogDefinition) {
  const synonyms = Array.isArray(test.synonyms)
    ? test.synonyms.map((item) => String(item)).join(' ')
    : typeof test.synonyms === 'string'
      ? test.synonyms
      : '';
  return normalize([test.name, test.code, test.shortName, synonyms].filter(Boolean).join(' '));
}

export default function TestCatalogPicker({ selectedIds, onChange, disabled = false }: Props) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [showDisabled, setShowDisabled] = useState(true);
  const queryClient = useQueryClient();

  const { data: catalogData, isLoading: catalogLoading, isError: catalogError } = useQuery({
    queryKey: ['test-catalog', 'order-picker'],
    queryFn: () => testCatalogService.list(),
    staleTime: 5 * 60_000,
  });

  const { data: labTestsData, isLoading: labTestsLoading } = useQuery({
    queryKey: ['tests', 'order-picker'],
    queryFn: () => testCatalogService.myTests(true),
    staleTime: 60_000,
  });

  const enableMutation = useMutation({
    mutationFn: (catalogId: string) => testCatalogService.enable(catalogId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tests', 'order-picker'] });
      void queryClient.invalidateQueries({ queryKey: ['tests'] });
      void queryClient.invalidateQueries({ queryKey: ['tests', 'new-report'] });
    },
  });

  const catalog = useMemo(() => asRecords(catalogData) as TestCatalogDefinition[], [catalogData]);
  const labTests = useMemo(() => asRecords(labTestsData) as LabTest[], [labTestsData]);

  const enabledByCode = useMemo(() => {
    const map = new Map<string, LabTest>();
    labTests.forEach((test) => {
      if (test.isActive !== false) map.set(normalize(test.code), test);
    });
    return map;
  }, [labTests]);

  const departments = useMemo(() => [...new Set(catalog.map((test) => test.department).filter(Boolean))].sort(), [catalog]);
  const categories = useMemo(() => [...new Set(catalog.map((test) => test.category).filter(Boolean))].sort(), [catalog]);

  const filtered = useMemo(() => {
    const needle = normalize(search);
    return catalog
      .filter((test) => !department || test.department === department)
      .filter((test) => !category || test.category === category)
      .filter((test) => !needle || searchableText(test).includes(needle))
      .filter((test) => showDisabled || enabledByCode.has(normalize(test.code)))
      .sort((a, b) => {
        const aEnabled = enabledByCode.has(normalize(a.code));
        const bEnabled = enabledByCode.has(normalize(b.code));
        if (aEnabled !== bEnabled) return aEnabled ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [catalog, search, department, category, showDisabled, enabledByCode]);

  async function toggle(test: TestCatalogDefinition) {
    if (disabled || enableMutation.isPending) return;
    let enabled = enabledByCode.get(normalize(test.code));
    if (!enabled) {
      try {
        enabled = await enableMutation.mutateAsync(test.id);
      } catch {
        return;
      }
    }
    const id = enabled.id;
    queryClient.setQueryData<LabTest[]>(['tests', 'new-report'], (current) => {
      const list = current ?? [];
      const existingIndex = list.findIndex((item) => item.id === enabled!.id);
      if (existingIndex >= 0) return list.map((item, index) => index === existingIndex ? enabled! : item);
      return [...list, enabled!];
    });
    onChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id], enabled);
  }

  const enabledCount = enabledByCode.size;
  const selectedCount = selectedIds.length;
  const loading = catalogLoading || labTestsLoading;

  return (
    <div className="test-catalog-picker">
      <div className="picker-summary">
        <div>
          <strong>{catalog.length.toLocaleString()} tests available</strong>
          <span>{enabledCount.toLocaleString()} configured for this lab · {selectedCount} selected</span>
        </div>
        <label className="picker-toggle">
          <input type="checkbox" checked={showDisabled} onChange={(event) => setShowDisabled(event.target.checked)} />
          Show all catalog tests
        </label>
      </div>

      <div className="picker-toolbar">
        <label className="picker-search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test name, code, short name or synonym…" />
        </label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">
          <option value="">All departments</option>
          {departments.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {loading && <div className="picker-state">Loading complete laboratory catalog…</div>}
      {catalogError && <div className="picker-state picker-error">Unable to load the laboratory test catalog.</div>}
      {enableMutation.isError && <div className="picker-state picker-error">The selected test could not be prepared. Please try again.</div>}
      {!loading && !catalogError && filtered.length === 0 && <div className="picker-state">No tests match your search and filters.</div>}

      {!loading && !catalogError && filtered.length > 0 && (
        <div className="picker-list" role="listbox" aria-label="Laboratory tests">
          {filtered.map((test) => {
            const enabled = enabledByCode.has(normalize(test.code));
            const labTest = enabledByCode.get(normalize(test.code));
            const selected = Boolean(labTest && selectedIds.includes(labTest.id));
            return (
              <button
                type="button"
                key={test.id}
                className={`picker-test ${enabled ? 'enabled' : 'disabled'} ${selected ? 'selected' : ''}`}
                onClick={() => void toggle(test)}
                disabled={disabled || enableMutation.isPending}
                aria-pressed={selected}
              >
                <span className={`picker-check ${selected ? 'checked' : ''}`}>
                  {selected ? <Check size={14} /> : enabled ? <span /> : <span />}
                </span>
                <span className="picker-test-icon"><TestTube2 size={16} /></span>
                <span className="picker-test-content">
                  <strong>{test.name}</strong>
                  <span>{test.code}{test.shortName ? ` · ${test.shortName}` : ''}</span>
                  <small>{test.department} · {test.category} · {test.parameters.length} field{test.parameters.length === 1 ? '' : 's'}</small>
                </span>
                <span className={`picker-status ${enabled ? 'is-enabled' : 'not-enabled'}`}>
                  {enabled ? 'Ready' : 'Available'}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

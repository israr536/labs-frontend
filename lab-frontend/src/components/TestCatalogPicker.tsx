import { useMemo, useState } from 'react';
import { Check, Search, TestTube2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import testCatalogService, { type LabTest, type TestCatalogDefinition } from '../services/testCatalogService';

type Props = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
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

  function toggle(test: TestCatalogDefinition) {
    const enabled = enabledByCode.get(normalize(test.code));
    if (!enabled || disabled) return;
    const id = enabled.id;
    onChange(selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]);
  }

  const enabledCount = enabledByCode.size;
  const selectedCount = selectedIds.length;
  const loading = catalogLoading || labTestsLoading;

  return (
    <div className="test-catalog-picker">
      <div className="picker-summary">
        <div>
          <strong>{catalog.length.toLocaleString()} tests available</strong>
          <span>{enabledCount.toLocaleString()} enabled for this lab · {selectedCount} selected</span>
        </div>
        <label className="picker-toggle">
          <input type="checkbox" checked={showDisabled} onChange={(event) => setShowDisabled(event.target.checked)} />
          Show not enabled
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
                onClick={() => toggle(test)}
                disabled={!enabled || disabled}
                aria-pressed={selected}
              >
                <span className={`picker-check ${selected ? 'checked' : ''}`}>
                  {selected ? <Check size={14} /> : enabled ? <span /> : null}
                </span>
                <span className="picker-test-icon"><TestTube2 size={16} /></span>
                <span className="picker-test-content">
                  <strong>{test.name}</strong>
                  <span>{test.code}{test.shortName ? ` · ${test.shortName}` : ''}</span>
                  <small>{test.department} · {test.category} · {test.parameters.length} field{test.parameters.length === 1 ? '' : 's'}</small>
                </span>
                <span className={`picker-status ${enabled ? 'is-enabled' : 'not-enabled'}`}>
                  {enabled ? 'Enabled' : 'Not enabled'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <style>{`.test-catalog-picker{display:grid;gap:10px}.picker-summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:var(--page-bg)}.picker-summary div{display:grid;gap:2px}.picker-summary strong{font-size:.76rem;color:var(--text-bold)}.picker-summary span{font-size:.62rem;color:var(--text)}.picker-toggle{display:flex;align-items:center;gap:6px;font-size:.62rem;color:var(--text);white-space:nowrap}.picker-toolbar{display:grid;grid-template-columns:minmax(240px,1fr) 170px 170px;gap:8px}.picker-search{height:40px;display:flex;align-items:center;gap:8px;padding:0 11px;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);color:var(--text)}.picker-search input{width:100%;border:0;outline:0;background:transparent;color:var(--text-bold);font:inherit;font-size:.68rem}.picker-toolbar select{height:40px;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);color:var(--text);padding:0 9px;font-size:.67rem}.picker-list{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:430px;overflow:auto;padding:2px}.picker-test{min-width:0;display:grid;grid-template-columns:20px 30px minmax(0,1fr) auto;align-items:center;gap:8px;text-align:left;padding:9px;border:1px solid var(--border);border-radius:9px;background:var(--panel-bg);color:var(--text-bold);cursor:pointer}.picker-test:hover:not(:disabled){border-color:var(--primary);background:var(--primary-light)}.picker-test.selected{border-color:var(--primary);box-shadow:inset 0 0 0 1px var(--primary);background:var(--primary-light)}.picker-test.disabled{opacity:.58;cursor:not-allowed;background:var(--page-bg)}.picker-check{width:18px;height:18px;display:grid;place-items:center;border:1px solid var(--border);border-radius:5px;color:#fff}.picker-check.checked{background:var(--primary);border-color:var(--primary)}.picker-test-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:var(--primary-light);color:var(--primary)}.picker-test-content{min-width:0;display:grid;gap:2px}.picker-test-content strong{font-size:.68rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.picker-test-content span,.picker-test-content small{font-size:.55rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.picker-status{font-size:.52rem;font-weight:800;border-radius:999px;padding:4px 6px;white-space:nowrap}.picker-status.is-enabled{background:#dcfce7;color:#166534}.picker-status.not-enabled{background:#e2e8f0;color:#475569}.picker-state{padding:28px 12px;text-align:center;border:1px dashed var(--border);border-radius:10px;color:var(--text);font-size:.68rem}.picker-error{border-style:solid}@media(max-width:850px){.picker-toolbar{grid-template-columns:1fr}.picker-list{grid-template-columns:1fr}}@media(max-width:560px){.picker-summary{align-items:flex-start;flex-direction:column}.picker-test{grid-template-columns:20px 30px minmax(0,1fr)}}`}</style>
    </div>
  );
}

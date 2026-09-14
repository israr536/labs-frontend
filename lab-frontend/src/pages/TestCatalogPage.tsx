import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, LoaderCircle, Search, Sparkles, TestTube2 } from 'lucide-react';
import testCatalogService, { type TestCatalogDefinition, type CatalogParameter } from '../services/testCatalogService';
import { useToast } from '../components/Toast';
import Pagination from '../components/Pagination';

type Props = { role?: string };

export default function TestCatalogPage({ role }: Props) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [enabledCatalogIds, setEnabledCatalogIds] = useState<Set<string>>(() => new Set());
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: catalog = [], isLoading, isError } = useQuery({
    queryKey: ['test-catalog', search, department, category],
    queryFn: () => testCatalogService.list({ search: search || undefined, department: department || undefined, category: category || undefined }),
    staleTime: 5 * 60_000,
  });

  const { data: myTests = [] } = useQuery({
    queryKey: ['tests'],
    queryFn: () => testCatalogService.myTests(),
    enabled: !!role,
  });

  const enabledCodes = useMemo(
    () => new Set(myTests.filter((item) => !(item as { isVirtual?: boolean }).isVirtual && item.isActive).map((item) => item.code.toLowerCase())),
    [myTests],
  );

  const enableMutation = useMutation({
    mutationFn: (id: string) => testCatalogService.enable(id),
    onSuccess: (_result, id) => {
      setEnabledCatalogIds((current) => new Set(current).add(id));
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'configuration'] });
      toast.show({ type: 'success', message: 'Test is ready for your lab. Its predefined result fields are available in Orders & Results.' });
    },
    onError: (error) => {
      toast.show({ type: 'error', message: error instanceof Error ? error.message : 'The test could not be enabled. Please try again.' });
    },
  });

  const starterMutation = useMutation({
    mutationFn: () => testCatalogService.provisionDefaults(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'configuration'] });
      const created = result.tests.filter((item) => item.status === 'created').length;
      toast.show({ type: 'success', message: created ? `${created} starter tests are now ready in your lab.` : 'Starter tests are already enabled for your lab.' });
    },
    onError: (error) => {
      toast.show({ type: 'error', message: error instanceof Error ? error.message : 'Starter tests could not be enabled. Please try again.' });
    },
  });

  const departments = useMemo(() => [...new Set(catalog.map((item) => item.department))].sort(), [catalog]);
  const categories = useMemo(() => [...new Set(catalog.map((item) => item.category))].sort(), [catalog]);
  const parameterCount = useMemo(() => catalog.reduce((total, test) => total + test.parameters.length, 0), [catalog]);
  const pageSize = 12;
  const paginatedCatalog = catalog.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="saas-eyebrow">Test management</span>
          <h1>Laboratory test catalog</h1>
          <p>Enable ready-made tests for your lab. Technicians receive their result fields automatically.</p>
        </div>
        {role === 'ADMIN' && (
          <div className="catalog-header-actions">
            <button
              className="catalog-starter-button"
              type="button"
              onClick={() => starterMutation.mutate()}
              disabled={starterMutation.isPending}
            >
              {starterMutation.isPending ? <LoaderCircle size={16} className="catalog-action-spinner" /> : <Sparkles size={16} />}
              {starterMutation.isPending ? 'Setting up…' : 'Enable starter tests'}
            </button>
          </div>
        )}
      </div>

      <div className="catalog-stats">
        <Stat value={catalog.length} label="Catalog tests" />
        <Stat value={enabledCodes.size + enabledCatalogIds.size} label="Enabled" />
        <Stat value={parameterCount} label="Catalog fields" />
        <Stat value={departments.length} label="Departments" />
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <Search size={16} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search test name, code or short name…" aria-label="Search test catalog" />
        </label>
        <select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }} aria-label="Filter test catalog by department">
          <option value="">All departments</option>
          {departments.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} aria-label="Filter test catalog by category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {role === 'ADMIN' && (
        <div className="catalog-workflow">
          <strong>Ready-to-use workflow</strong>
          <span>Enable a catalog test once. Its predefined parameters are copied into your lab test. Use Test Configuration only when your laboratory needs customization.</span>
        </div>
      )}

      {isError && <div className="catalog-state catalog-error"><strong>Unable to load the catalog</strong><span>Please refresh and try again.</span></div>}
      {!isError && isLoading && <div className="catalog-state"><span className="catalog-spinner" />Loading laboratory catalog…</div>}

      {!isError && !isLoading && !!catalog.length && (
        <>
          <div className="catalog-grid">
            {paginatedCatalog.map((test: TestCatalogDefinition) => {
              const enabled = enabledCatalogIds.has(test.id) || enabledCodes.has(test.code.toLowerCase());
              const isThisTestPending = enableMutation.isPending && enableMutation.variables === test.id;
              const isExpanded = expanded === test.id;
              return (
                <article className={`catalog-card ${isExpanded ? 'is-expanded' : ''}`} key={test.id}>
                  <div className="catalog-card-top"><span className="catalog-icon"><TestTube2 size={17} /></span><span className="catalog-code">{test.code}</span></div>
                  <h2>{test.name}</h2>
                  {test.shortName && <p className="catalog-short">{test.shortName}</p>}
                  <div className="catalog-meta"><span>{test.department}</span><span>{test.category}</span><span>{test.specimenType || 'Specimen not specified'}</span></div>
                  <div className="catalog-summary"><span><strong>{test.parameters.length}</strong> result fields</span>{test.tat != null && <span>TAT {test.tat}h</span>}{test.fasting && <span className="catalog-fast">Fasting</span>}</div>
                  <button type="button" className="catalog-details-toggle" onClick={() => setExpanded(isExpanded ? null : test.id)}>
                    <span>{isExpanded ? 'Hide fields' : 'Preview result fields'}</span><ChevronDown size={15} className={isExpanded ? 'rotate' : ''} />
                  </button>
                  {isExpanded && <div className="catalog-details"><div className="parameter-table-wrap"><table className="parameter-table"><thead><tr><th scope="col">Result field</th><th scope="col">Input</th><th scope="col">Unit</th><th scope="col">Reference</th><th scope="col">Required</th></tr></thead><tbody>{test.parameters.map((parameter) => <ParameterRow key={parameter.id} parameter={parameter} />)}</tbody></table></div></div>}
                  {role === 'ADMIN' && (
                    <button
                      type="button"
                      disabled={enabled || isThisTestPending}
                      className={`catalog-enable ${enabled ? 'enabled' : ''}`}
                      aria-busy={isThisTestPending}
                      onClick={() => enableMutation.mutate(test.id)}
                    >
                      {enabled ? <><Check size={15} /> Enabled for my lab</> : isThisTestPending ? <><LoaderCircle size={15} className="catalog-action-spinner" /> Enabling…</> : 'Add to my lab'}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          <Pagination page={page} pageSize={pageSize} total={catalog.length} onPageChange={setPage} label="catalog tests" />
        </>
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="catalog-stat"><strong>{value.toLocaleString()}</strong><span>{label}</span></div>; }
function ParameterRow({ parameter }: { parameter: CatalogParameter }) { const reference = parameter.referenceRange ? JSON.stringify(parameter.referenceRange) : formatReference(parameter); return <tr><td>{parameter.name}</td><td>{parameter.inputType}</td><td>{parameter.unit || '—'}</td><td>{reference}</td><td>{parameter.isRequired ? 'Yes' : 'No'}</td></tr>; }
function formatReference(parameter: CatalogParameter) { if (parameter.normalMin != null && parameter.normalMax != null) return `${parameter.normalMin} – ${parameter.normalMax}`; if (parameter.normalMin != null) return `≥ ${parameter.normalMin}`; if (parameter.normalMax != null) return `≤ ${parameter.normalMax}`; return 'Lab configured'; }

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, TestTube2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import testCatalogService, { type TestCatalogDefinition, type CatalogParameter } from '../services/testCatalogService';
import Pagination from '../components/Pagination';

type Props = { role?: string };

export default function TestCatalogPage({ role }: Props) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: catalog = [], isLoading, isError } = useQuery({
    queryKey: ['test-catalog', search, department, category],
    queryFn: () => testCatalogService.list({ search: search || undefined, department: department || undefined, category: category || undefined }),
    staleTime: 5 * 60_000,
  });
  const { data: myTests = [] } = useQuery({ queryKey: ['tests'], queryFn: () => testCatalogService.myTests(), enabled: !!role });

  const configureMutation = useMutation({
    mutationFn: (id: string) => testCatalogService.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'configuration'] });
      setNotice('Test configuration is ready. You can now customize its lab-specific settings.');
    },
  });

  const departments = useMemo(() => [...new Set(catalog.map((item) => item.department))].sort(), [catalog]);
  const categories = useMemo(() => [...new Set(catalog.map((item) => item.category))].sort(), [catalog]);
  const enabledCodes = useMemo(() => new Set(myTests.map((item) => item.code)), [myTests]);
  const parameterCount = useMemo(() => catalog.reduce((total, test) => total + test.parameters.length, 0), [catalog]);
  const pageSize = 12;
  const paginatedCatalog = catalog.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="saas-eyebrow">Test management</span>
          <h1>Laboratory test catalog</h1>
          <p>All master tests are available immediately. Lab-specific settings are created only when you configure or use a test.</p>
        </div>
      </div>

      <div className="catalog-stats">
        <Stat value={catalog.length} label="Catalog tests" />
        <Stat value={enabledCodes.size} label="Configured" />
        <Stat value={parameterCount} label="Catalog fields" />
        <Stat value={departments.length} label="Departments" />
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search test name, code or short name…" aria-label="Search test catalog" /></label>
        <select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }} aria-label="Filter test catalog by department"><option value="">All departments</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} aria-label="Filter test catalog by category"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {role === 'ADMIN' && <div className="catalog-workflow"><strong>Shared master catalog</strong><span>Every active catalog test is visible to your lab immediately. When you configure or use a test, only that lab's copy is created for prices, availability and custom result settings. The master catalog is never changed by a lab.</span></div>}
      {(notice || configureMutation.isError) && <div className={`catalog-state catalog-message ${configureMutation.isError ? 'catalog-error' : ''}`}><strong>{configureMutation.isError ? 'Configuration failed' : 'Ready'}</strong><span>{configureMutation.isError ? (configureMutation.error instanceof Error ? configureMutation.error.message : 'The test could not be configured. Please try again.') : notice}</span></div>}
      {isError && <div className="catalog-state catalog-error"><strong>Unable to load the catalog</strong><span>Please refresh and try again.</span></div>}
      {!isError && isLoading && <div className="catalog-state"><span className="catalog-spinner" />Loading laboratory catalog…</div>}

      {!isError && !isLoading && !!catalog.length && <><div className="catalog-grid">
        {paginatedCatalog.map((test: TestCatalogDefinition) => {
          const configured = enabledCodes.has(test.code);
          const isExpanded = expanded === test.id;
          return <article className={`catalog-card ${isExpanded ? 'is-expanded' : ''}`} key={test.id}>
            <div className="catalog-card-top"><span className="catalog-icon"><TestTube2 size={17} /></span><span className="catalog-code">{test.code}</span></div>
            <h2>{test.name}</h2>
            {test.shortName && <p className="catalog-short">{test.shortName}</p>}
            <div className="catalog-meta"><span>{test.department}</span><span>{test.category}</span><span>{test.specimenType || 'Specimen not specified'}</span></div>
            <div className="catalog-summary"><span><strong>{test.parameters.length}</strong> result fields</span>{test.tat != null && <span>TAT {test.tat}h</span>}{test.fasting && <span className="catalog-fast">Fasting</span>}</div>
            <button type="button" className="catalog-details-toggle" onClick={() => setExpanded(isExpanded ? null : test.id)}><span>{isExpanded ? 'Hide fields' : 'Preview result fields'}</span><ChevronDown size={15} className={isExpanded ? 'rotate' : ''} /></button>
            {isExpanded && <div className="catalog-details"><div className="parameter-table-wrap"><table className="parameter-table"><thead><tr><th scope="col">Result field</th><th scope="col">Input</th><th scope="col">Unit</th><th scope="col">Reference</th><th scope="col">Required</th></tr></thead><tbody>{test.parameters.map((parameter) => <ParameterRow key={parameter.id} parameter={parameter} />)}</tbody></table></div></div>}
            {role === 'ADMIN' && <button disabled={configured || configureMutation.isPending} className={`catalog-enable ${configured ? 'enabled' : ''}`} onClick={() => configureMutation.mutate(test.id)}>{configured ? <><Check size={15} /> Configured for my lab</> : configureMutation.isPending ? 'Preparing…' : 'Configure for my lab'}</button>}
          </article>;
        })}
      </div><Pagination page={page} pageSize={pageSize} total={catalog.length} onPageChange={setPage} label="catalog tests" /></>}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="catalog-stat"><strong>{value.toLocaleString()}</strong><span>{label}</span></div>; }
function ParameterRow({ parameter }: { parameter: CatalogParameter }) { const reference = parameter.referenceRange ? JSON.stringify(parameter.referenceRange) : formatReference(parameter); return <tr><td>{parameter.name}</td><td>{parameter.inputType}</td><td>{parameter.unit || '—'}</td><td>{reference}</td><td>{parameter.isRequired ? 'Yes' : 'No'}</td></tr>; }
function formatReference(parameter: CatalogParameter) { if (parameter.normalMin != null && parameter.normalMax != null) return `${parameter.normalMin} – ${parameter.normalMax}`; if (parameter.normalMin != null) return `≥ ${parameter.normalMin}`; if (parameter.normalMax != null) return `≤ ${parameter.normalMax}`; return 'Lab configured'; }

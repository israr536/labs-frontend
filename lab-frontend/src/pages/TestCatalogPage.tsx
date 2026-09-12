import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Search, Sparkles, TestTube2, Layers } from 'lucide-react';
import testCatalogService, { type TestCatalogDefinition, type CatalogParameter } from '../services/testCatalogService';
import { request } from '../services/api';
import Pagination from '../components/Pagination';

type Props = { role?: string };
type EnableAllResult = { total:number; enabled:number; alreadyEnabled:number };

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

  const enableMutation = useMutation({
    mutationFn: (id: string) => testCatalogService.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'configuration'] });
      setNotice('Test enabled. Its configured result fields are now available automatically in Orders & Results.');
    },
  });

  const enableAllMutation = useMutation({
    mutationFn: () => request<EnableAllResult>('test-catalog/enable-all', { method:'POST', body:JSON.stringify({}) }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'configuration'] });
      setNotice(result.enabled > 0
        ? `${result.enabled} tests enabled. ${result.alreadyEnabled} were already enabled.`
        : 'All catalog tests are already enabled for your lab.');
    },
  });

  const starterMutation = useMutation({
    mutationFn: () => testCatalogService.provisionDefaults(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      queryClient.invalidateQueries({ queryKey: ['tests', 'configuration'] });
      const created = result.tests.filter((item) => item.status === 'created').length;
      setNotice(created ? `${created} ready-to-use starter tests were added to your lab.` : 'Starter tests are already enabled for your lab.');
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
          <p>Enable ready-made tests for your lab. Technicians receive their result fields automatically.</p>
        </div>
        {role === 'ADMIN' && <div className="catalog-header-actions">
          <button className="catalog-enable-all-button" onClick={() => enableAllMutation.mutate()} disabled={enableAllMutation.isPending || isLoading} title="Enable every active catalog test for this laboratory">
            <Layers size={16} /> {enableAllMutation.isPending ? 'Enabling all tests…' : 'Enable all tests'}
          </button>
          <button className="catalog-starter-button" onClick={() => starterMutation.mutate()} disabled={starterMutation.isPending}>
            <Sparkles size={16} /> {starterMutation.isPending ? 'Setting up…' : 'Enable starter tests'}
          </button>
        </div>}
      </div>

      <div className="catalog-stats">
        <Stat value={catalog.length} label="Catalog tests" />
        <Stat value={enabledCodes.size} label="Enabled" />
        <Stat value={parameterCount} label="Catalog fields" />
        <Stat value={departments.length} label="Departments" />
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={16} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search test name, code or short name…" aria-label="Search test catalog" /></label>
        <select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }} aria-label="Filter test catalog by department"><option value="">All departments</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} aria-label="Filter test catalog by category"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {role === 'ADMIN' && <div className="catalog-workflow"><strong>Ready-to-use workflow</strong><span>Enable a catalog test once. Its predefined parameters are copied into your lab test. Technician result entry never asks the technician to create fields. Use Test Configuration only when your laboratory needs customization.</span></div>}
      {(notice || enableMutation.isError || starterMutation.isError || enableAllMutation.isError) && <div className={`catalog-state catalog-message ${enableMutation.isError || starterMutation.isError || enableAllMutation.isError ? 'catalog-error' : ''}`}><strong>{enableMutation.isError || starterMutation.isError || enableAllMutation.isError ? 'Setup failed' : 'Setup complete'}</strong><span>{enableMutation.isError ? 'The test could not be enabled. Please try again.' : starterMutation.isError ? 'Starter tests could not be provisioned. Please try again.' : enableAllMutation.isError ? 'The catalog could not be enabled completely. Your subscription limit may be reached. Please check Plan & Usage.' : notice}</span></div>}
      {isError && <div className="catalog-state catalog-error"><strong>Unable to load the catalog</strong><span>Please refresh and try again.</span></div>}
      {!isError && isLoading && <div className="catalog-state"><span className="catalog-spinner" />Loading laboratory catalog…</div>}

      {!isError && !isLoading && !!catalog.length && <><div className="catalog-grid">
        {paginatedCatalog.map((test: TestCatalogDefinition) => {
          const enabled = enabledCodes.has(test.code);
          const isExpanded = expanded === test.id;
          return <article className={`catalog-card ${isExpanded ? 'is-expanded' : ''}`} key={test.id}>
            <div className="catalog-card-top"><span className="catalog-icon"><TestTube2 size={17} /></span><span className="catalog-code">{test.code}</span></div>
            <h2>{test.name}</h2>
            {test.shortName && <p className="catalog-short">{test.shortName}</p>}
            <div className="catalog-meta"><span>{test.department}</span><span>{test.category}</span><span>{test.specimenType || 'Specimen not specified'}</span></div>
            <div className="catalog-summary"><span><strong>{test.parameters.length}</strong> result fields</span>{test.tat != null && <span>TAT {test.tat}h</span>}{test.fasting && <span className="catalog-fast">Fasting</span>}</div>
            <button type="button" className="catalog-details-toggle" onClick={() => setExpanded(isExpanded ? null : test.id)}><span>{isExpanded ? 'Hide fields' : 'Preview result fields'}</span><ChevronDown size={15} className={isExpanded ? 'rotate' : ''} /></button>
            {isExpanded && <div className="catalog-details"><div className="parameter-table-wrap"><table className="parameter-table"><thead><tr><th scope="col">Result field</th><th scope="col">Input</th><th scope="col">Unit</th><th scope="col">Reference</th><th scope="col">Required</th></tr></thead><tbody>{test.parameters.map((parameter) => <ParameterRow key={parameter.id} parameter={parameter} />)}</tbody></table></div></div>}
            {role === 'ADMIN' && <button disabled={enabled || enableMutation.isPending || enableAllMutation.isPending} className={`catalog-enable ${enabled ? 'enabled' : ''}`} onClick={() => enableMutation.mutate(test.id)}>{enabled ? <><Check size={15} /> Enabled for my lab</> : enableMutation.isPending ? 'Enabling…' : 'Add to my lab'}</button>}
          </article>;
        })}
      </div><Pagination page={page} pageSize={pageSize} total={catalog.length} onPageChange={setPage} label="catalog tests" /></>}


    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="catalog-stat"><strong>{value.toLocaleString()}</strong><span>{label}</span></div>; }
function ParameterRow({ parameter }: { parameter: CatalogParameter }) { const reference = parameter.referenceRange ? JSON.stringify(parameter.referenceRange) : formatReference(parameter); return <tr><td>{parameter.name}</td><td>{parameter.inputType}</td><td>{parameter.unit || '—'}</td><td>{reference}</td><td>{parameter.isRequired ? 'Yes' : 'No'}</td></tr>; }
function formatReference(parameter: CatalogParameter) { if (parameter.normalMin != null && parameter.normalMax != null) return `${parameter.normalMin} – ${parameter.normalMax}`; if (parameter.normalMin != null) return `≥ ${parameter.normalMin}`; if (parameter.normalMax != null) return `≤ ${parameter.normalMax}`; return 'Lab configured'; }

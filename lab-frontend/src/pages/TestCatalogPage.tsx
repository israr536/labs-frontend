import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Search, Sparkles, TestTube2 } from 'lucide-react';
import testCatalogService, { type TestCatalogDefinition, type CatalogParameter } from '../services/testCatalogService';

type Props = { role?: string };

export default function TestCatalogPage({ role }: Props) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
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

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="saas-eyebrow">Test management</span>
          <h1>Laboratory test catalog</h1>
          <p>Enable ready-made tests for your lab. Technicians receive their result fields automatically.</p>
        </div>
        {role === 'ADMIN' && <button className="catalog-starter-button" onClick={() => starterMutation.mutate()} disabled={starterMutation.isPending}>
          <Sparkles size={16} /> {starterMutation.isPending ? 'Setting up…' : 'Enable starter tests'}
        </button>}
      </div>

      <div className="catalog-stats">
        <Stat value={catalog.length} label="Catalog tests" />
        <Stat value={enabledCodes.size} label="Enabled" />
        <Stat value={parameterCount} label="Catalog fields" />
        <Stat value={departments.length} label="Departments" />
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test name, code or short name…" /></label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {role === 'ADMIN' && <div className="catalog-workflow"><strong>Ready-to-use workflow</strong><span>Enable a catalog test once. Its predefined parameters are copied into your lab test. Technician result entry never asks the technician to create fields. Use Test Configuration only when your laboratory needs customization.</span></div>}
      {(notice || enableMutation.isError || starterMutation.isError) && <div className={`catalog-state catalog-message ${enableMutation.isError || starterMutation.isError ? 'catalog-error' : ''}`}><strong>{enableMutation.isError || starterMutation.isError ? 'Setup failed' : 'Setup complete'}</strong><span>{enableMutation.isError ? 'The test could not be enabled. Please try again.' : starterMutation.isError ? 'Starter tests could not be provisioned. Please try again.' : notice}</span></div>}
      {isError && <div className="catalog-state catalog-error"><strong>Unable to load the catalog</strong><span>Please refresh and try again.</span></div>}
      {!isError && isLoading && <div className="catalog-state"><span className="catalog-spinner" />Loading laboratory catalog…</div>}

      {!isError && !isLoading && !!catalog.length && <div className="catalog-grid">
        {catalog.map((test: TestCatalogDefinition) => {
          const enabled = enabledCodes.has(test.code);
          const isExpanded = expanded === test.id;
          return <article className={`catalog-card ${isExpanded ? 'is-expanded' : ''}`} key={test.id}>
            <div className="catalog-card-top"><span className="catalog-icon"><TestTube2 size={17} /></span><span className="catalog-code">{test.code}</span></div>
            <h2>{test.name}</h2>
            {test.shortName && <p className="catalog-short">{test.shortName}</p>}
            <div className="catalog-meta"><span>{test.department}</span><span>{test.category}</span><span>{test.specimenType || 'Specimen not specified'}</span></div>
            <div className="catalog-summary"><span><strong>{test.parameters.length}</strong> result fields</span>{test.tat != null && <span>TAT {test.tat}h</span>}{test.fasting && <span className="catalog-fast">Fasting</span>}</div>
            <button type="button" className="catalog-details-toggle" onClick={() => setExpanded(isExpanded ? null : test.id)}><span>{isExpanded ? 'Hide fields' : 'Preview result fields'}</span><ChevronDown size={15} className={isExpanded ? 'rotate' : ''} /></button>
            {isExpanded && <div className="catalog-details">
              <div className="parameter-table-wrap"><table className="parameter-table"><thead><tr><th>Result field</th><th>Input</th><th>Unit</th><th>Reference</th><th>Required</th></tr></thead><tbody>{test.parameters.map((parameter) => <ParameterRow key={parameter.id} parameter={parameter} />)}</tbody></table></div>
            </div>}
            {role === 'ADMIN' && <button disabled={enabled || enableMutation.isPending} className={`catalog-enable ${enabled ? 'enabled' : ''}`} onClick={() => enableMutation.mutate(test.id)}>{enabled ? <><Check size={15} /> Enabled for my lab</> : enableMutation.isPending ? 'Enabling…' : 'Add to my lab'}</button>}
          </article>;
        })}
      </div>}

      <style>{`.catalog-page{padding:30px 34px 60px;max-width:1440px;margin:0 auto}.catalog-header{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:14px}.catalog-header h1{margin:5px 0 7px;font-size:clamp(1.65rem,2.6vw,2.25rem);letter-spacing:-.045em;color:var(--text-bold)}.catalog-header p{margin:0;color:var(--text);font-size:.82rem}.catalog-starter-button{height:40px;display:flex;align-items:center;gap:7px;padding:0 14px;border:1px solid var(--primary);border-radius:10px;background:var(--primary);color:#fff;font-weight:700;font-size:.68rem;cursor:pointer}.catalog-starter-button:disabled{opacity:.65;cursor:default}.catalog-stats{display:flex;gap:8px;margin-bottom:18px}.catalog-stat{min-width:95px;padding:10px 13px;border:1px solid var(--border);border-radius:12px;background:var(--panel-bg)}.catalog-stat strong{display:block;font-size:1.05rem;color:var(--primary)}.catalog-stat span{font-size:.58rem;color:var(--text)}.catalog-toolbar{display:flex;gap:10px;margin-bottom:12px;position:sticky;top:0;z-index:3;padding:8px 0;background:var(--page-bg)}.catalog-search{height:42px;display:flex;align-items:center;gap:8px;flex:1;padding:0 12px;border:1px solid var(--border);border-radius:11px;background:var(--panel-bg);color:var(--text)}.catalog-search input{width:100%;border:0;outline:0;background:transparent;color:var(--text-bold);font:inherit;font-size:.75rem}.catalog-toolbar select{height:42px;min-width:170px;padding:0 10px;border:1px solid var(--border);border-radius:11px;background:var(--panel-bg);color:var(--text);font-size:.72rem}.catalog-workflow{display:flex;flex-direction:column;gap:3px;padding:11px 13px;margin-bottom:18px;border:1px solid var(--border);border-radius:11px;background:var(--primary-light);color:var(--text);font-size:.64rem;line-height:1.45}.catalog-workflow strong{color:var(--primary);font-size:.67rem}.catalog-state{min-height:70px;padding:16px;margin-bottom:14px;text-align:center;border:1px dashed var(--border);border-radius:12px;color:var(--text);font-size:.72rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.catalog-state strong{font-size:.78rem;color:var(--text-bold)}.catalog-error{border-style:solid}.catalog-spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:catalog-spin .8s linear infinite}@keyframes catalog-spin{to{transform:rotate(360deg)}}.catalog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}.catalog-card{padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);box-shadow:0 7px 22px rgba(15,23,42,.035);min-width:0}.catalog-card.is-expanded{grid-column:span 2}.catalog-card-top{display:flex;align-items:center;justify-content:space-between}.catalog-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:var(--primary-light);color:var(--primary)}.catalog-code{font:700 .62rem ui-monospace,monospace;color:var(--text);opacity:.8}.catalog-card h2{margin:15px 0 4px;font-size:.9rem;line-height:1.35;color:var(--text-bold)}.catalog-short{margin:0;color:var(--text);font-size:.68rem}.catalog-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.catalog-meta span{padding:5px 7px;border-radius:7px;background:var(--page-bg);font-size:.58rem;color:var(--text)}.catalog-summary{display:flex;gap:12px;align-items:center;margin:15px 0 8px;font-size:.62rem;color:var(--text)}.catalog-summary strong{color:var(--text-bold)}.catalog-fast{margin-left:auto;color:var(--primary);font-weight:700}.catalog-details-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 0;border:0;border-top:1px solid var(--border);background:transparent;color:var(--primary);font-size:.64rem;font-weight:700;cursor:pointer}.catalog-details-toggle svg{transition:transform .2s}.catalog-details-toggle .rotate{transform:rotate(180deg)}.catalog-details{padding-top:12px}.parameter-table-wrap{overflow:auto;border:1px solid var(--border);border-radius:10px}.parameter-table{width:100%;min-width:620px;border-collapse:collapse;font-size:.59rem}.parameter-table th{padding:8px;background:var(--primary-light);color:var(--primary);text-align:left;white-space:nowrap}.parameter-table td{padding:8px;border-top:1px solid var(--border);color:var(--text);vertical-align:top}.parameter-table td:first-child{font-weight:700;color:var(--text-bold)}.catalog-enable{width:100%;height:38px;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--primary);border-radius:9px;background:var(--primary);color:#fff;font-weight:700;font-size:.68rem;cursor:pointer}.catalog-enable:disabled{cursor:default;opacity:.7}.catalog-enable.enabled{background:var(--primary-light);border-color:var(--border);color:var(--primary)}@media(max-width:1050px){.catalog-card.is-expanded{grid-column:span 1}}@media(max-width:760px){.catalog-page{padding:22px 16px 90px}.catalog-header{align-items:start;flex-direction:column}.catalog-starter-button{width:100%;justify-content:center}.catalog-stats{overflow:auto}.catalog-toolbar{flex-direction:column;position:static}.catalog-toolbar select{width:100%}.catalog-grid{grid-template-columns:1fr}.catalog-card{padding:15px}}`}</style>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="catalog-stat"><strong>{value.toLocaleString()}</strong><span>{label}</span></div>;
}

function ParameterRow({ parameter }: { parameter: CatalogParameter }) {
  const reference = parameter.referenceRange ? JSON.stringify(parameter.referenceRange) : formatReference(parameter);
  return <tr><td>{parameter.name}</td><td>{parameter.inputType}</td><td>{parameter.unit || '—'}</td><td>{reference}</td><td>{parameter.isRequired ? 'Yes' : 'No'}</td></tr>;
}

function formatReference(parameter: CatalogParameter) {
  if (parameter.normalMin != null && parameter.normalMax != null) return `${parameter.normalMin} – ${parameter.normalMax}`;
  if (parameter.normalMin != null) return `≥ ${parameter.normalMin}`;
  if (parameter.normalMax != null) return `≤ ${parameter.normalMax}`;
  return 'Lab configured';
}

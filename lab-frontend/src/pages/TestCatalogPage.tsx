import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, Search, TestTube2 } from 'lucide-react';
import testCatalogService, { type TestCatalogDefinition, type CatalogParameter } from '../services/testCatalogService';

type Props = { role?: string };

export default function TestCatalogPage({ role }: Props) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: catalog = [], isLoading } = useQuery({
    queryKey: ['test-catalog', search, department, category],
    queryFn: () => testCatalogService.list({ search: search || undefined, department: department || undefined, category: category || undefined }),
    staleTime: 5 * 60_000,
  });
  const { data: myTests = [] } = useQuery({ queryKey: ['tests'], queryFn: () => testCatalogService.myTests(), enabled: !!role });
  const enableMutation = useMutation({
    mutationFn: (id: string) => testCatalogService.enable(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tests'] }),
  });

  const departments = useMemo(() => [...new Set(catalog.map((item) => item.department))].sort(), [catalog]);
  const categories = useMemo(() => [...new Set(catalog.map((item) => item.category))].sort(), [catalog]);
  const enabledCodes = useMemo(() => new Set(myTests.map((item) => item.code)), [myTests]);

  return (
    <section className="catalog-page">
      <div className="catalog-header">
        <div>
          <span className="saas-eyebrow">Test management</span>
          <h1>Laboratory test catalog</h1>
          <p>Central test definitions, specimen requirements, methods and result fields.</p>
        </div>
        <div className="catalog-count"><strong>{catalog.length}</strong><span>catalog tests</span></div>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test name, code or short name…" /></label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      <div className="catalog-grid">
        {isLoading && <div className="catalog-empty">Loading catalog…</div>}
        {!isLoading && !catalog.length && <div className="catalog-empty">No tests match your filters.</div>}
        {catalog.map((test: TestCatalogDefinition) => {
          const enabled = enabledCodes.has(test.code);
          const isExpanded = expanded === test.id;
          return <article className={`catalog-card ${isExpanded ? 'is-expanded' : ''}`} key={test.id}>
            <div className="catalog-card-top"><span className="catalog-icon"><TestTube2 size={17} /></span><span className="catalog-code">{test.code}</span></div>
            <h2>{test.name}</h2>
            {test.shortName && <p className="catalog-short">{test.shortName}</p>}
            <div className="catalog-meta"><span>{test.department}</span><span>{test.category}</span><span>{test.specimenType || 'Specimen not specified'}</span>{test.container && <span>{test.container}</span>}</div>
            <div className="catalog-summary"><span><strong>{test.parameters.length}</strong> fields</span>{test.tat != null && <span>TAT {test.tat}h</span>}{test.fasting && <span className="catalog-fast">Fasting</span>}</div>
            <button type="button" className="catalog-details-toggle" onClick={() => setExpanded(isExpanded ? null : test.id)}><span>{isExpanded ? 'Hide fields' : 'View all fields'}</span><ChevronDown size={15} className={isExpanded ? 'rotate' : ''} /></button>
            {isExpanded && <div className="catalog-details">
              <div className="catalog-info-grid">
                <Info label="Method" value={test.method} /><Info label="Specimen handling" value={test.sampleHandling} /><Info label="Stability" value={test.stability} /><Info label="Rejection criteria" value={test.rejectionCriteria} />
              </div>
              {test.description && <p className="catalog-description">{test.description}</p>}
              <div className="parameter-table-wrap">
                <table className="parameter-table"><thead><tr><th>Field</th><th>Input</th><th>Unit</th><th>Reference</th><th>Validation</th><th>Required</th></tr></thead><tbody>
                  {test.parameters.map((parameter) => <ParameterRow key={parameter.id} parameter={parameter} />)}
                </tbody></table>
              </div>
            </div>}
            {role === 'ADMIN' && <button disabled={enabled || enableMutation.isPending} className={`catalog-enable ${enabled ? 'enabled' : ''}`} onClick={() => enableMutation.mutate(test.id)}>{enabled ? <><Check size={15} /> Enabled</> : 'Add to my lab'}</button>}
          </article>;
        })}
      </div>

      <style>{`.catalog-page{padding:30px 34px 60px;max-width:1440px;margin:0 auto}.catalog-header{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:24px}.catalog-header h1{margin:5px 0 7px;font-size:clamp(1.65rem,2.6vw,2.25rem);letter-spacing:-.045em;color:var(--text-bold)}.catalog-header p{margin:0;color:var(--text);font-size:.82rem}.catalog-count{display:grid;min-width:110px;padding:13px 16px;border:1px solid var(--border);border-radius:14px;background:var(--panel-bg);text-align:right}.catalog-count strong{font-size:1.25rem;color:var(--primary)}.catalog-count span{font-size:.62rem;color:var(--text)}.catalog-toolbar{display:flex;gap:10px;margin-bottom:18px}.catalog-search{height:42px;display:flex;align-items:center;gap:8px;flex:1;padding:0 12px;border:1px solid var(--border);border-radius:11px;background:var(--panel-bg);color:var(--text)}.catalog-search input{width:100%;border:0;outline:0;background:transparent;color:var(--text-bold);font:inherit;font-size:.75rem}.catalog-toolbar select{height:42px;min-width:170px;padding:0 10px;border:1px solid var(--border);border-radius:11px;background:var(--panel-bg);color:var(--text);font-size:.72rem}.catalog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}.catalog-card{padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);box-shadow:0 7px 22px rgba(15,23,42,.035);min-width:0}.catalog-card.is-expanded{grid-column:span 2}.catalog-card-top{display:flex;align-items:center;justify-content:space-between}.catalog-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:var(--primary-light);color:var(--primary)}.catalog-code{font:700 .62rem ui-monospace,monospace;color:var(--text);opacity:.8}.catalog-card h2{margin:15px 0 4px;font-size:.9rem;line-height:1.35;color:var(--text-bold)}.catalog-short{margin:0;color:var(--text);font-size:.68rem}.catalog-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.catalog-meta span{padding:5px 7px;border-radius:7px;background:var(--page-bg);font-size:.58rem;color:var(--text)}.catalog-summary{display:flex;gap:12px;align-items:center;margin:15px 0 8px;font-size:.62rem;color:var(--text)}.catalog-summary strong{color:var(--text-bold)}.catalog-fast{margin-left:auto;color:var(--primary);font-weight:700}.catalog-details-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 0;border:0;border-top:1px solid var(--border);background:transparent;color:var(--primary);font-size:.64rem;font-weight:700;cursor:pointer}.catalog-details-toggle svg{transition:transform .2s}.catalog-details-toggle .rotate{transform:rotate(180deg)}.catalog-details{padding-top:12px}.catalog-info-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}.catalog-info{padding:9px;border:1px solid var(--border);border-radius:9px;background:var(--page-bg)}.catalog-info small{display:block;font-size:.55rem;color:var(--text);margin-bottom:3px}.catalog-info span{display:block;font-size:.62rem;color:var(--text-bold);word-break:break-word}.catalog-description{font-size:.62rem;color:var(--text);margin:0 0 12px}.parameter-table-wrap{overflow:auto;border:1px solid var(--border);border-radius:10px}.parameter-table{width:100%;min-width:680px;border-collapse:collapse;font-size:.59rem}.parameter-table th{padding:8px;background:var(--primary-light);color:var(--primary);text-align:left}.parameter-table td{padding:8px;border-top:1px solid var(--border);color:var(--text)}.parameter-table td:first-child{font-weight:700;color:var(--text-bold)}.catalog-enable{width:100%;height:38px;margin-top:12px;border:1px solid var(--primary);border-radius:9px;background:var(--primary);color:#fff;font-weight:700;font-size:.68rem;cursor:pointer}.catalog-enable:disabled{cursor:default;opacity:.7}.catalog-enable.enabled{background:var(--primary-light);border-color:var(--border);color:var(--primary)}.catalog-empty{grid-column:1/-1;padding:55px;text-align:center;border:1px dashed var(--border);border-radius:16px;color:var(--text);font-size:.75rem}@media(max-width:1050px){.catalog-card.is-expanded{grid-column:span 1}.catalog-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.catalog-page{padding:22px 16px 90px}.catalog-header{align-items:start}.catalog-count{display:none}.catalog-toolbar{flex-direction:column}.catalog-toolbar select{width:100%}.catalog-info-grid{grid-template-columns:1fr}}`}</style>
    </section>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return <div className="catalog-info"><small>{label}</small><span>{value || '—'}</span></div>;
}

function ParameterRow({ parameter }: { parameter: CatalogParameter }) {
  const reference = parameter.referenceRange ? JSON.stringify(parameter.referenceRange) : formatReference(parameter);
  const validation = parameter.validation ? JSON.stringify(parameter.validation) : parameter.inputType === 'NUMBER' ? 'Numeric' : '—';
  return <tr><td>{parameter.name}</td><td>{parameter.inputType}</td><td>{parameter.unit || '—'}</td><td>{reference}</td><td>{validation}</td><td>{parameter.isRequired ? 'Yes' : 'No'}</td></tr>;
}

function formatReference(parameter: CatalogParameter) {
  if (parameter.normalMin != null && parameter.normalMax != null) return `${parameter.normalMin} – ${parameter.normalMax}`;
  if (parameter.normalMin != null) return `≥ ${parameter.normalMin}`;
  if (parameter.normalMax != null) return `≤ ${parameter.normalMax}`;
  return 'Clinical / qualitative';
}

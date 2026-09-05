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
          <p>Browse the central test library and enable only the tests your laboratory offers.</p>
        </div>
        <div className="catalog-stats">
          <Stat value={catalog.length} label="Tests" />
          <Stat value={enabledCodes.size} label="Enabled" />
          <Stat value={parameterCount} label="Result fields" />
          <Stat value={departments.length} label="Departments" />
        </div>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test name, code, synonym or short name…" /></label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>

      {role === 'ADMIN' && <div className="catalog-workflow"><strong>Catalog → enable → configure</strong><span>Add a test to your lab here, then open <b>Test Configuration</b> to set its price, availability, result fields and reference-range versions.</span></div>}
      {enableMutation.isError && <div className="catalog-state catalog-error"><strong>Unable to enable this test</strong><span>Please try again. No catalog data was changed.</span></div>}
      {isError && <div className="catalog-state catalog-error"><strong>Unable to load the catalog</strong><span>Please refresh and try again. Your existing lab tests are not affected.</span></div>}
      {!isError && isLoading && <div className="catalog-state"><span className="catalog-spinner" />Loading laboratory catalog…</div>}
      {!isError && !isLoading && !catalog.length && <div className="catalog-state"><strong>No tests found</strong><span>Try a different name, code, department or category.</span></div>}

      {!isError && !isLoading && !!catalog.length && <div className="catalog-grid">
        {catalog.map((test: TestCatalogDefinition) => {
          const enabled = enabledCodes.has(test.code);
          const isExpanded = expanded === test.id;
          const hasExtra = Boolean(test.description || test.synonyms || test.externalCodes);
          return <article className={`catalog-card ${isExpanded ? 'is-expanded' : ''}`} key={test.id}>
            <div className="catalog-card-top"><span className="catalog-icon"><TestTube2 size={17} /></span><span className="catalog-code">{test.code}</span></div>
            <h2>{test.name}</h2>
            {test.shortName && <p className="catalog-short">{test.shortName}</p>}
            <div className="catalog-meta"><span>{test.department}</span><span>{test.category}</span><span>{test.specimenType || 'Specimen not specified'}</span>{test.container && <span>{test.container}</span>}</div>
            <div className="catalog-summary"><span><strong>{test.parameters.length}</strong> fields</span>{test.tat != null && <span>TAT {test.tat}h</span>}{test.fasting && <span className="catalog-fast">Fasting</span>}</div>
            <button type="button" className="catalog-details-toggle" onClick={() => setExpanded(isExpanded ? null : test.id)}><span>{isExpanded ? 'Hide test details' : 'View test details'}</span><ChevronDown size={15} className={isExpanded ? 'rotate' : ''} /></button>
            {isExpanded && <div className="catalog-details">
              <div className="catalog-info-grid">
                <Info label="Method" value={test.method} /><Info label="Specimen handling" value={test.sampleHandling} /><Info label="Stability" value={test.stability} /><Info label="Rejection criteria" value={test.rejectionCriteria} />
              </div>
              {hasExtra && <div className="catalog-extra">
                {test.description && <p>{test.description}</p>}
                <MetaList label="Synonyms" value={test.synonyms} />
                <MetaList label="External codes" value={test.externalCodes} />
              </div>}
              <div className="parameter-table-wrap">
                <table className="parameter-table"><thead><tr><th>Field</th><th>Input</th><th>Unit</th><th>Reference</th><th>Validation</th><th>Critical</th><th>Required</th></tr></thead><tbody>
                  {test.parameters.map((parameter) => <ParameterRow key={parameter.id} parameter={parameter} />)}
                </tbody></table>
              </div>
            </div>}
            {role === 'ADMIN' && <button disabled={enabled || enableMutation.isPending} className={`catalog-enable ${enabled ? 'enabled' : ''}`} onClick={() => enableMutation.mutate(test.id)}>{enabled ? <><Check size={15} /> Enabled for my lab</> : enableMutation.isPending ? 'Enabling…' : 'Add to my lab'}</button>}
          </article>;
        })}
      </div>}

      <style>{`.catalog-page{padding:30px 34px 60px;max-width:1440px;margin:0 auto}.catalog-header{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:24px}.catalog-header h1{margin:5px 0 7px;font-size:clamp(1.65rem,2.6vw,2.25rem);letter-spacing:-.045em;color:var(--text-bold)}.catalog-header p{margin:0;color:var(--text);font-size:.82rem}.catalog-stats{display:flex;gap:8px}.catalog-stat{min-width:86px;padding:11px 13px;border:1px solid var(--border);border-radius:13px;background:var(--panel-bg);text-align:right}.catalog-stat strong{display:block;font-size:1.08rem;color:var(--primary)}.catalog-stat span{font-size:.58rem;color:var(--text)}.catalog-toolbar{display:flex;gap:10px;margin-bottom:12px;position:sticky;top:0;z-index:3;padding:8px 0;background:var(--page-bg)}.catalog-search{height:42px;display:flex;align-items:center;gap:8px;flex:1;padding:0 12px;border:1px solid var(--border);border-radius:11px;background:var(--panel-bg);color:var(--text)}.catalog-search:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}.catalog-search input{width:100%;border:0;outline:0;background:transparent;color:var(--text-bold);font:inherit;font-size:.75rem}.catalog-toolbar select{height:42px;min-width:170px;padding:0 10px;border:1px solid var(--border);border-radius:11px;background:var(--panel-bg);color:var(--text);font-size:.72rem}.catalog-workflow{display:flex;flex-direction:column;gap:3px;padding:11px 13px;margin-bottom:18px;border:1px solid var(--border);border-radius:11px;background:var(--primary-light);color:var(--text);font-size:.64rem;line-height:1.45}.catalog-workflow strong{color:var(--primary);font-size:.67rem}.catalog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}.catalog-card{padding:18px;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);box-shadow:0 7px 22px rgba(15,23,42,.035);min-width:0}.catalog-card.is-expanded{grid-column:span 2}.catalog-card-top{display:flex;align-items:center;justify-content:space-between}.catalog-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:var(--primary-light);color:var(--primary)}.catalog-code{font:700 .62rem ui-monospace,monospace;color:var(--text);opacity:.8}.catalog-card h2{margin:15px 0 4px;font-size:.9rem;line-height:1.35;color:var(--text-bold)}.catalog-short{margin:0;color:var(--text);font-size:.68rem}.catalog-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}.catalog-meta span{padding:5px 7px;border-radius:7px;background:var(--page-bg);font-size:.58rem;color:var(--text)}.catalog-summary{display:flex;gap:12px;align-items:center;margin:15px 0 8px;font-size:.62rem;color:var(--text)}.catalog-summary strong{color:var(--text-bold)}.catalog-fast{margin-left:auto;color:var(--primary);font-weight:700}.catalog-details-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;padding:9px 0;border:0;border-top:1px solid var(--border);background:transparent;color:var(--primary);font-size:.64rem;font-weight:700;cursor:pointer}.catalog-details-toggle svg{transition:transform .2s}.catalog-details-toggle .rotate{transform:rotate(180deg)}.catalog-details{padding-top:12px}.catalog-info-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}.catalog-info{padding:9px;border:1px solid var(--border);border-radius:9px;background:var(--page-bg)}.catalog-info small{display:block;font-size:.55rem;color:var(--text);margin-bottom:3px}.catalog-info span{display:block;font-size:.62rem;color:var(--text-bold);word-break:break-word}.catalog-extra{padding:10px 12px;margin-bottom:12px;border:1px solid var(--border);border-radius:10px;background:var(--page-bg)}.catalog-extra p{margin:0 0 8px;font-size:.62rem;color:var(--text)}.catalog-extra p:last-child{margin-bottom:0}.catalog-extra-row{display:flex;gap:8px;font-size:.6rem;margin-top:5px}.catalog-extra-row strong{color:var(--text-bold);min-width:90px}.catalog-extra-row span{color:var(--text)}.parameter-table-wrap{overflow:auto;border:1px solid var(--border);border-radius:10px}.parameter-table{width:100%;min-width:790px;border-collapse:collapse;font-size:.59rem}.parameter-table th{padding:8px;background:var(--primary-light);color:var(--primary);text-align:left;white-space:nowrap}.parameter-table td{padding:8px;border-top:1px solid var(--border);color:var(--text);vertical-align:top}.parameter-table td:first-child{font-weight:700;color:var(--text-bold)}.catalog-enable{width:100%;height:38px;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px;border:1px solid var(--primary);border-radius:9px;background:var(--primary);color:#fff;font-weight:700;font-size:.68rem;cursor:pointer}.catalog-enable:disabled{cursor:default;opacity:.7}.catalog-enable.enabled{background:var(--primary-light);border-color:var(--border);color:var(--primary)}.catalog-state{min-height:170px;padding:55px;text-align:center;border:1px dashed var(--border);border-radius:16px;color:var(--text);font-size:.75rem;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}.catalog-state strong{font-size:.8rem;color:var(--text-bold)}.catalog-error{border-style:solid}.catalog-spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:catalog-spin .8s linear infinite}@keyframes catalog-spin{to{transform:rotate(360deg)}}@media(max-width:1050px){.catalog-card.is-expanded{grid-column:span 1}.catalog-info-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.catalog-page{padding:22px 16px 90px}.catalog-header{align-items:start}.catalog-stats{display:none}.catalog-toolbar{flex-direction:column;position:static}.catalog-toolbar select{width:100%}.catalog-info-grid{grid-template-columns:1fr}.catalog-grid{grid-template-columns:1fr}.catalog-card{padding:15px}}`}</style>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="catalog-stat"><strong>{value.toLocaleString()}</strong><span>{label}</span></div>;
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return <div className="catalog-info"><small>{label}</small><span>{value || 'Not specified'}</span></div>;
}

function MetaList({ label, value }: { label: string; value?: unknown }) {
  if (value == null) return null;
  const text: string = Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) ?? '' : String(value);
  if (!text) return null;
  return <div className="catalog-extra-row"><strong>{label}</strong><span>{text}</span></div>;
}

function ParameterRow({ parameter }: { parameter: CatalogParameter }) {
  const reference = parameter.referenceRange ? JSON.stringify(parameter.referenceRange) : formatReference(parameter);
  const validation = parameter.validation ? JSON.stringify(parameter.validation) : parameter.inputType === 'NUMBER' ? 'Numeric' : '—';
  const critical = parameter.criticalLow != null || parameter.criticalHigh != null ? `${parameter.criticalLow ?? '—'} / ${parameter.criticalHigh ?? '—'}` : '—';
  return <tr><td>{parameter.name}</td><td>{parameter.inputType}</td><td>{parameter.unit || '—'}</td><td>{reference}</td><td>{validation}</td><td>{critical}</td><td>{parameter.isRequired ? 'Yes' : 'No'}</td></tr>;
}

function formatReference(parameter: CatalogParameter) {
  if (parameter.normalMin != null && parameter.normalMax != null) return `${parameter.normalMin} – ${parameter.normalMax}`;
  if (parameter.normalMin != null) return `≥ ${parameter.normalMin}`;
  if (parameter.normalMax != null) return `≤ ${parameter.normalMax}`;
  return 'Lab configured';
}

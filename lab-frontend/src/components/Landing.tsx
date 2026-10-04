import { ArrowRight, Check, ClipboardCheck, FileCheck2, FlaskConical, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqItems } from '../data/faqData';

type Props = { onLoginClick: () => void; onSignupClick: () => void };

const features = [
  { icon: ClipboardCheck, title: 'Patient and order management', text: 'Register patients once, connect orders to the right tests, and keep the clinical context available throughout the reporting workflow.' },
  { icon: FlaskConical, title: 'Configurable test catalog', text: 'Define tests, specimen types, methods, parameters, departments, turnaround information, and reference ranges for repeatable result entry.' },
  { icon: FileCheck2, title: 'Verification-first reporting', text: 'Move structured results through review and verification before generating a consistent patient-facing laboratory report.' },
  { icon: ShieldCheck, title: 'Roles and workflow history', text: 'Give administrative and technical teams clear responsibilities while keeping important workflow activity available for review.' },
];

const workflow = [
  ['01', 'Register', 'Create the patient and order with the right laboratory context.'],
  ['02', 'Process', 'Link samples and enter results against configured parameters.'],
  ['03', 'Verify', 'Review required values, flags, ranges, and report context.'],
  ['04', 'Report', 'Finalize, preview, download, print, or share the completed report.'],
];

export default function Landing({ onLoginClick, onSignupClick }: Props) {
  return (
    <div className="landing-page landing-v2">
      <section className="landing-v2-hero">
        <div className="landing-v2-copy">
          <div className="landing-v2-badge"><span><Sparkles size={14} /> Laboratory reporting software for diagnostic labs</span></div>
          <h1>Run your laboratory reporting workflow from <span>patient registration to verified report.</span></h1>
          <p>PathMLT connects patients, orders, tests, samples, results, verification, report templates, and PDF delivery in one workspace for diagnostic, pathology, hospital, and independent laboratories.</p>
          <div className="landing-v2-actions">
            <button className="landing-v2-primary" onClick={onSignupClick}>Start your 30-day free trial <ArrowRight size={17} /></button>
            <a className="landing-v2-secondary" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a live demo</a>
          </div>
          <div className="landing-v2-reassurance">
            <span><Check size={15} /> 30-day free trial</span>
            <span><Check size={15} /> No payment details required to start</span>
            <span><Check size={15} /> Cancel before renewal</span>
          </div>
        </div>

        <div className="landing-v2-product" aria-label="PathMLT laboratory workspace preview">
          <div className="product-topbar"><div className="product-brand"><span>A</span><strong>PathMLT</strong></div><div className="product-status"><i /> Illustrative workflow</div></div>
          <div className="product-body">
            <aside className="product-sidebar"><small>ILLUSTRATIVE WORKSPACE</small>{['Overview', 'Orders', 'Patients', 'Reports', 'Tests'].map((item, i) => <div key={item} className={i === 0 ? 'active' : ''}><span>{item === 'Overview' ? '⌂' : item === 'Orders' ? '◫' : item === 'Patients' ? '◉' : item === 'Reports' ? '▤' : '◇'}</span>{item}</div>)}</aside>
            <div className="product-main">
              <div className="product-heading"><div><small>LABORATORY WORKSPACE</small><strong>Reporting operations</strong></div><button>+ New order</button></div>
              <div className="product-kpis"><div><small>Orders today</small><strong>128</strong><span>Patient and test context</span></div><div><small>Reports in review</small><strong>24</strong><span>Ready for verification</span></div><div><small>Workflow status</small><strong>03</strong><span>Needs attention</span></div></div>
              <div className="product-grid"><div className="product-panel chart-panel"><div><strong>Workflow activity</strong><small>Last 7 days</small></div><div className="product-chart">{[35,52,44,68,58,82,72].map((h,i)=><span key={i} style={{height: h + '%'}} />)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div><div className="product-panel queue-panel"><div><strong>Report queue</strong><small>Latest activity</small></div><div className="queue-item"><span className="queue-avatar">PR</span><span><b>Patient record</b><small>CBC · Ready for review</small></span><i>Review</i></div><div className="queue-item"><span className="queue-avatar">OR</span><span><b>Laboratory order</b><small>Lipid profile · In progress</small></span><i className="progress">Active</i></div><div className="queue-item"><span className="queue-avatar">RP</span><span><b>Final report</b><small>Thyroid panel · Draft</small></span><i className="draft">Draft</i></div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-v2-trust"><span>BUILT FOR REAL LABORATORY WORK</span><div><strong>Patients</strong><b>→</b><strong>Orders</strong><b>→</b><strong>Samples</strong><b>→</b><strong>Results</strong><b>→</b><strong>Verification</strong><b>→</b><strong>Reports</strong></div></section>

      <div className="landing-v2-action-rail"><span>See how PathMLT fits your laboratory before you commit.</span><div><a className="landing-v2-demo-btn" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a workflow demo <ArrowRight size={14} /></a><button className="landing-v2-login-btn" onClick={onLoginClick}>Login</button><button className="landing-v2-register-btn" onClick={onSignupClick}>Start trial</button></div></div>

      <section className="landing-v2-section"><div className="landing-v2-section-head"><div><span className="landing-v2-eyebrow">Built around laboratory work</span><h2>Keep every reporting stage in context.</h2></div><p>Replace disconnected spreadsheets, manual handoffs, and scattered report files with a repeatable process that your team can configure, review, and improve.</p></div><div className="landing-v2-feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title}><span className="feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p><Link to="/solutions">Explore this capability <ArrowRight size={14} /></Link></article>)}</div></section>

      <section className="landing-v2-proof-strip" aria-label="PathMLT product proof"><div><strong>See the actual product</strong><span>Use your own test panel, result workflow and report format during the free trial.</span></div><div><strong>Start small</strong><span>Move one representative order from registration to final report first.</span></div><div><strong>Get implementation help</strong><span>Talk through your workflow with the PathMLT team before committing.</span></div></section>

      <section className="landing-v2-workflow"><div className="workflow-v2-copy"><span className="landing-v2-eyebrow">A laboratory reporting workflow with clear ownership</span><h2>Make the next laboratory action obvious.</h2><p>Each stage carries the patient, order, test, sample, and result context forward so the next person can act without rebuilding the record.</p><div className="workflow-v2-list">{workflow.map(([n,t,d]) => <div key={n}><b>{n}</b><span><strong>{t}</strong><small>{d}</small></span></div>)}</div></div><div className="workflow-v2-card"><div className="workflow-card-head"><span><Zap size={15} /> Live workflow</span><small>Order in progress</small></div>{workflow.map(([n,t],i)=><div className={`workflow-card-row ${i < 3 ? 'complete' : 'next'}`} key={n}><span className="workflow-node">{i < 3 ? <Check size={13}/> : n}</span><div><strong>{t}</strong><small>{i < 3 ? 'Completed' : 'Next action'}</small></div>{i < 3 && <em>Done</em>}</div>)}<div className="workflow-card-footer"><ShieldCheck size={15}/> Verification history stays with the workflow.</div></div></section>

      <div className="landing-v2-action-rail"><span>Ready to move from manual handoffs to connected laboratory reporting?</span><div><a className="landing-v2-demo-btn" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Talk on WhatsApp <ArrowRight size={14} /></a><button className="landing-v2-login-btn" onClick={onLoginClick}>Login</button><button className="landing-v2-register-btn" onClick={onSignupClick}>Start trial</button></div></div>

      <section className="landing-v2-showcase"><div><span className="landing-v2-eyebrow">Professional laboratory reporting</span><h2>Generate a clear report from verified laboratory results.</h2><p>Use configured tests, readable parameter tables, laboratory identity, and a finalization step to produce patient-ready reports without rebuilding documents manually.</p><Link to="/pdf-reports">Explore PDF lab reports <ArrowRight size={15} /></Link></div><div className="report-mock"><div className="report-mock-head"><div><span>A</span><b>PATHMLT LABORATORY</b></div><em>FINAL REPORT</em></div><div className="report-mock-patient"><span><small>Patient</small><b>Sample patient</b></span><span><small>Report status</small><b>Verified</b></span><span><small>Delivery</small><b>Ready to share</b></span></div><div className="report-mock-table"><div><span>Parameter</span><span>Result</span><span>Reference</span><span>Status</span></div>{[['Hemoglobin','12.8 g/dL','12.0 – 16.0'],['WBC count','7.4 ×10⁹/L','4.0 – 11.0'],['Platelets','248 ×10⁹/L','150 – 450']].map(r=><div key={r[0]}><span>{r[0]}</span><b>{r[1]}</b><span>{r[2]}</span><i><Check size={10}/> Reviewed</i></div>)}</div><div className="report-mock-footer"><span><ShieldCheck size={14}/> Verification complete</span><strong>Ready to deliver</strong></div></div></section>

      <section className="landing-v2-real-report" aria-labelledby="real-report-title"><div className="landing-v2-real-report-copy"><span className="landing-v2-eyebrow">Real product report example</span><h2 id="real-report-title">Show the complete laboratory report, not only a feature list.</h2><p>This anonymized PathMLT report demonstrates a multi-panel workflow with an anemia profile, result values, high and low flags, biological reference ranges, units, and a second antenatal screening section in the same report.</p><Link to="/laboratory-reporting-software">See the reporting workflow <ArrowRight size={15} /></Link></div><figure className="landing-v2-real-report-figure"><img src="/screenshots/anemia-profile-report.png" alt="Anonymized PathMLT multi-panel laboratory report showing anemia profile results, flags, reference ranges, units, and antenatal screening section" loading="lazy" width="1590" height="1542" /><figcaption>Real PathMLT product report supplied by the laboratory; personal and account identifiers have been anonymized.</figcaption></figure></section>

      <section className="landing-v2-faq" aria-labelledby="home-faq-title"><div className="landing-v2-section-head"><div><span className="landing-v2-eyebrow">Frequently asked questions</span><h2 id="home-faq-title">Questions before you move your laboratory reporting workflow?</h2></div><p>Understand implementation, test configuration, result verification, PDF reporting, access responsibilities, and the PathMLT trial.</p></div><div className="landing-v2-faq-grid">{faqItems.slice(0, 6).map((item) => <details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div><div className="landing-v2-faq-link"><Link to="/faqs">Read all laboratory software FAQs <ArrowRight size={15} /></Link></div></section>

      <div className="landing-v2-action-rail"><span>Have a workflow question? Speak with the PathMLT team.</span><div><a className="landing-v2-demo-btn" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo <ArrowRight size={14} /></a><button className="landing-v2-login-btn" onClick={onLoginClick}>Login</button><button className="landing-v2-register-btn" onClick={onSignupClick}>Create workspace</button></div></div>

      <section className="landing-v2-bottom"><div><span className="landing-v2-eyebrow">Start with one representative workflow</span><h2>Bring patients, tests, results, and reporting into one laboratory workspace.</h2><p>Configure a core panel, invite your team, and move an order from registration to final report with a process everyone can see.</p></div><div className="landing-v2-bottom-actions"><button className="landing-v2-primary" onClick={onSignupClick}>Create workspace <ArrowRight size={17} /></button><Link to="/contact">Talk to the implementation team</Link></div></section>
    </div>
  );
}

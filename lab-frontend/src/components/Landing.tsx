import { ArrowRight, BarChart3, Check, ClipboardCheck, FileCheck2, FlaskConical, ShieldCheck, Sparkles, Users2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = { onLoginClick: () => void; onSignupClick: () => void };

const features = [
  { icon: ClipboardCheck, title: 'Patient & order management', text: 'Keep patient records, orders and samples connected from registration through completion.' },
  { icon: FlaskConical, title: 'Configurable test workflows', text: 'Set up panels, parameters, specimen types and reference ranges around how your lab operates.' },
  { icon: FileCheck2, title: 'Verification-first reporting', text: 'Move structured results through review and into consistent, patient-ready PDF reports.' },
  { icon: ShieldCheck, title: 'Roles, permissions & audit history', text: 'Give every team member the right workspace and keep important workflow actions traceable.' },
];

const workflow = [
  ['01', 'Register', 'Create the patient and order once.'],
  ['02', 'Process', 'Link samples and enter configured results.'],
  ['03', 'Verify', 'Review values, flags and required parameters.'],
  ['04', 'Deliver', 'Finalize, preview, download or print the report.'],
];

export default function Landing({ onLoginClick, onSignupClick }: Props) {
  return (
    <div className="landing-page landing-v2">
      <section className="landing-v2-hero">
        <div className="landing-v2-copy">
          <div className="landing-v2-badge"><span><Sparkles size={14} /> Laboratory operations platform</span></div>
          <h1>Run your laboratory on one <span>calm, connected workflow.</span></h1>
          <p>PathMLT brings patients, tests, samples, results and final reports into one focused workspace built for diagnostic and pathology laboratories.</p>
          <div className="landing-v2-actions">
            <button className="landing-v2-primary" onClick={onSignupClick}>Start free <ArrowRight size={17} /></button>
            <button className="landing-v2-secondary" onClick={onLoginClick}>Sign in</button>
          </div>
          <div className="landing-v2-reassurance">
            <span><Check size={15} /> Role-aware access</span>
            <span><Check size={15} /> Configurable reports</span>
            <span><Check size={15} /> Audit-ready history</span>
          </div>
        </div>

        <div className="landing-v2-product" aria-label="PathMLT product preview">
          <div className="product-topbar">
            <div className="product-brand"><span>A</span><strong>PathMLT</strong></div>
            <div className="product-status"><i /> Workspace online</div>
          </div>
          <div className="product-body">
            <aside className="product-sidebar">
              <small>WORKSPACE</small>
              {['Overview', 'Orders', 'Patients', 'Reports', 'Tests'].map((item, i) => <div key={item} className={i === 0 ? 'active' : ''}><span>{item === 'Overview' ? '⌂' : item === 'Orders' ? '◫' : item === 'Patients' ? '◉' : item === 'Reports' ? '▤' : '◇'}</span>{item}</div>)}
            </aside>
            <div className="product-main">
              <div className="product-heading"><div><small>MONDAY, 19 SEPTEMBER</small><strong>Good morning, laboratory</strong></div><button>+ New report</button></div>
              <div className="product-kpis">
                <div><small>Patients today</small><strong>128</strong><span>↑ 12% from last week</span></div>
                <div><small>Reports in review</small><strong>24</strong><span>8 ready for sign-off</span></div>
                <div><small>Critical results</small><strong>03</strong><span>Needs attention</span></div>
              </div>
              <div className="product-grid">
                <div className="product-panel chart-panel"><div><strong>Lab activity</strong><small>Last 7 days</small></div><div className="product-chart">{[35,52,44,68,58,82,72].map((h,i)=><span key={i} style={{height: h + '%'}} />)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div>
                <div className="product-panel queue-panel"><div><strong>Report queue</strong><small>Latest activity</small></div><div className="queue-item"><span className="queue-avatar">NA</span><span><b>Nashrin Ahmed</b><small>CBC · Ready for review</small></span><i>Review</i></div><div className="queue-item"><span className="queue-avatar">AM</span><span><b>Arjun Mehta</b><small>Lipid Profile · In progress</small></span><i className="progress">Active</i></div><div className="queue-item"><span className="queue-avatar">MS</span><span><b>Maya Shah</b><small>Thyroid Panel · Draft</small></span><i className="draft">Draft</i></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-v2-trust">
        <span>ONE SOURCE OF TRUTH FOR YOUR LAB</span>
        <div><strong>Patients</strong><b>→</b><strong>Orders</strong><b>→</b><strong>Samples</strong><b>→</b><strong>Results</strong><b>→</b><strong>Verification</strong><b>→</b><strong>Reports</strong></div>
      </section>

      <section className="landing-v2-section">
        <div className="landing-v2-section-head">
          <div><span className="landing-v2-eyebrow">Everything in context</span><h2>Less chasing. More work getting done.</h2></div>
          <p>Replace disconnected spreadsheets, manual handoffs and scattered report files with a workflow your team can understand at a glance.</p>
        </div>
        <div className="landing-v2-feature-grid">
          {features.map(({ icon: Icon, title, text }) => <article key={title}><span className="feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p><Link to="/solutions">Explore <ArrowRight size={14} /></Link></article>)}
        </div>
      </section>

      <section className="landing-v2-workflow">
        <div className="workflow-v2-copy"><span className="landing-v2-eyebrow">A workflow your team can follow</span><h2>Make the next action obvious.</h2><p>Each stage has a clear owner and state, so work keeps moving without asking where the latest information lives.</p><div className="workflow-v2-list">{workflow.map(([n,t,d]) => <div key={n}><b>{n}</b><span><strong>{t}</strong><small>{d}</small></span></div>)}</div></div>
        <div className="workflow-v2-card"><div className="workflow-card-head"><span><Zap size={15} /> Live workflow</span><small>Order #LAB-10482</small></div>{workflow.map(([n,t],i)=><div className={`workflow-card-row ${i < 3 ? 'complete' : 'next'}`} key={n}><span className="workflow-node">{i < 3 ? <Check size={13}/> : n}</span><div><strong>{t}</strong><small>{i < 3 ? 'Completed' : 'Next action'}</small></div>{i < 3 && <em>Done</em>}</div>)}<div className="workflow-card-footer"><ShieldCheck size={15}/> Verified steps are kept with the report history.</div></div>
      </section>

      <section className="landing-v2-showcase">
        <div><span className="landing-v2-eyebrow">Reporting without the clutter</span><h2>Professional reports, built from verified results.</h2><p>Configure your laboratory identity once, keep parameters readable, and give reviewers a focused finalization step.</p><Link to="/report-templates">Explore report templates <ArrowRight size={15} /></Link></div>
        <div className="report-mock"><div className="report-mock-head"><div><span>A</span><b>PATHMLT DIAGNOSTICS</b></div><em>FINAL REPORT</em></div><div className="report-mock-patient"><span><small>Patient</small><b>Sample patient</b></span><span><small>Report ID</small><b>LAB-10482</b></span><span><small>Status</small><b>Verified</b></span></div><div className="report-mock-table"><div><span>Parameter</span><span>Result</span><span>Reference</span><span>Status</span></div>{[['Hemoglobin','12.8 g/dL','12.0 – 16.0'],['WBC count','7.4 ×10⁹/L','4.0 – 11.0'],['Platelets','248 ×10⁹/L','150 – 450']].map(r=><div key={r[0]}><span>{r[0]}</span><b>{r[1]}</b><span>{r[2]}</span><i><Check size={10}/> Normal</i></div>)}</div><div className="report-mock-footer"><span><ShieldCheck size={14}/> Verified by technician</span><strong>Ready to share</strong></div></div>
      </section>

      <section className="landing-v2-bottom">
        <div><span className="landing-v2-eyebrow">Built to grow with your laboratory</span><h2>Start with the workflow you use every day.</h2><p>Configure your core panels, invite your team and move a representative order from registration to final report.</p></div>
        <div className="landing-v2-bottom-actions"><button className="landing-v2-primary" onClick={onSignupClick}>Create workspace <ArrowRight size={17}/></button><Link to="/contact">Talk to the team</Link></div>
      </section>
    </div>
  );
}

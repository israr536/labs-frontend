import { useEffect } from 'react';
import { ArrowRight, Check, ClipboardCheck, FileCheck2, FlaskConical, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqItems } from '../data/faqData';
import analyticsService from '../services/analyticsService';
import ReportPrintView from './ReportPrintView';
import { DEFAULT_SETTINGS, type LabReport } from '../data/samples';

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
  const sampleReport: LabReport = { id: 'PATHMLT-DEMO-10482', patientName: 'Sample Patient', age: 32, gender: 'Male', phone: '+91 98765 43210', email: 'patient@example.com', referredBy: 'Dr. Self / Walk-in', dateCollected: new Date().toISOString(), dateReported: new Date().toISOString(), testType: 'Complete Blood Count (CBC)', status: 'Completed', parameters: [{ name: 'Hemoglobin', value: '14.2', unit: 'g/dL', refRange: '13.5 - 17.5', minRef: 13.5, maxRef: 17.5, status: 'Normal' }, { name: 'White Blood Cells (WBC)', value: '7.4', unit: 'K/µL', refRange: '4.5 - 11.0', minRef: 4.5, maxRef: 11, status: 'Normal' }, { name: 'Platelet Count', value: '248', unit: 'K/µL', refRange: '150 - 450', minRef: 150, maxRef: 450, status: 'Normal' }], interpretation: 'Demonstration report generated using the PathMLT reporting workflow.' };
  const startTrial = () => { analyticsService.trackFunnelEvent('trial_clicked'); onSignupClick(); };
  useEffect(() => { analyticsService.trackFunnelEvent('landing_view'); }, []);
  return (
    <div className="landing-page landing-v2">
      <section className="landing-v2-hero">
        <div className="landing-v2-copy">
          <div className="landing-v2-badge"><span><Sparkles size={14} /> Laboratory operations platform</span></div>
          <h1>Professional lab reports, faster <span>without expensive LIS software.</span></h1>
          <p>Create, review and deliver professional diagnostic reports from one focused workflow. PathMLT gives growing laboratories the core reporting tools they need without the cost and complexity of a traditional LIS.</p>
          <div className="landing-v2-actions">
            <button className="landing-v2-primary" onClick={startTrial}>Start 30-Day Free Trial <ArrowRight size={17} /></button>
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

      <div className="landing-v2-action-rail"><span>See the report your lab can deliver with PathMLT.</span><div><a className="landing-v2-demo-btn" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo <ArrowRight size={14} /></a><button className="landing-v2-login-btn" onClick={onLoginClick}>Login</button><button className="landing-v2-register-btn" onClick={startTrial}>Start Free Trial</button></div></div>

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

      <div className="landing-v2-action-rail"><span>Ready to move from manual handoffs to a connected workflow?</span><div><a className="landing-v2-demo-btn" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo <ArrowRight size={14} /></a><button className="landing-v2-login-btn" onClick={onLoginClick}>Login</button><button className="landing-v2-register-btn" onClick={onSignupClick}>Register</button></div></div>

      <section className="landing-v2-showcase">
        <div><span className="landing-v2-eyebrow">Reporting proof</span><h2>A real PathMLT report output.</h2><p>This preview uses the same report-rendering component used by the application, so visitors can see the finished patient-ready format before signing up.</p><Link to="/report-templates">Explore report templates <ArrowRight size={15} /></Link></div>
        <div className="report-mock report-proof-real"><ReportPrintView report={sampleReport} settings={DEFAULT_SETTINGS} /></div><div className="report-mock-head"><div><span>A</span><b>PATHMLT DIAGNOSTICS</b></div><em>FINAL REPORT</em></div><div className="report-mock-patient"><span><small>Patient</small><b>Sample patient</b></span><span><small>Report ID</small><b>LAB-10482</b></span><span><small>Status</small><b>Verified</b></span></div><div className="report-mock-table"><div><span>Parameter</span><span>Result</span><span>Reference</span><span>Status</span></div>{[['Hemoglobin','12.8 g/dL','12.0 – 16.0'],['WBC count','7.4 ×10⁹/L','4.0 – 11.0'],['Platelets','248 ×10⁹/L','150 – 450']].map(r=><div key={r[0]}><span>{r[0]}</span><b>{r[1]}</b><span>{r[2]}</span><i><Check size={10}/> Normal</i></div>)}</div><div className="report-mock-footer"><span><ShieldCheck size={14}/> Verified by technician</span><strong>Ready to share</strong></div></div>
      </section>

      <section className="landing-v2-faq" aria-labelledby="home-faq-title">
        <div className="landing-v2-section-head">
          <div><span className="landing-v2-eyebrow">Frequently asked questions</span><h2 id="home-faq-title">Everything you need to know before getting started.</h2></div>
          <p>Clear answers about implementation, reporting, access, data responsibilities and how PathMLT fits into your laboratory workflow.</p>
        </div>
        <div className="landing-v2-faq-grid">
          {faqItems.slice(0, 6).map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span>+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="landing-v2-faq-link"><Link to="/faqs">View all FAQs <ArrowRight size={15} /></Link></div>
      </section>

      <div className="landing-v2-action-rail"><span>Have questions? Talk to us, sign in, or create your workspace.</span><div><a className="landing-v2-demo-btn" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo <ArrowRight size={14} /></a><button className="landing-v2-login-btn" onClick={onLoginClick}>Login</button><button className="landing-v2-register-btn" onClick={onSignupClick}>Register</button></div></div>

      <section className="landing-v2-bottom">
        <div><span className="landing-v2-eyebrow">Built to grow with your laboratory</span><h2>Start with the workflow you use every day.</h2><p>Configure your core panels, invite your team and move a representative order from registration to final report.</p></div>
        <div className="landing-v2-bottom-actions"><button className="landing-v2-primary" onClick={startTrial}>Start 30-Day Free Trial <ArrowRight size={17}/></button><Link to="/contact">Talk to the team</Link></div>
      </section>
    </div>
  );
}

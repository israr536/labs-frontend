import { ArrowRight, ClipboardCheck, FileCheck2, FlaskConical, HeartPulse, Users2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const solutions = [
  { icon: ClipboardCheck, title: 'Patient and order management', text: 'Register patients, find returning patients quickly, create laboratory orders and keep the collection workflow connected to the right patient and tests.', links: [{ label: 'Patient management', to: '/patient-management' }, { label: 'Diagnostic lab software', to: '/diagnostic-lab-software' }] },
  { icon: FlaskConical, title: 'Test and sample workflow', text: 'Add and configure tests, connect samples to orders and give laboratory teams a clear queue for entering and progressing results.', links: [{ label: 'Test management', to: '/test-management' }, { label: 'Sample management', to: '/sample-management' }] },
  { icon: FileCheck2, title: 'Result verification and reporting', text: 'Enter results, review configured parameters and reference ranges, verify findings, generate unlimited reports and share consistent professional laboratory reports.', links: [{ label: 'Result verification', to: '/result-verification' }, { label: 'Laboratory reporting', to: '/laboratory-reporting-software' }, { label: 'PDF reports', to: '/pdf-reports' }] },
  { icon: Users2, title: 'Laboratory administration', text: 'Manage team access, report templates, audit history, test configuration and operational controls from one focused laboratory management workspace.', links: [{ label: 'Laboratory management', to: '/laboratory-management-software' }, { label: 'Role-based access', to: '/role-based-access' }, { label: 'Audit trail', to: '/audit-trail' }] },
];

export default function SolutionsPage() {
  const navigate = useNavigate();

  return (
    <div className="public-saas-page solutions-page">
      <section className="solutions-hero">
        <div>
          <span className="public-eyebrow"><HeartPulse size={13} /> Solutions for diagnostic laboratories</span>
          <h1>Laboratory software that connects every step from patient registration to final report.</h1>
          <p>
            PathMLT is laboratory reporting and management software for diagnostic and pathology teams.
            It connects patients, orders, tests, samples, results, verification, unlimited report generation and report sharing in one workflow.
          </p>
          <div className="solutions-actions">
            <button className="landing-primary" onClick={() => navigate('/signup')}>Start your lab workspace <ArrowRight size={16} /></button>
            <button className="landing-secondary" onClick={() => navigate('/contact')}>Talk through your workflow</button>
          </div>
        </div>
        <div className="solutions-hero-card">
          <span className="solutions-card-kicker">THE PATHMLT LAB WORKFLOW</span>
          {['Patient registered', 'Order and sample linked', 'Results entered and verified', 'Professional report finalized'].map((step, index) => (
            <div className={`solution-flow ${index < 3 ? 'complete' : 'next'}`} key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              <small>{index < 3 ? 'Tracked in workspace' : 'Ready for sign-off'}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="solutions-proof">
        <span>DESIGNED AROUND LABORATORY REPORTING WORK</span>
        <div><strong>Connected workflow</strong><strong>Clearer verification</strong><strong>Consistent reports</strong><strong>Operational visibility</strong></div>
      </section>

      <section className="solutions-grid">
        {solutions.map(({ icon: Icon, title, text, links }) => (
          <article key={title}>
            <span className="solution-icon"><Icon size={20} /></span>
            <h2>{title}</h2>
            <p>{text}</p>
            <div className="solution-link-stack">
              {links.map((link) => <Link to={link.to} key={link.to}>{link.label} <ArrowRight size={14} /></Link>)}
            </div>
          </article>
        ))}
      </section>

      <section id="operating-model" className="solutions-model">
        <div>
          <span className="public-eyebrow">The laboratory reporting workflow</span>
          <h2>Make the next action obvious.</h2>
          <p>
            Every patient and order carries context forward. Samples stay connected to their work.
            Results move through entry and verification, and final reports follow a clear path to delivery.
          </p>
        </div>
        <div className="model-list">
          <div><b>01</b><span><strong>Capture once</strong><small>Patient, order, test and sample context travels with the work.</small></span></div>
          <div><b>02</b><span><strong>Review with confidence</strong><small>Configured parameters and reference ranges support result verification.</small></span></div>
          <div><b>03</b><span><strong>Deliver consistently</strong><small>Final laboratory reports follow your laboratory identity and layout.</small></span></div>
        </div>
      </section>

      <section className="solutions-audience">
        <div><span className="public-eyebrow">Built for different laboratory environments</span><h2>Explore the workflow by laboratory type.</h2></div>
        <div className="about-audience-links">
          <Link to="/diagnostic-labs"><strong>Diagnostic labs</strong><span>Connected daily reporting workflows.</span><ArrowRight size={14} /></Link>
          <Link to="/pathology-labs"><strong>Pathology labs</strong><span>Reporting-focused workflows for pathology teams.</span><ArrowRight size={14} /></Link>
          <Link to="/hospital-labs"><strong>Hospital labs</strong><span>Role-aware laboratory operations.</span><ArrowRight size={14} /></Link>
          <Link to="/independent-labs"><strong>Independent labs</strong><span>Practical tools for growing laboratories.</span><ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="solutions-cta">
        <div><span className="public-eyebrow">Ready for a calmer lab?</span><h2>See PathMLT with your real laboratory workflow.</h2><p>Bring your common panels, reporting requirements and the people who use them. We will show you where the product fits.</p></div>
        <button className="landing-primary" onClick={() => navigate('/contact')}>Book a workflow review <ArrowRight size={16} /></button>
      </section>
    </div>
  );
}

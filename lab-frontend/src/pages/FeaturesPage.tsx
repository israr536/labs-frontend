import { ArrowRight, CheckCircle2, FileCheck2, FlaskConical, LockKeyhole, Users2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Users2,
    title: 'Patient and order management',
    text: 'Create patient records, start laboratory orders, and carry the same patient context into testing and final reporting instead of rebuilding the record at each step.',
    links: ['/patient-management', '/diagnostic-lab-software'],
  },
  {
    icon: FlaskConical,
    title: 'Configurable test catalog',
    text: 'Define tests, specimen details, methods, departments, parameters, input types, and reference information that can be reused in everyday result entry.',
    links: ['/test-management', '/reference-ranges'],
  },
  {
    icon: FileCheck2,
    title: 'Structured result entry and verification',
    text: 'Capture numeric and qualitative results against configured parameters, then review required values, flags, and report context before finalization.',
    links: ['/result-entry', '/result-verification'],
  },
  {
    icon: CheckCircle2,
    title: 'Report templates and PDF delivery',
    text: 'Use reusable report structures to create consistent patient-facing documents that can be previewed, downloaded, printed, and shared through supported device options.',
    links: ['/report-templates', '/pdf-reports'],
  },
  {
    icon: LockKeyhole,
    title: 'Roles and workflow history',
    text: 'Keep administrative, technical, and operational responsibilities separate with authenticated access and reviewable workflow activity.',
    links: ['/role-based-access', '/audit-trail'],
  },
];

export default function FeaturesPage() {
  return (
    <div className="public-saas-page solutions-page">
      <section className="solutions-hero">
        <div>
          <span className="public-eyebrow"><CheckCircle2 size={13} /> PathMLT laboratory software features</span>
          <h1>Laboratory software features built around the path from patient to final report.</h1>
          <p>PathMLT brings patient records, laboratory orders, configurable tests, samples, structured results, verification, report templates, PDF reporting, access controls, and workflow history into one connected workspace.</p>
          <div className="solutions-actions">
            <Link className="landing-primary" to="/signup">Start the 30-day trial <ArrowRight size={16} /></Link>
            <Link className="landing-secondary" to="/contact">Discuss your workflow</Link>
          </div>
        </div>
        <div className="solutions-hero-card">
          <span className="solutions-card-kicker">CORE CAPABILITIES</span>
          {['Capture patient and order context', 'Configure reusable laboratory tests', 'Enter and verify results', 'Generate the final report'].map((step, index) => (
            <div className={`solution-flow ${index < 3 ? 'complete' : 'next'}`} key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
              <small>{index < 3 ? 'Connected in the workspace' : 'Ready for delivery'}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="solutions-proof">
        <span>WHAT THE WORKSPACE CONNECTS</span>
        <div><strong>Patients</strong><strong>Orders</strong><strong>Tests</strong><strong>Results</strong><strong>Verification</strong><strong>Reports</strong></div>
      </section>

      <section className="solutions-grid" aria-label="PathMLT features">
        {features.map(({ icon: Icon, title, text, links }) => (
          <article key={title}>
            <span className="solution-icon"><Icon size={20} /></span>
            <h2>{title}</h2>
            <p>{text}</p>
            <div className="solution-link-stack">
              {links.map((href) => (
                <Link to={href} key={href}>
                  Explore {href === '/patient-management' ? 'patient management' : href === '/diagnostic-lab-software' ? 'diagnostic lab software' : href.replace('/', '').replaceAll('-', ' ')}
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="solutions-model">
        <div>
          <span className="public-eyebrow">How the features work together</span>
          <h2>Evaluate the whole workflow, not isolated screens.</h2>
          <p>The value of a laboratory software feature depends on what happens before and after it. PathMLT is organized so patient, test, result, verification, and report data can move through a connected operational sequence.</p>
        </div>
        <div className="model-list">
          <div><b>01</b><span><strong>Configure once</strong><small>Set up recurring tests, parameters, reference information, report structure, and team responsibilities.</small></span></div>
          <div><b>02</b><span><strong>Operate consistently</strong><small>Use the same workflow for patient intake, testing, result entry, review, and report generation.</small></span></div>
          <div><b>03</b><span><strong>Review before release</strong><small>Use verification, access controls, and workflow history to support accountable final reporting.</small></span></div>
        </div>
      </section>

      <section className="solutions-audience">
        <div>
          <span className="public-eyebrow">Explore by capability</span>
          <h2>Start with the part of laboratory work you need to improve.</h2>
          <p>Use the detailed capability pages to compare what the workflow requires and how the pieces connect.</p>
        </div>
        <div className="about-audience-links">
          <Link to="/patient-management"><strong>Patient management</strong><span>Keep patient, order, test, and report context connected.</span><ArrowRight size={14} /></Link>
          <Link to="/test-management"><strong>Test management</strong><span>Configure reusable tests, parameters, and reference data.</span><ArrowRight size={14} /></Link>
          <Link to="/result-verification"><strong>Result verification</strong><span>Review completed results before final report release.</span><ArrowRight size={14} /></Link>
          <Link to="/pdf-reports"><strong>PDF laboratory reports</strong><span>Turn finalized results into consistent patient-facing documents.</span><ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="solutions-cta">
        <div>
          <span className="public-eyebrow">See the features in your workflow</span>
          <h2>Bring one representative laboratory order to the conversation.</h2>
          <p>Tell us the tests, report format, team roles, and handoffs your laboratory uses. Then evaluate the features against that real workflow.</p>
        </div>
        <Link className="landing-primary" to="/contact">Request a workflow review <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}

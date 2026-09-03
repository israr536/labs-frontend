type Props = {
  onLoginClick: () => void;
  onSignupClick: () => void;
};

export default function Landing({ onLoginClick, onSignupClick }: Props) {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Modern Laboratory Intelligence</span>
          <h1>Powerful lab reporting made fast, accurate, and compliant.</h1>
          <p>
            Designed for medical labs and diagnostics centers that need polished reports,
            streamlined workflows, and secure patient management without the clutter.
          </p>
          <div className="landing-actions">
            <button className="btn-primary" onClick={onSignupClick}>Create Account</button>
            <button className="btn-ghost" onClick={onLoginClick}>Sign In</button>
          </div>

          <div className="hero-stats">
            <div>
              <strong>99%+</strong>
              <span>Accuracy in report delivery</span>
            </div>
            <div>
              <strong>1,200+</strong>
              <span>Labs supported globally</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Secure patient data access</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-badge">Trusted by labs</div>
          <div className="panel-copy">
            <h2>Analytics, patient flow, and lab compliance in one place.</h2>
            <p>
              Keep every report, test, and patient record connected with a single lab-ready platform.
            </p>
          </div>
          <div className="hero-feature-grid">
            <article>
              <strong>Fast report generation</strong>
              <p>Automate report creation from test results and save time.</p>
            </article>
            <article>
              <strong>Review queue</strong>
              <p>Control approvals and finalization with built-in review stages.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-highlights">
        <div className="section-heading-full">
          <h2>Key lab capabilities</h2>
          <p>Everything your global lab team needs to move faster and stay compliant.</p>
        </div>
        <div className="highlight-grid">
          <article className="highlight-card">
            <strong>Automated reporting</strong>
            <p>Generate structured lab reports with accurate results and faster turnaround.</p>
          </article>
          <article className="highlight-card">
            <strong>Patient management</strong>
            <p>Store patient records, sample history, and contact details in one secure system.</p>
          </article>
          <article className="highlight-card">
            <strong>Compliance workflows</strong>
            <p>Track audits, approvals, and report sign-off with transparent controls.</p>
          </article>
          <article className="highlight-card">
            <strong>Workflow automation</strong>
            <p>Keep lab teams aligned with tests, review queues, and result approvals.</p>
          </article>
        </div>
      </section>

      <section className="landing-features">
        <h2>More features to power your lab</h2>
        <div className="feature-panel-grid">
          <div className="feature-panel-card">
            <h3>Fast onboarding</h3>
            <p>Quickly add labs and staff accounts so teams can start reporting immediately.</p>
          </div>
          <div className="feature-panel-card">
            <h3>Real-time dashboards</h3>
            <p>Monitor test status, pending approvals, and lab activity in one view.</p>
          </div>
          <div className="feature-panel-card">
            <h3>Secure data storage</h3>
            <p>Protect lab and patient information with secure authentication and role-based access.</p>
          </div>
          <div className="feature-panel-card">
            <h3>Clear compliance records</h3>
            <p>Maintain audit trails for every report, sample, and technical review.</p>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          min-height: calc(100vh - var(--header-height, 64px));
          padding: 48px 24px 64px;
          background: radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 28%),
            radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.1), transparent 32%),
            var(--app-bg, #f8fbff);
          display: grid;
          gap: 48px;
        }
        .hero-section {
          width: min(1240px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
          gap: 32px;
          align-items: stretch;
        }
        .hero-copy {
          padding: 42px 42px 36px;
          border-radius: 32px;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 36px 90px rgba(15,23,42,0.08);
          border: 1px solid rgba(148,163,184,0.16);
          display: grid;
          gap: 28px;
        }
        .hero-copy h1 {
          margin: 0;
          font-size: clamp(2.6rem, 3.4vw, 3.8rem);
          line-height: 1.02;
          max-width: 760px;
          color: var(--text-bold);
        }
        .hero-copy p {
          margin: 0;
          color: var(--text);
          font-size: 1.05rem;
          line-height: 1.85;
          max-width: 620px;
        }
        .landing-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .hero-stats div {
          padding: 18px 20px;
          border-radius: 18px;
          background: rgba(249,251,255,0.9);
          border: 1px solid rgba(148,163,184,0.14);
        }
        .hero-stats strong {
          display: block;
          font-size: 1.35rem;
          color: var(--text-bold);
          margin-bottom: 8px;
        }
        .hero-stats span {
          color: var(--text);
          font-size: 0.98rem;
          line-height: 1.7;
        }
        .hero-panel {
          display: grid;
          gap: 20px;
          padding: 32px;
          border-radius: 32px;
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(148,163,184,0.16);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
        }
        .panel-badge {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(59,130,246,0.12);
          color: var(--primary);
          font-weight: 700;
          font-size: 0.9rem;
              justify-content: center;
    align-items: center;
        }
        .panel-copy h2 {
          margin: 0;
          font-size: 1.35rem;
          color: var(--text-bold);
        }
        .panel-copy p {
          margin: 8px 0 0;
          color: var(--text);
          line-height: 1.8;
        }
        .hero-feature-grid {
          display: grid;
          gap: 16px;
        }
        .hero-feature-grid article {
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(246,250,255,0.88);
          border: 1px solid rgba(148,163,184,0.12);
        }
        .hero-feature-grid strong {
          display: block;
          margin-bottom: 10px;
          color: var(--text-bold);
        }
        .hero-feature-grid p {
          margin: 0;
          color: var(--text);
          line-height: 1.75;
        }
        .landing-highlights,
        .landing-features {
          width: min(1240px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 28px;
        }
        .section-heading-full h2 {
          margin: 0;
          font-size: 2rem;
          color: var(--text-bold);
        }
        .section-heading-full p {
          margin: 8px 0 0;
          color: var(--text);
          line-height: 1.8;
          max-width: 720px;
        }
        .highlight-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .highlight-card,
        .feature-panel-card {
          padding: 26px 24px;
          border-radius: 24px;
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(148,163,184,0.16);
          box-shadow: 0 24px 70px rgba(15,23,42,0.06);
        }
        .highlight-card strong,
        .feature-panel-card h3 {
          display: block;
          margin-bottom: 14px;
          color: var(--text-bold);
          font-size: 1.05rem;
        }
        .highlight-card p,
        .feature-panel-card p {
          margin: 0;
          color: var(--text);
          line-height: 1.85;
        }
        .feature-panel-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        @media (max-width: 1040px) {
          .hero-section { grid-template-columns:1fr; }
          .highlight-grid,
          .feature-panel-grid { grid-template-columns:1fr 1fr; }
        }
        @media (max-width: 760px) {
          .landing-page { padding: 32px 18px 48px; }
          .hero-copy,
          .hero-panel,
          .highlight-card,
          .feature-panel-card { border-radius: 24px; }
          .hero-stats { grid-template-columns:1fr; }
          .highlight-grid,
          .feature-panel-grid { grid-template-columns:1fr; }
        }
        @media (max-width: 500px) {
          .hero-copy h1 { font-size: 2.2rem; }
          .landing-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

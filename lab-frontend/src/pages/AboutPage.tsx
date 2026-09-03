export default function AboutPage() {
  return (
    <div className="public-page page-shell">
      <section className="page-hero">
        <div>
          <span className="eyebrow">About ApexLab</span>
          <h1>Built for clinical teams that need fast, reliable laboratory reporting.</h1>
          <p>
            ApexLab combines modern workflows, clear report generation, and secure
            patient data handling so labs can focus on delivering results.
          </p>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h3>Our mission</h3>
          <p>
            To empower healthcare teams with intuitive lab reporting tools that are
            simple, secure, and scalable across clinical environments.
          </p>
        </article>
        <article className="feature-card">
          <h3>Our promise</h3>
          <p>
            Easy report creation, accurate diagnostics, and polished outputs that
            doctors and patients can trust.
          </p>
        </article>
        <article className="feature-card">
          <h3>Our approach</h3>
          <p>
            Design first, compliance always, with a practical workflow for lab
            operators, receptionists, and technicians.
          </p>
        </article>
      </section>

      <section className="page-section">
        <div className="section-copy">
          <h2>Delivering clarity in every report</h2>
          <p>
            From patient intake to final PDF output, ApexLab helps your staff move
            quickly through each step of the laboratory process with confidence.
          </p>
        </div>
        <div className="section-list">
          <div className="section-item">
            <h4>Secure patient data</h4>
            <p>All records are handled with privacy and security as top priorities.</p>
          </div>
          <div className="section-item">
            <h4>Built for teams</h4>
            <p>Role-based access means admins, technicians, and receptionists each have the right tools.</p>
          </div>
          <div className="section-item">
            <h4>Modern workflows</h4>
            <p>Fast lookups, clear dashboards, and easy report edits keep your lab moving.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

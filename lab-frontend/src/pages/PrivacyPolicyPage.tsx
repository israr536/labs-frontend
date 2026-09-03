export default function PrivacyPolicyPage() {
  return (
    <div className="public-page page-shell">
      <section className="page-hero">
        <div>
          <span className="eyebrow">Privacy Policy</span>
          <h1>Patient privacy and data protection are at the center of ApexLab.</h1>
          <p>
            We only use the minimum information needed to run clinical lab reports
            and we protect that data with industry-standard safeguards.
          </p>
        </div>
      </section>

      <section className="policy-grid">
        <article className="policy-card glass-panel">
          <h3>Data We Collect</h3>
          <p>
            We collect patient details, test metadata, report records, and user
            account information necessary for clinical workflows.
          </p>
        </article>
        <article className="policy-card glass-panel">
          <h3>How We Use Data</h3>
          <p>
            Information is used solely to create reports, manage accounts, and
            support your lab operations. Data is never sold.
          </p>
        </article>
        <article className="policy-card glass-panel">
          <h3>Security Practices</h3>
          <p>
            We protect your data with secure authentication, encrypted storage,
            and access controls tailored for clinical environments.
          </p>
        </article>
      </section>

      <section className="page-section">
        <h2>What you can expect</h2>
        <ul className="policy-list">
          <li>Minimal collection: only essential medical and administrative data.</li>
          <li>Confidentiality: patient information remains within your lab.</li>
          <li>Transparency: we do not sell, trade, or market your records.</li>
          <li>Compliance-first: built for secure lab usage and controlled access.</li>
        </ul>
      </section>
    </div>
  );
}

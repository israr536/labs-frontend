export default function PricingPage() {
  return (
    <div className="public-page page-shell">
      <section className="page-hero">
        <div>
          <span className="eyebrow">Pricing</span>
          <h1>Simple, fair pricing for modern lab reporting.</h1>
          <p>
            Choose the plan that fits your clinical team and scale your operations
            with confidence.
          </p>
        </div>
      </section>

      <section className="feature-grid pricing-grid">
        <article className="pricing-card">
          <span className="badge badge-pending">Starter</span>
          <h3>$19 / month</h3>
          <p>Perfect for small clinics and pilot programs.</p>
          <ul>
            <li>Manage patients</li>
            <li>Create and print reports</li>
            <li>Basic test catalog</li>
            <li>Email support</li>
          </ul>
          <button className="btn btn-ghost">Start trial</button>
        </article>

        <article className="pricing-card pricing-card-featured">
          <span className="badge badge-success">Professional</span>
          <h3>$49 / month</h3>
          <p>Ideal for scaling diagnostic centers.</p>
          <ul>
            <li>Unlimited reports</li>
            <li>PDF export</li>
            <li>Priority support</li>
            <li>Advanced workflows</li>
          </ul>
          <button className="btn btn-primary">Choose plan</button>
        </article>

        <article className="pricing-card">
          <span className="badge badge-info">Enterprise</span>
          <h3>Custom</h3>
          <p>Custom plans for large labs and integrations.</p>
          <ul>
            <li>Dedicated account support</li>
            <li>Custom onboarding</li>
            <li>Advanced security</li>
            <li>Flexible deployment</li>
          </ul>
          <button className="btn btn-ghost">Contact sales</button>
        </article>
      </section>
    </div>
  );
}

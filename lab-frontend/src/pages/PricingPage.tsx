import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RazorpayPaymentButton } from '../components/RazorpayPlans';

const plans = [
  {
    name: 'Monthly',
    price: '₹299',
    period: '/ month',
    description: 'A practical starting plan for laboratories moving patient, test, result and reporting workflows online.',
    features: ['Unlimited report generation', 'Report sharing & PDF delivery', 'Patient management', 'Test catalog & new test setup', 'Team access'],
    featured: false,
  },
  {
    name: 'Yearly',
    price: '₹2,499',
    period: '/ year',
    description: 'For laboratories ready to standardize reporting, verification and day-to-day operations throughout the year.',
    features: ['Everything in Monthly', 'Unlimited report generation', 'Report sharing & PDF delivery', 'Add and configure new tests', 'Result verification', 'Audit-ready history', 'Priority support'],
    featured: true,
  },
  {
    name: 'Custom',
    price: 'Custom',
    period: '',
    description: 'For laboratory networks requiring higher capacity, rollout support, workflow planning or integration guidance.',
    features: ['Everything in Yearly', 'Unlimited report generation', 'Report sharing & PDF delivery', 'Test configuration support', 'Custom onboarding', 'Dedicated support', 'Integration planning'],
    featured: false,
  },
];

interface PricingPageProps { isAuthenticated: boolean; onLogin: () => void; }

export default function PricingPage({ isAuthenticated, onLogin }: PricingPageProps) {
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    navigate('/dashboard', { replace: true });
    window.location.reload();
  };

  return (
    <div className="public-saas-page">
      <section className="pricing-hero">
        <div>
          <span className="public-eyebrow"><Sparkles size={13} /> Laboratory software pricing</span>
          <h1>Simple pricing for laboratory reporting software.</h1>
          <p>
            Start with a 30-day free trial, then choose a paid PathMLT plan for unlimited report generation,
            report sharing, test configuration, result verification and professional laboratory reporting.
          </p>
          <div className="solutions-actions">
            <button className="landing-primary" onClick={() => onLogin()}>
              Start your lab workspace <ArrowRight size={16} />
            </button>
            <Link className="landing-secondary" to="/laboratory-reporting-software">
              Explore laboratory reporting
            </Link>
          </div>
        </div>
        <div className="pricing-note">
          <ShieldCheck size={18} />
          <span>
            <strong>30-day free trial</strong>
            <small>Use PathMLT during your first 30 days. After the trial ends, choose Monthly or Yearly to continue workspace access.</small>
          </span>
        </div>
      </section>

      <section className="pricing-grid-new" aria-label="PathMLT pricing plans">
        {plans.map((plan) => (
          <article className={`pricing-card-new ${plan.featured ? 'featured' : ''}`} key={plan.name}>
            {plan.featured && <div className="popular-ribbon">Best value</div>}
            <span className="pricing-name">{plan.name}</span>
            <div className="pricing-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
            <p>{plan.description}</p>
            <div className="pricing-divider" />
            <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
            {plan.name === 'Custom' ? (
              <button className="pricing-btn" onClick={() => navigate('/contact')}>
                Talk to us <ArrowRight size={15} />
              </button>
            ) : isAuthenticated ? (
              <RazorpayPaymentButton
                plan={plan.name === 'Monthly' ? 'MONTHLY' : 'YEARLY'}
                className={plan.featured ? 'pricing-btn primary' : 'pricing-btn'}
                onSuccess={handlePaymentSuccess}
              >
                Pay {plan.price}
              </RazorpayPaymentButton>
            ) : (
              <button className={plan.featured ? 'pricing-btn primary' : 'pricing-btn'} onClick={onLogin}>
                Login to pay <ArrowRight size={15} />
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="pricing-explainer">
        <div>
          <span className="public-eyebrow">Choose by workflow</span>
          <h2>Match your laboratory software plan to the work you need to manage.</h2>
          <p>
            PathMLT brings patients, orders, tests, samples, results, verification, report generation and sharing
            into one connected laboratory workflow. Start with the 30-day trial and choose a paid plan when it ends.
          </p>
        </div>
        <div className="pricing-explainer-grid">
          <div><strong>Starting a new reporting workflow?</strong><p>Use the 30-day free trial to validate patient registration, new test configuration, result entry, unlimited report generation and professional PDF sharing with your team.</p><Link to="/lab-reporting">Explore lab reporting <ArrowRight size={14} /></Link></div>
          <div><strong>Need stronger verification controls?</strong><p>Review result verification, reference ranges, audit history, role-based access and report sharing for a more controlled laboratory workflow.</p><Link to="/result-verification">Explore result verification <ArrowRight size={14} /></Link></div>
          <div><strong>Comparing laboratory systems?</strong><p>See how PathMLT connects daily lab operations with test setup, unlimited report generation and sharing instead of treating reporting as a separate final step.</p><Link to="/solutions">Explore solutions <ArrowRight size={14} /></Link></div>
        </div>
      </section>

      <section className="pricing-bottom">
        <strong>Need help choosing a laboratory software plan?</strong>
        <span>Talk through your reporting workflow, team size and implementation requirements with the PathMLT team.</span>
        <button onClick={() => navigate('/contact')}>Contact our team <ArrowRight size={14} /></button>
      </section>
    </div>
  );
}

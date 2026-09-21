import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { RazorpayPaymentButton } from '../components/RazorpayPlans';

const plans = [
  {
    name: 'Monthly',
    price: '₹299',
    period: '/ month',
    description: 'A practical starting plan for laboratories moving patient, test, result and reporting workflows online.',
    features: ['Patient management', 'Core test catalog', 'Report creation', 'Team access'],
    featured: false,
  },
  {
    name: 'Yearly',
    price: '₹2,499',
    period: '/ year',
    description: 'For laboratories ready to standardize reporting, verification and day-to-day operations throughout the year.',
    features: ['Everything in Monthly', 'Advanced reporting workflow', 'Result verification', 'Audit-ready history', 'Priority support'],
    featured: true,
  },
  {
    name: 'Custom',
    price: 'Custom',
    period: '',
    description: 'For laboratory networks requiring higher capacity, rollout support, workflow planning or integration guidance.',
    features: ['Everything in Yearly', 'Higher limits', 'Custom onboarding', 'Dedicated support', 'Integration planning'],
    featured: false,
  },
];

interface PricingPageProps { isAuthenticated: boolean; onLogin: () => void; }

export default function PricingPage({ isAuthenticated, onLogin }: PricingPageProps) {
  const navigate = useNavigate();

  return (
    <div className="public-saas-page">
      <section className="pricing-hero">
        <div>
          <span className="public-eyebrow"><Sparkles size={13} /> Laboratory software pricing</span>
          <h1>Simple pricing for laboratory reporting software.</h1>
          <p>
            Choose a practical PathMLT plan for patient management, test workflows, result verification
            and professional laboratory report creation. Start small and expand as your laboratory grows.
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
          <span><strong>Free & unlimited for now</strong><small>Use PathMLT without report, user, patient or test limits while we grow the platform.</small></span>
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
              <RazorpayPaymentButton plan={plan.name === 'Monthly' ? 'MONTHLY' : 'YEARLY'} className={plan.featured ? 'pricing-btn primary' : 'pricing-btn'}>
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
            PathMLT brings patients, orders, tests, samples, results, verification and final reports
            into one connected workflow. Choose the plan that matches your current operating needs.
          </p>
        </div>
        <div className="pricing-explainer-grid">
          <div><strong>Starting a new reporting workflow?</strong><p>Use the free and unlimited launch period to validate patient registration, test configuration, result entry and professional PDF reporting with your team.</p><Link to="/lab-reporting">Explore lab reporting <ArrowRight size={14} /></Link></div>
          <div><strong>Need stronger verification controls?</strong><p>Review result verification, reference ranges, audit history and role-based access for a more controlled laboratory workflow.</p><Link to="/result-verification">Explore result verification <ArrowRight size={14} /></Link></div>
          <div><strong>Comparing laboratory systems?</strong><p>See how PathMLT connects daily lab operations with structured reporting instead of treating reporting as a separate final step.</p><Link to="/solutions">Explore solutions <ArrowRight size={14} /></Link></div>
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

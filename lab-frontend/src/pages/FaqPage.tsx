import { CircleHelp, MessageCircleQuestion } from 'lucide-react';

const faqs = [
  {
    question: 'How quickly can we start using ApexLab?',
    answer: 'Most labs can start in a few days, depending on test catalog setup, user roles, and whether you need custom report templates or onboarding support. Our team can help you configure the workspace for your workflow.'
  },
  {
    question: 'Does the platform support multi-test reports?',
    answer: 'Yes. ApexLab is designed to handle combined panels and multi-test orders. Each test is listed in sequence, making final reports easier to review and more readable for clinicians and patients.'
  },
  {
    question: 'Can we print and download PDF reports?',
    answer: 'Yes. Reports can be previewed, printed, and downloaded as clean A4 PDF documents. Templates are configurable and designed for professional diagnostic output.'
  },
  {
    question: 'Is patient data secure?',
    answer: 'Yes. The product is built around role-based access, careful workflow controls, and secure handling of laboratory data. Internal privacy controls and operational policies should still be reviewed according to local regulations.'
  },
  {
    question: 'Do you support demo requests?',
    answer: 'Yes. You can book a live demo on WhatsApp or request a product walkthrough through our contact form. We can show the workflows for patient registration, ordering, verification, and report generation.'
  },
  {
    question: 'Can we customize report templates for our brand?',
    answer: 'Yes. You can configure report design templates for different presentation styles and preferred layouts, including modern and premium clinical presentation options.'
  },
];

export default function FaqPage() {
  return (
    <div className="public-saas-page legal-page faq-page">
      <section className="legal-hero">
        <div className="legal-hero-copy">
          <span className="public-eyebrow"><CircleHelp size={13} /> FAQ</span>
          <h1>Frequently asked questions.</h1>
          <p>Everything you need to know before starting with ApexLab, from onboarding and PDF reporting to patient workflows and security.</p>
          <div className="legal-meta">
            <span><MessageCircleQuestion size={14} /> Live support available</span>
            <span>Demo requests · product onboarding · implementation support</span>
          </div>
        </div>
      </section>

      <section className="faq-list">
        {faqs.map((item, index) => (
          <details key={item.question} className="faq-item" open={index === 0}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>

      <style>{`
        .faq-page { padding-top: 24px; }
        .faq-list { display: grid; gap: 18px; max-width: 980px; margin: 0 auto; }
        .faq-item { border: 1px solid var(--border); border-radius: 18px; background: var(--panel-bg); padding: 0 20px; }
        .faq-item summary {
          list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 0; font-weight: 700; font-size: 1.1rem; color: var(--text-bold);
        }
        .faq-item summary::-webkit-details-marker { display: none; }
        .faq-item summary::after { content: '+'; font-size: 1.5rem; color: var(--primary); }
        .faq-item[open] summary::after { content: '−'; }
        .faq-item p { margin: 0 0 20px; line-height: 1.8; color: var(--text); font-size: 1rem; }
        @media (max-width: 600px) {
          .faq-item summary { font-size: 1rem; }
          .faq-item p { font-size: 0.98rem; }
        }
      `}</style>
    </div>
  );
}

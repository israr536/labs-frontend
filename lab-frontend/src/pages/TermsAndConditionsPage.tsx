import { ArrowUpRight, CheckCircle2, CreditCard, FileText, Gavel, ShieldCheck, UserCheck } from 'lucide-react';

const sections = [
  ['01', 'Acceptance of terms', 'By accessing or using ApexLab, you agree to these Terms and Conditions. If you use ApexLab for a laboratory or organization, you confirm that you are authorized to accept these terms on its behalf.'],
  ['02', 'The service', 'ApexLab provides software for laboratory workflow and report management, including patient records, orders, samples, test results, reporting and related workspace features. Features may evolve as the service develops.'],
  ['03', 'Accounts and authorized use', 'You are responsible for accurate account information, protecting credentials and ensuring that only authorized personnel access your workspace. You must not misuse the service, attempt unauthorized access or interfere with its operation.'],
  ['04', 'Laboratory and patient data', 'Your laboratory remains responsible for the information entered into ApexLab and for determining its lawful basis, accuracy, retention and appropriate use. You must comply with applicable privacy, healthcare, record-retention and professional requirements.'],
  ['05', 'Subscriptions and usage limits', 'Paid plans, trials and usage limits are governed by the plan presented at activation or purchase. Limits may apply to users, patients, tests, orders or other resources.'],
  ['06', 'Reports and clinical responsibility', 'ApexLab is software and does not provide medical diagnosis or clinical judgment. Laboratories and healthcare professionals remain responsible for reviewing, verifying and authorizing results and reports before clinical use.'],
  ['07', 'Intellectual property', 'ApexLab, its software, interface, branding and underlying technology are protected by applicable intellectual-property laws. You may not copy, reverse engineer, resell or misuse the service except as permitted by law.'],
  ['08', 'Availability and security', 'We use reasonable technical and organizational measures to protect the service and maintain availability. However, no online service can guarantee absolute security or uninterrupted operation.'],
  ['09', 'Suspension and termination', 'Access may be suspended or terminated when necessary for security, misuse, non-payment, legal compliance or material breach. Users may terminate accounts according to the applicable subscription process.'],
  ['10', 'Limitation of liability', 'To the extent permitted by applicable law, ApexLab is not responsible for indirect, incidental or consequential losses arising from use of the service. Nothing excludes liability that cannot lawfully be excluded.'],
  ['11', 'Changes to these terms', 'We may update these terms when the service, legal requirements or business practices change. Material changes will be communicated through appropriate product or account channels.'],
  ['12', 'Contact', 'Questions about these Terms and Conditions can be directed to the ApexLab support team through the contact details published on the service.'],
];

export default function TermsAndConditionsPage() {
  return (
    <div className="public-saas-page legal-page">
      <section className="legal-hero">
        <div className="legal-hero-copy">
          <span className="public-eyebrow"><FileText size={13} /> Terms & Conditions</span>
          <h1>Simple rules for a reliable laboratory workspace.</h1>
          <p>These terms explain how ApexLab may be used, what responsibilities remain with your laboratory and the principles that govern the service.</p>
          <div className="legal-meta"><span><Gavel size={14} /> Service terms</span><span>Last updated · September 2026</span></div>
        </div>
        <div className="legal-hero-card">
          <div className="legal-icon"><Gavel size={21} /></div>
          <strong>Terms at a glance</strong>
          <p>ApexLab provides the software infrastructure. Your laboratory remains responsible for authorized use, clinical decisions and compliance with applicable requirements.</p>
          <div className="legal-card-line"><CheckCircle2 size={15} /> Authorized workspace access</div>
          <div className="legal-card-line"><CheckCircle2 size={15} /> Responsible clinical use</div>
          <div className="legal-card-line"><CheckCircle2 size={15} /> Clear subscription limits</div>
        </div>
      </section>

      <section className="legal-principles">
        <div><ShieldCheck size={18} /><strong>Responsible use</strong><span>Use ApexLab only for authorized laboratory operations.</span></div>
        <div><UserCheck size={18} /><strong>Account ownership</strong><span>Keep users, permissions and credentials under control.</span></div>
        <div><CreditCard size={18} /><strong>Plan clarity</strong><span>Subscriptions and usage limits follow the selected plan.</span></div>
      </section>

      <section className="legal-layout">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-label">ON THIS PAGE</div>
          {sections.map(([number, title]) => <a href={`#terms-${number}`} key={number}><span>{number}</span>{title}</a>)}
        </aside>
        <main className="legal-document">
          <div className="legal-intro">
            <span className="legal-kicker">ApexLab Terms & Conditions</span>
            <h2>Clear expectations on both sides</h2>
            <p>These terms provide a product-level foundation for using ApexLab. They do not replace legal advice or any agreement that may apply to a specific customer, laboratory or jurisdiction.</p>
          </div>
          {sections.map(([number, title, text]) => (
            <article className="legal-section" id={`terms-${number}`} key={number}>
              <div className="legal-section-number">{number}</div>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
          <div className="legal-callout"><div><FileText size={18} /></div><div><strong>Important</strong><p>These terms are a product-level starting point and should be reviewed and adapted by qualified legal counsel before commercial launch, especially for healthcare, privacy, consumer protection and jurisdiction-specific requirements.</p></div></div>
          <div className="legal-footer-note"><span>Terms & Conditions</span><a href="/privacy">Read Privacy Policy <ArrowUpRight size={14} /></a></div>
        </main>
      </section>


    </div>
  );
}

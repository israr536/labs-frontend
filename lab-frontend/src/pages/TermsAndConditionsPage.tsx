import { FileText, ShieldCheck, CreditCard, UserCheck } from 'lucide-react';

const sections = [
  ['1. Acceptance of terms', 'By accessing or using ApexLab, you agree to these Terms and Conditions. If you are using ApexLab on behalf of a laboratory or organization, you represent that you are authorized to accept these terms for that organization.'],
  ['2. The service', 'ApexLab provides software for laboratory workflow and report management, including patient records, orders, samples, test results, report generation and related workspace features. Features may change as the service evolves.'],
  ['3. Accounts and authorized use', 'You are responsible for maintaining accurate account information, protecting your credentials and ensuring that only authorized personnel access your workspace. You must not misuse the service, attempt unauthorized access, or interfere with its operation.'],
  ['4. Laboratory and patient data', 'Your laboratory remains responsible for the data it enters into ApexLab and for determining the lawful basis, accuracy, retention and appropriate use of patient information. You must comply with applicable privacy, healthcare, record-retention and professional requirements.'],
  ['5. Subscriptions and usage limits', 'Paid plans, trial periods and usage limits are governed by the plan presented at the time of purchase or activation. Subscription limits may apply to users, patients, tests, orders or other resources.'],
  ['6. Reports and clinical responsibility', 'ApexLab is a software tool and does not provide medical diagnosis or clinical judgment. Healthcare professionals and laboratories remain responsible for reviewing, verifying and authorizing laboratory results and reports before they are used for clinical purposes.'],
  ['7. Intellectual property', 'ApexLab and its software, interface, branding and underlying technology are protected by applicable intellectual-property laws. Except for data and materials you are authorized to use, you may not copy, reverse engineer, resell or misuse the service.'],
  ['8. Availability and security', 'We use reasonable technical and organizational measures to protect the service and maintain availability, but no online service can guarantee absolute security or uninterrupted operation.'],
  ['9. Suspension and termination', 'Access may be suspended or terminated where necessary for security, misuse, non-payment, legal compliance or material breach of these terms. Where appropriate, users may terminate their account according to the applicable subscription process.'],
  ['10. Limitation of liability', 'To the extent permitted by applicable law, ApexLab is not responsible for indirect, incidental or consequential losses arising from use of the service. Nothing in these terms excludes liability that cannot lawfully be excluded.'],
  ['11. Changes to these terms', 'We may update these terms when the service, legal requirements or business practices change. Material changes will be communicated through appropriate product or account channels. Continued use after an effective update constitutes acceptance of the revised terms.'],
  ['12. Contact', 'Questions about these Terms and Conditions can be directed to the ApexLab support team through the contact details published on the service.'],
];

export default function TermsAndConditionsPage() {
  return (
    <div className="public-saas-page">
      <section className="privacy-hero">
        <span className="public-eyebrow"><FileText size={13} /> Legal</span>
        <h1>Clear terms for a dependable laboratory platform.</h1>
        <p>These Terms and Conditions explain how ApexLab may be used, what responsibilities remain with your laboratory, and the basic rules governing the service.</p>
      </section>

      <section className="privacy-principles">
        <div><ShieldCheck size={18} /><strong>Responsible use</strong><span>Use ApexLab only for authorized laboratory operations.</span></div>
        <div><UserCheck size={18} /><strong>Account ownership</strong><span>Keep users, permissions and credentials under control.</span></div>
        <div><CreditCard size={18} /><strong>Plan clarity</strong><span>Subscriptions and usage limits follow your selected plan.</span></div>
      </section>

      <section className="privacy-content">
        <div className="privacy-nav">
          <span>Terms overview</span><span>Using ApexLab</span><span>Subscriptions</span><span>Responsibility</span>
        </div>
        <div className="privacy-sections">
          {sections.map(([title, text]) => (
            <article key={title}>
              <span className="privacy-check"><ShieldCheck size={15} /></span>
              <div><h2>{title}</h2><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-note">
        <strong>Important</strong>
        <span>These terms are a product-level starting point and should be reviewed and adapted by qualified legal counsel before commercial launch, especially for healthcare, privacy, consumer protection and jurisdiction-specific requirements.</span>
      </section>
    </div>
  );
}

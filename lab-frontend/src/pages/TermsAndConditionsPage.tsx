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

      <style>{`
        .legal-page{padding:34px 0 80px}.legal-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);gap:60px;align-items:end;padding:22px 0 58px}.legal-hero-copy{max-width:820px}.legal-hero h1{font-size:clamp(2.7rem,6vw,5.6rem);line-height:.96;letter-spacing:-.06em;margin:18px 0 22px;max-width:900px}.legal-hero p{font-size:1rem;line-height:1.8;color:var(--text);max-width:690px;margin:0}.legal-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:25px;font-size:.68rem;color:var(--text)}.legal-meta span{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--border);border-radius:999px;background:var(--panel-bg)}.legal-meta span:first-child{color:var(--primary);font-weight:700}.legal-hero-card{padding:25px;border:1px solid var(--border);border-radius:22px;background:linear-gradient(145deg,var(--panel-bg),var(--surface));box-shadow:0 18px 50px rgba(15,23,42,.07)}.legal-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:var(--primary);color:#fff;margin-bottom:18px}.legal-hero-card strong{font-size:.9rem}.legal-hero-card p{font-size:.72rem;line-height:1.75;margin:9px 0 18px}.legal-card-line{display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid var(--border);font-size:.66rem;color:var(--text)}.legal-card-line svg{color:var(--success);flex:none}.legal-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.legal-principles>div{padding:20px;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);display:grid;gap:8px}.legal-principles svg{color:var(--primary)}.legal-principles strong{font-size:.74rem}.legal-principles span{font-size:.65rem;line-height:1.6;color:var(--text)}.legal-layout{display:grid;grid-template-columns:205px minmax(0,760px);gap:70px;justify-content:center;padding:85px 0 35px}.legal-sidebar{position:sticky;top:25px;align-self:start;display:grid;gap:5px}.legal-sidebar-label{font-size:.56rem;letter-spacing:.12em;font-weight:800;color:var(--muted);margin-bottom:10px}.legal-sidebar a{display:flex;gap:10px;align-items:flex-start;padding:8px 9px;border-radius:8px;color:var(--text);text-decoration:none;font-size:.63rem;line-height:1.35}.legal-sidebar a:hover{background:var(--panel-bg);color:var(--primary)}.legal-sidebar a span{font-variant-numeric:tabular-nums;color:var(--muted);font-size:.56rem}.legal-document{min-width:0}.legal-intro{padding-bottom:32px}.legal-kicker{font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:var(--primary)}.legal-intro h2{font-size:1.45rem;letter-spacing:-.025em;margin:10px 0 10px}.legal-intro p{font-size:.75rem;line-height:1.8;color:var(--text);margin:0}.legal-section{display:grid;grid-template-columns:38px 1fr;gap:18px;padding:29px 0;border-top:1px solid var(--border);scroll-margin-top:25px}.legal-section-number{width:34px;height:34px;border:1px solid var(--border);border-radius:10px;display:grid;place-items:center;font-size:.58rem;font-weight:800;color:var(--primary);background:var(--panel-bg)}.legal-section h3{font-size:.86rem;margin:2px 0 8px;letter-spacing:-.01em}.legal-section p{font-size:.72rem;line-height:1.85;color:var(--text);margin:0}.legal-callout{display:grid;grid-template-columns:38px 1fr;gap:14px;margin-top:28px;padding:19px;border:1px solid var(--border);border-radius:15px;background:var(--panel-bg)}.legal-callout>div:first-child{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--surface);color:var(--primary)}.legal-callout strong{font-size:.7rem}.legal-callout p{font-size:.66rem;line-height:1.7;color:var(--text);margin:5px 0 0}.legal-footer-note{display:flex;justify-content:space-between;align-items:center;gap:15px;padding-top:28px;margin-top:28px;border-top:1px solid var(--border);font-size:.62rem;color:var(--muted)}.legal-footer-note a{display:inline-flex;align-items:center;gap:5px;color:var(--primary);font-weight:700;text-decoration:none}.legal-footer-note a:hover{text-decoration:underline}@media(max-width:850px){.legal-hero{grid-template-columns:1fr;gap:30px}.legal-principles{grid-template-columns:1fr}.legal-layout{grid-template-columns:1fr;gap:30px;padding-top:55px}.legal-sidebar{position:static;display:flex;overflow:auto;white-space:nowrap;border-bottom:1px solid var(--border);padding-bottom:12px}.legal-sidebar-label{display:none}.legal-sidebar a{padding:7px 10px;border:1px solid var(--border);flex:none}.legal-sidebar a span{display:none}}@media(max-width:520px){.legal-page{padding:24px 15px 60px}.legal-hero{padding-bottom:40px}.legal-hero h1{font-size:clamp(2.45rem,13vw,3.5rem)}.legal-hero p{font-size:.86rem}.legal-section{grid-template-columns:32px 1fr;gap:12px}.legal-section-number{width:30px;height:30px}.legal-footer-note{align-items:flex-start;flex-direction:column}}
      `}</style>
    </div>
  );
}

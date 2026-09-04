import { ArrowUpRight, CheckCircle2, Database, Eye, FileText, LockKeyhole, ShieldCheck } from 'lucide-react';

const sections = [
  ['01', 'Information we handle', 'ApexLab processes information needed to operate laboratory workflows, including workspace accounts, patient records, orders, samples, test results and report metadata.'],
  ['02', 'How information is used', 'Information is used to provide the laboratory workspace, support authorized operations, maintain audit history, protect the service and improve reliability.'],
  ['03', 'Access and permissions', 'Workspace access is controlled through authentication and role-based permissions. Laboratories are responsible for assigning appropriate access to authorized personnel.'],
  ['04', 'Patient and laboratory data', 'Your laboratory remains responsible for the information entered into ApexLab, including its accuracy, lawful use, retention and the permissions granted to people who can access it.'],
  ['05', 'Security', 'ApexLab uses reasonable technical and organizational safeguards designed to protect account and laboratory information. No internet-connected service can guarantee absolute security.'],
  ['06', 'Retention and deletion', 'Data retention and deletion depend on the account configuration, operational requirements and applicable legal or regulatory obligations. Laboratories should maintain their own retention policies.'],
  ['07', 'Your responsibilities', 'Keep account details accurate, protect credentials, use appropriate permissions and ensure your use of ApexLab complies with applicable privacy, healthcare and professional requirements.'],
  ['08', 'Changes to this policy', 'We may update this policy as the product, legal requirements or business practices evolve. Material changes will be communicated through appropriate product or account channels.'],
];

export default function PrivacyPolicyPage() {
  return (
    <div className="public-saas-page legal-page">
      <section className="legal-hero">
        <div className="legal-hero-copy">
          <span className="public-eyebrow"><LockKeyhole size={13} /> Privacy</span>
          <h1>Privacy built into the way ApexLab works.</h1>
          <p>We design ApexLab around controlled access, purposeful data handling and clear responsibility for laboratory information.</p>
          <div className="legal-meta"><span><ShieldCheck size={14} /> Product policy</span><span>Last updated · September 2026</span></div>
        </div>
        <div className="legal-hero-card">
          <div className="legal-icon"><LockKeyhole size={21} /></div>
          <strong>Privacy at a glance</strong>
          <p>Your laboratory controls its workspace, users and operational data. ApexLab provides the software and access controls used to manage that information.</p>
          <div className="legal-card-line"><CheckCircle2 size={15} /> Role-based access</div>
          <div className="legal-card-line"><CheckCircle2 size={15} /> Traceable workflow actions</div>
          <div className="legal-card-line"><CheckCircle2 size={15} /> Purpose-driven processing</div>
        </div>
      </section>

      <section className="legal-principles">
        <div><Database size={18} /><strong>Purposeful data</strong><span>Information is handled to operate and support the service.</span></div>
        <div><LockKeyhole size={18} /><strong>Controlled access</strong><span>Workspace permissions follow authenticated team roles.</span></div>
        <div><Eye size={18} /><strong>Traceable actions</strong><span>Important workflow events are designed to remain visible.</span></div>
      </section>

      <section className="legal-layout">
        <aside className="legal-sidebar">
          <div className="legal-sidebar-label">ON THIS PAGE</div>
          {sections.map(([number, title]) => <a href={`#privacy-${number}`} key={number}><span>{number}</span>{title}</a>)}
        </aside>
        <main className="legal-document">
          <div className="legal-intro">
            <span className="legal-kicker">ApexLab Privacy Policy</span>
            <h2>How we approach laboratory information</h2>
            <p>This page gives a product-level overview of how ApexLab approaches information and account security. It should be read together with your laboratory's own policies and applicable legal requirements.</p>
          </div>
          {sections.map(([number, title, text]) => (
            <article className="legal-section" id={`privacy-${number}`} key={number}>
              <div className="legal-section-number">{number}</div>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
          <div className="legal-callout"><div><FileText size={18} /></div><div><strong>Important</strong><p>This product-level page is not a substitute for a legally reviewed privacy policy. Healthcare, privacy, record-retention and data-protection obligations can vary by jurisdiction and by laboratory.</p></div></div>
          <div className="legal-footer-note"><span>Privacy policy</span><a href="/terms">Read Terms & Conditions <ArrowUpRight size={14} /></a></div>
        </main>
      </section>

      <style>{`
        .legal-page{padding:34px 0 80px}.legal-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(300px,.6fr);gap:60px;align-items:end;padding:22px 0 58px}.legal-hero-copy{max-width:820px}.legal-hero h1{font-size:clamp(2.7rem,6vw,5.6rem);line-height:.96;letter-spacing:-.06em;margin:18px 0 22px;max-width:900px}.legal-hero p{font-size:1rem;line-height:1.8;color:var(--text);max-width:690px;margin:0}.legal-meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:25px;font-size:.68rem;color:var(--text)}.legal-meta span{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border:1px solid var(--border);border-radius:999px;background:var(--panel-bg)}.legal-meta span:first-child{color:var(--primary);font-weight:700}.legal-hero-card{padding:25px;border:1px solid var(--border);border-radius:22px;background:linear-gradient(145deg,var(--panel-bg),var(--surface));box-shadow:0 18px 50px rgba(15,23,42,.07)}.legal-icon{width:44px;height:44px;display:grid;place-items:center;border-radius:13px;background:var(--primary);color:#fff;margin-bottom:18px}.legal-hero-card strong{font-size:.9rem}.legal-hero-card p{font-size:.72rem;line-height:1.75;margin:9px 0 18px}.legal-card-line{display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid var(--border);font-size:.66rem;color:var(--text)}.legal-card-line svg{color:var(--success);flex:none}.legal-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.legal-principles>div{padding:20px;border:1px solid var(--border);border-radius:16px;background:var(--panel-bg);display:grid;gap:8px}.legal-principles svg{color:var(--primary)}.legal-principles strong{font-size:.74rem}.legal-principles span{font-size:.65rem;line-height:1.6;color:var(--text)}.legal-layout{display:grid;grid-template-columns:205px minmax(0,760px);gap:70px;justify-content:center;padding:85px 0 35px}.legal-sidebar{position:sticky;top:25px;align-self:start;display:grid;gap:5px}.legal-sidebar-label{font-size:.56rem;letter-spacing:.12em;font-weight:800;color:var(--muted);margin-bottom:10px}.legal-sidebar a{display:flex;gap:10px;align-items:flex-start;padding:8px 9px;border-radius:8px;color:var(--text);text-decoration:none;font-size:.63rem;line-height:1.35}.legal-sidebar a:hover{background:var(--panel-bg);color:var(--primary)}.legal-sidebar a span{font-variant-numeric:tabular-nums;color:var(--muted);font-size:.56rem}.legal-document{min-width:0}.legal-intro{padding-bottom:32px}.legal-kicker{font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:var(--primary)}.legal-intro h2{font-size:1.45rem;letter-spacing:-.025em;margin:10px 0 10px}.legal-intro p{font-size:.75rem;line-height:1.8;color:var(--text);margin:0}.legal-section{display:grid;grid-template-columns:38px 1fr;gap:18px;padding:29px 0;border-top:1px solid var(--border);scroll-margin-top:25px}.legal-section-number{width:34px;height:34px;border:1px solid var(--border);border-radius:10px;display:grid;place-items:center;font-size:.58rem;font-weight:800;color:var(--primary);background:var(--panel-bg)}.legal-section h3{font-size:.86rem;margin:2px 0 8px;letter-spacing:-.01em}.legal-section p{font-size:.72rem;line-height:1.85;color:var(--text);margin:0}.legal-callout{display:grid;grid-template-columns:38px 1fr;gap:14px;margin-top:28px;padding:19px;border:1px solid var(--border);border-radius:15px;background:var(--panel-bg)}.legal-callout>div:first-child{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--surface);color:var(--primary)}.legal-callout strong{font-size:.7rem}.legal-callout p{font-size:.66rem;line-height:1.7;color:var(--text);margin:5px 0 0}.legal-footer-note{display:flex;justify-content:space-between;align-items:center;gap:15px;padding-top:28px;margin-top:28px;border-top:1px solid var(--border);font-size:.62rem;color:var(--muted)}.legal-footer-note a{display:inline-flex;align-items:center;gap:5px;color:var(--primary);font-weight:700;text-decoration:none}.legal-footer-note a:hover{text-decoration:underline}@media(max-width:850px){.legal-hero{grid-template-columns:1fr;gap:30px}.legal-principles{grid-template-columns:1fr}.legal-layout{grid-template-columns:1fr;gap:30px;padding-top:55px}.legal-sidebar{position:static;display:flex;overflow:auto;white-space:nowrap;border-bottom:1px solid var(--border);padding-bottom:12px}.legal-sidebar-label{display:none}.legal-sidebar a{padding:7px 10px;border:1px solid var(--border);flex:none}.legal-sidebar a span{display:none}}@media(max-width:520px){.legal-page{padding:24px 15px 60px}.legal-hero{padding-bottom:40px}.legal-hero h1{font-size:clamp(2.45rem,13vw,3.5rem)}.legal-hero p{font-size:.86rem}.legal-section{grid-template-columns:32px 1fr;gap:12px}.legal-section-number{width:30px;height:30px}.legal-footer-note{align-items:flex-start;flex-direction:column}}
      `}</style>
    </div>
  );
}

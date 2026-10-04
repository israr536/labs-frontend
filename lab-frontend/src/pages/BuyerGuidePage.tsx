import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';

type Guide = {
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: { title: string; body: string }[];
  checklist: string[];
};

const guides: Record<string, Guide> = {
  'pathology-lab-software-india': {
    eyebrow: 'Buyer guide',
    title: 'How to Choose Pathology Lab Software in India',
    description: 'A practical guide for pathology and diagnostic labs comparing laboratory reporting software, workflow features, pricing, implementation and support.',
    intro: 'Choosing laboratory software is less about collecting the longest feature list and more about whether your team can move a real patient order from registration to a verified report without rebuilding information at every step.',
    sections: [
      { title: 'Start with the daily workflow', body: 'Map patient registration, order creation, test selection, sample handling, result entry, verification and final report delivery. The software should preserve the relationship between these stages rather than forcing staff to maintain duplicate records.' },
      { title: 'Check the test configuration', body: 'Ask how tests, parameters, units, qualitative options, reference ranges and report layouts are configured. A reusable test catalog is important because your team should not have to rebuild the same structure for every report.' },
      { title: 'Evaluate verification and access', body: 'For laboratories with multiple roles, review who can enter results, who can verify them, who can finalize reports and what workflow history is retained. These controls matter as much as the report design.' },
      { title: 'Test a real report before buying', body: 'Use a representative panel during a trial. Enter realistic results, review flags and ranges, generate the report and check whether the final document matches your laboratory format.' }
    ],
    checklist: ['Patient and order workflow', 'Configurable tests and parameters', 'Result validation and verification', 'Reusable report templates', 'PDF report generation', 'Role-aware access and workflow history', 'Clear pricing and trial terms', 'Responsive implementation support']
  },
  'pathology-lab-software-price-india': {
    eyebrow: 'Pricing guide',
    title: 'Pathology Lab Software Price in India: What to Compare',
    description: 'Understand the practical costs of pathology laboratory software in India and the features that should be included in a trial or subscription.',
    intro: 'Software price is only one part of the buying decision. Compare the recurring price with the workflows included, report generation, configuration, support, onboarding and the amount of manual work the system removes.',
    sections: [
      { title: 'Compare the complete workflow', body: 'A low monthly price is less useful if patient management, test configuration, verification or report generation require separate tools. Compare the full patient-to-report workflow instead of one feature at a time.' },
      { title: 'Look for predictable pricing', body: 'Ask whether the advertised price includes report generation, PDF output, users, backups, test configuration and support. Avoid surprises caused by essential features being sold as separate add-ons.' },
      { title: 'Use a real trial', body: 'A meaningful trial should let your team configure at least one representative test panel and produce a real report. That gives you a much better signal than a product tour alone.' },
      { title: 'Calculate operational value', body: 'Consider staff time spent re-entering patient information, preparing reports, checking missing values and correcting document inconsistencies. Those repeated tasks are where workflow software can create value.' }
    ],
    checklist: ['Monthly and annual price', 'Free-trial length', 'Report generation included', 'PDF sharing included', 'Test and parameter configuration', 'User roles and verification', 'Support and onboarding', 'Data and renewal terms']
  },
  'free-pathology-lab-software': {
    eyebrow: 'Free trial guide',
    title: 'How to Evaluate Free Pathology Lab Software for a Small Lab',
    description: 'A practical evaluation checklist for small diagnostic laboratories testing free or low-cost pathology lab software before committing.',
    intro: 'For a small laboratory, the best trial is not the one with the most features. It is the one that lets your staff prove that a real daily workflow becomes easier.',
    sections: [
      { title: 'Start with one common panel', body: 'Choose a test your laboratory performs frequently. Configure it, register a sample patient, enter results, verify them and generate the final report. This reveals workflow friction quickly.' },
      { title: 'Check how much configuration you control', body: 'Small labs still need their own tests, parameters, ranges, units, report identity and workflow responsibilities. Make sure the system can adapt to your laboratory rather than forcing a generic template.' },
      { title: 'Check the exit path', body: 'Understand what happens when a trial ends, how subscriptions renew and how your laboratory data remains available. Pricing and renewal terms should be clear before you put operational data into a system.' },
      { title: 'Measure time saved', body: 'Compare the old process with the trial workflow. Count repeated patient entry, report preparation, verification and corrections. The result should be measurable, not just visually attractive.' }
    ],
    checklist: ['One real test panel completed', 'Patient-to-report workflow tested', 'Report format checked', 'Verification tested', 'Pricing understood', 'Renewal terms understood', 'Support contact available', 'Data handling reviewed']
  },
  'lis-vs-lims-vs-lab-software': {
    eyebrow: 'Comparison guide',
    title: 'LIS vs LIMS vs Laboratory Management Software',
    description: 'Understand the practical difference between LIS, LIMS and laboratory management software when evaluating systems for a diagnostic laboratory.',
    intro: 'These terms overlap in the market. The useful comparison is not the label but the operational workflows your laboratory actually needs to control.',
    sections: [
      { title: 'LIS', body: 'A Laboratory Information System commonly focuses on clinical laboratory workflows, including patient and order context, testing, results and reporting. The exact scope varies by product.' },
      { title: 'LIMS', body: 'A Laboratory Information Management System is often used more broadly for laboratory sample, process, quality and operational management. In practice, vendors use the term differently, so evaluate the actual workflows rather than the acronym.' },
      { title: 'Laboratory management software', body: 'This is a broad market term for software coordinating laboratory operations. A product can be useful even if its marketing label differs from LIS or LIMS, provided it supports the workflows your lab requires.' },
      { title: 'How to compare products', body: 'Ask every vendor to demonstrate the same scenario: patient registration, order creation, test configuration, result entry, verification and final report. Comparing the same scenario makes product differences easier to see.' }
    ],
    checklist: ['Patient and order management', 'Sample workflow', 'Test catalog', 'Result entry', 'Verification', 'Report generation', 'Roles and audit history', 'Integrations needed by your lab']
  },
  'manual-reporting-vs-lab-software': {
    eyebrow: 'Workflow guide',
    title: 'Manual Lab Reporting vs Laboratory Software',
    description: 'Compare manual laboratory reporting with a connected software workflow and identify where diagnostic labs can reduce repeated work.',
    intro: 'Manual reporting can work at low volume, but repeated copying and document preparation create more opportunities for missing information, inconsistent formatting and avoidable review work as volume grows.',
    sections: [
      { title: 'Where manual work repeats', body: 'Staff may copy patient information, select tests, enter results, check ranges, format reports and prepare the final document repeatedly. A connected workflow can reuse structured information between these stages.' },
      { title: 'Where software helps', body: 'A laboratory system can keep patient, order and test context connected, reuse test configuration, validate required results and generate a consistent report from the same underlying data.' },
      { title: 'Keep human review', body: 'Software should make review clearer rather than pretending laboratory decisions can be eliminated. A good workflow gives authorized users a deliberate verification and finalization step.' },
      { title: 'Run a before-and-after test', body: 'Measure the time required to produce the same representative report manually and with the software. Include corrections and review time, not just typing time.' }
    ],
    checklist: ['Measure report preparation time', 'Count repeated data entry', 'Check missing-result errors', 'Compare report consistency', 'Review verification steps', 'Test PDF output', 'Measure staff adoption', 'Review total software cost']
  }
};

export default function BuyerGuidePage() {
  const { slug } = useParams();
  const guide = slug ? guides[slug] : undefined;
  useEffect(() => {
    if (!guide) return;
    document.title = `${guide.title} | PathMLT`;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', guide.description);
  }, [guide]);
  if (!guide) return <div className="public-saas-page"><section className="landing-cta"><h1>Guide not found</h1><Link className="landing-primary" to="/">Back to PathMLT <ArrowRight size={16}/></Link></section></div>;
  return <div className="public-saas-page">
    <section className="seo-hero"><span className="landing-eyebrow">{guide.eyebrow}</span><h1>{guide.title}</h1><p>{guide.intro}</p><div className="solutions-actions"><Link className="landing-primary" to="/signup">Start 30-day free trial <ArrowRight size={16}/></Link><Link className="landing-secondary" to="/contact">Talk to the PathMLT team</Link></div></section>
    <section className="seo-intent"><div className="landing-section-heading"><span className="landing-eyebrow">What to evaluate</span><h2>Use the same real workflow for every software comparison.</h2></div><div className="seo-benefit-grid">{guide.checklist.map(item=><article key={item}><CheckCircle2 size={17}/><span>{item}</span></article>)}</div></section>
    <section className="seo-implementation"><div className="landing-section-heading"><span className="landing-eyebrow">Practical guidance</span><h2>Questions worth answering before you switch systems.</h2></div><div className="seo-implementation-grid">{guide.sections.map((s,i)=><article key={s.title}><span>{String(i+1).padStart(2,'0')}</span><h3>{s.title}</h3><p>{s.body}</p></article>)}</div></section>
    <section className="landing-cta"><div><span className="landing-eyebrow">Try the workflow</span><h2>Evaluate PathMLT with a representative laboratory process.</h2><p>Use the free trial to configure one common test, move an order through result verification, and generate a final report. If your workflow needs more planning, speak with the team.</p></div><Link className="landing-primary" to="/signup">Start free trial <ArrowRight size={16}/></Link></section>
  </div>;
}

import { ArrowRight, BookOpen, CircleHelp, FileText, Headphones, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const topics = [
  { icon: BookOpen, title: 'Implementation and setup', text: 'Configure your laboratory identity, report standards, test catalog, reference ranges, and team access.' },
  { icon: FileText, title: 'Reporting operations', text: 'Follow the controlled journey from result entry and verification through finalization and report delivery.' },
  { icon: ShieldCheck, title: 'Governance and access', text: 'Understand role boundaries, workspace controls, audit history, and the operating practices that support accountability.' },
];

const answers = [
  ['What should our implementation team configure first?', 'Start with your laboratory identity and report standards, activate the panels you run most often, establish reference ranges, invite the operational team, and complete a representative test order.'],
  ['How does a report move through PathMLT?', 'A patient is registered, an order is created, samples are generated, results are entered and verified, and an authorized reviewer finalizes the report for controlled delivery.'],
  ['Can PathMLT fit our existing workflow?', 'PathMLT is designed to be configured around your tests, specimen types, methods, reference ranges, report identity, role boundaries, and team responsibilities.'],
];

export default function HelpCenterPage() {
  const navigate = useNavigate();
  return <div className="public-saas-page help-page"><section className="help-hero"><span className="public-eyebrow"><Headphones size={13} /> PathMLT implementation center</span><h1>Operational guidance for your laboratory team.</h1><p>Practical guidance for implementing PathMLT, governing daily work, and building a dependable reporting operation around your laboratory’s standards.</p><div className="help-search"><Search size={18} /><input placeholder="Search setup, reports, users, tests…" aria-label="Search PathMLT help" /></div></section><section className="help-topics">{topics.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={19} /></span><h2>{title}</h2><p>{text}</p><button onClick={() => navigate('/contact')}>Contact implementation team <ArrowRight size={14} /></button></article>)}</section><section className="help-answers"><div><span className="public-eyebrow"><CircleHelp size={13} /> Start here</span><h2>Implementation questions, answered.</h2><p>A practical starting point for laboratory owners, operations leaders, and implementation teams.</p></div><div className="answer-list">{answers.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section><section className="help-contact"><div><h2>Planning your PathMLT rollout?</h2><p>Review your departments, panels, report format, and rollout plan with the PathMLT team.</p></div><button className="landing-primary" onClick={() => navigate('/contact')}>Talk to a specialist <ArrowRight size={16} /></button></section></div>
}

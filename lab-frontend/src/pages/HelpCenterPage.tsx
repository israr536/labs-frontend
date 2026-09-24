import { ArrowRight, BookOpen, CircleHelp, FileText, Headphones, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const topics = [
  { icon: BookOpen, title: 'Configure the workspace', text: 'Set your laboratory identity, report presentation, core test catalog, parameters, reference information, and team access.' },
  { icon: FileText, title: 'Run reporting operations', text: 'Follow the order from patient registration through sample context, result entry, verification, finalization, and PDF delivery.' },
  { icon: ShieldCheck, title: 'Review access and history', text: 'Understand role responsibilities, report finalization, workflow activity, and the operating policies your laboratory controls.' },
];

const answers = [
  ['What should our implementation team configure first?', 'Start with the laboratory identity and report standards. Then configure the tests and parameters your team uses most often, add reference information, invite users, and complete one representative order from registration to final report.'],
  ['How does a laboratory order move through PathMLT?', 'The workflow begins with a patient and order. The team connects the required tests and samples, enters structured results, reviews values and flags, verifies the completed result set, and finalizes the report for delivery.'],
  ['How should we configure tests?', 'Define the test name, category, department, specimen information, method, turnaround information, and reusable parameters. Configure the fields that technicians and reviewers need to use consistently.'],
  ['How does result verification fit into daily work?', 'Result verification is the review step between entry and release. An authorized team member can check required values, flags, reference information, and report context before finalization.'],
  ['Can paid plans generate reports without a plan-level cap?', 'The current Monthly and Yearly plans are configured without an order or report-generation cap. Confirm the latest plan terms with the PathMLT team before purchase.'],
  ['How are access and data responsibilities handled?', 'Authenticated team members work within role-aware controls. Your laboratory remains responsible for assigning appropriate access, maintaining accurate information, and applying the privacy, retention, and healthcare policies relevant to its operation.'],
];

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const filteredAnswers = useMemo(() => normalized ? answers.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(normalized)) : answers, [normalized]);
  return <div className="public-saas-page help-page">
    <section className="help-hero"><span className="public-eyebrow"><Headphones size={13} /> PathMLT implementation center</span><h1>Set up a laboratory reporting workflow your team can operate consistently.</h1><p>Use this guide to plan workspace configuration, test setup, result verification, report delivery, user responsibilities, and the first implementation conversation.</p><div className="help-search"><Search size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search tests, reports, access, setup…" aria-label="Search PathMLT help" /></div></section>
    <section className="help-topics">{topics.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={19} /></span><h2>{title}</h2><p>{text}</p><Link to="/contact">Discuss implementation <ArrowRight size={14} /></Link></article>)}</section>
    <section className="help-answers"><div><span className="public-eyebrow"><CircleHelp size={13} /> Start here</span><h2>{normalized ? `Search results for “${query.trim()}”` : 'Implementation questions, answered.'}</h2><p>Use these answers as a starting point, then validate the workflow with your own laboratory team.</p></div><div className="answer-list">{filteredAnswers.length ? filteredAnswers.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>) : <div className="help-no-results"><strong>No matching guidance yet.</strong><span>Try “reports”, “tests”, “access”, or “implementation”.</span><Link to="/contact">Contact PathMLT <ArrowRight size={14} /></Link></div>}</div></section>
    <section className="help-contact"><div><h2>Planning your first PathMLT workflow?</h2><p>Review your departments, panels, report format, team roles, and rollout goals with the PathMLT team.</p></div><Link className="landing-primary" to="/contact">Request implementation guidance <ArrowRight size={16} /></Link></section>
  </div>;
}

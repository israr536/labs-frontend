import { ArrowRight, CircleHelp, FileCheck2, Headphones, LockKeyhole, Settings2 } from 'lucide-react';
import { faqGroups } from '../data/faqData';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import faqSchema from '../seo/faq-schema.json';

export default function FaqPage() {
 useEffect(() => {
  const id = 'pathmlt-faq-schema';
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
   '@context': 'https://schema.org',
   '@type': 'FAQPage',
   mainEntity: faqSchema.questions.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer }
   }))
  });
  document.head.appendChild(script);
  return () => document.getElementById(id)?.remove();
 }, []);
 return <div className="public-saas-page faq-enterprise-page">
  <section className="faq-enterprise-hero"><div><span className="public-eyebrow"><CircleHelp size={13}/> PathMLT answers</span><h1>Clarity before implementation.</h1><p>Answers for laboratory owners, operations leaders, and implementation teams evaluating a controlled workspace for patient records, testing, results, and final reporting.</p><div className="faq-hero-meta"><span><Headphones size={14}/> Implementation support available</span><span>Reporting · governance · onboarding</span></div></div><div className="faq-hero-card"><div className="faq-hero-icon"><FileCheck2 size={20}/></div><strong>Need a workflow review?</strong><p>Bring your most common panels and the people who use them. We can walk through how PathMLT fits your current operation.</p><Link to="/contact">Talk to the PathMLT team <ArrowRight size={14}/></Link></div></section>
  <section className="faq-topic-nav">{faqGroups.map(({label},index)=><a href={`#faq-group-${index+1}`} key={label}><Settings2 size={16}/><span><strong>{label}</strong><small>{faqGroups[index].items.length} answers</small></span></a>)}</section>
  <section className="faq-enterprise-body">{faqGroups.map(({label,items},index)=><section className="faq-group" id={`faq-group-${index+1}`} key={label}><div className="faq-group-heading"><span><LockKeyhole size={18}/></span><div><span className="faq-kicker">0{index+1}</span><h2>{label}</h2></div></div><div className="faq-enterprise-list">{items.map(({question,answer},itemIndex)=><details key={question} open={index===0&&itemIndex===0}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>)}</section>
  <section className="faq-enterprise-cta"><div><span className="public-eyebrow">Still evaluating?</span><h2>Make the next conversation specific.</h2><p>Tell us about your departments, panels, report format, and rollout goals.</p></div><div><Link className="landing-primary" to="/contact">Request a workflow review <ArrowRight size={16}/></Link></div></section>
 </div>;
}
import { Activity, ArrowRight, CheckCircle2, ShieldCheck, Users2, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="public-saas-page">
      <section className="about-hero">
        <div>
          <span className="public-eyebrow"><Activity size={13} /> About PathMLT</span>
          <h1>Laboratory reporting software built around how modern diagnostic teams work.</h1>
          <p>
            PathMLT is a laboratory reporting and management platform designed for diagnostic,
            pathology, hospital and independent laboratories. It connects patient registration,
            orders, tests, samples, result entry, verification and professional report delivery in one focused workflow.
          </p>
        </div>
        <div className="about-metric">
          <strong>One connected laboratory workflow</strong>
          <span>Patients → orders → tests → samples → results → verification → final reports</span>
        </div>
      </section>

      <section className="about-values">
        {[
          { icon: ShieldCheck, title: 'Controlled and traceable', text: 'Role-aware access, verification stages and audit history help teams keep laboratory work organized and accountable.' },
          { icon: Workflow, title: 'Workflow first', text: 'Each stage has a clear status so teams know what is waiting, what is ready and what is complete.' },
          { icon: Users2, title: 'Made for laboratory teams', text: 'Reception, technicians, reviewers and administrators get tools aligned with the work required to move a report forward.' },
        ].map(({ icon: Icon, title, text }) => (
          <article key={title}><span className="about-icon"><Icon size={18} /></span><h3>{title}</h3><p>{text}</p></article>
        ))}
      </section>

      <section className="about-story">
        <div><span className="landing-eyebrow">Why PathMLT</span><h2>A clearer operating layer for laboratory reporting.</h2></div>
        <div className="about-story-copy">
          <p>
            Laboratory reporting depends on accurate context moving through several stages.
            PathMLT is designed to keep patient, order, test, sample and result information connected
            while giving teams a clear path from result entry to verification and final report delivery.
          </p>
          <div className="about-checks">
            <span><CheckCircle2 size={15} /> Connected patient and order context</span>
            <span><CheckCircle2 size={15} /> Test and sample workflow</span>
            <span><CheckCircle2 size={15} /> Result review and verification stages</span>
            <span><CheckCircle2 size={15} /> Structured final laboratory reports</span>
            <span><CheckCircle2 size={15} /> Administrative visibility and access controls</span>
          </div>
        </div>
      </section>

      <section className="about-audience">
        <div>
          <span className="landing-eyebrow">Who PathMLT is for</span>
          <h2>Explore the workflow for your laboratory environment.</h2>
          <p>Different laboratory settings have different operational handoffs. Start with the workflow closest to your team.</p>
        </div>
        <div className="about-audience-links">
          <Link to="/diagnostic-labs"><strong>Diagnostic labs</strong><span>Connected daily reporting workflows.</span><ArrowRight size={14} /></Link>
          <Link to="/pathology-labs"><strong>Pathology labs</strong><span>Reporting-focused workflows for pathology teams.</span><ArrowRight size={14} /></Link>
          <Link to="/hospital-labs"><strong>Hospital labs</strong><span>Role-aware laboratory operations.</span><ArrowRight size={14} /></Link>
          <Link to="/independent-labs"><strong>Independent labs</strong><span>Practical tools for growing laboratories.</span><ArrowRight size={14} /></Link>
        </div>
      </section>

      <section className="about-story">
        <div><span className="landing-eyebrow">Explore the product</span><h2>Go deeper into the laboratory reporting workflow.</h2></div>
        <div className="about-story-copy">
          <p>Explore the specific capabilities that make up the PathMLT workflow, from patient and test management through verification and professional PDF reporting.</p>
          <div className="about-checks">
            <Link to="/patient-management">Patient management <ArrowRight size={14} /></Link>
            <Link to="/test-management">Test management <ArrowRight size={14} /></Link>
            <Link to="/sample-management">Sample management <ArrowRight size={14} /></Link>
            <Link to="/result-verification">Result verification <ArrowRight size={14} /></Link>
            <Link to="/pdf-reports">PDF reports <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="about-quote">
        <strong>Built to feel calm when the laboratory work is not.</strong>
        <span>PathMLT helps teams keep the operational picture connected so they can spend less time chasing status and more time moving reports through a clear workflow.</span>
      </section>
    </div>
  );
}

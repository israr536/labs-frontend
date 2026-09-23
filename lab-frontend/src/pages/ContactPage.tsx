import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MessageSquare, Phone, Send } from 'lucide-react';
import { submitContactInquiry, type ContactInquiry } from '../services/contactService';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [form, setForm] = useState<ContactInquiry>({ name: '', email: '', topic: 'support', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof ContactInquiry, value: string) => {
    setForm((current) => ({ ...current, [field]: value } as ContactInquiry));
    setError(null);
    setSubmitted(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitContactInquiry(form);
      setSubmitted(true);
      setForm({ name: '', email: '', topic: 'support', message: '' });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'We could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-saas-page">
      <section className="contact-hero">
        <span className="public-eyebrow"><MessageSquare size={13} /> Laboratory software support & sales</span>
        <h1>Talk to the PathMLT team about your laboratory workflow.</h1>
        <p>
          Ask about laboratory reporting software, unlimited report generation, report sharing, new test configuration, onboarding, pricing, result verification,
          report templates, integrations or day-to-day lab operations. Tell us what you need and we’ll help you map the right workflow, plan or implementation next step.
        </p>
      </section>

      <section className="contact-layout-new">
        <aside className="contact-info-new">
          <h2>How PathMLT can help</h2>
          <p>We can help laboratory teams understand the product, plan onboarding and discuss how PathMLT fits their reporting workflow.</p>
          <div className="contact-method"><span><Mail size={16} /></span><div><small>Email</small><strong>support@pathmlt.com</strong></div></div>
          <div className="contact-method"><span><Phone size={16} /></span><div><small>Support hours</small><strong>Mon–Fri · Business hours</strong></div></div>
          <div className="contact-method"><span><CheckCircle2 size={16} /></span><div><small>Topics</small><strong>Product, onboarding, pricing & workflow</strong></div></div>
          <a className="contact-method" href="tel:+916388334513"><span><Phone size={16} /></span><div><small>Phone / WhatsApp</small><strong>+91 63883 34513</strong></div></a>
        </aside>

        <div className="contact-next-steps">
          <strong>Looking for information first?</strong>
          <span>Explore the product, pricing and common laboratory workflows before contacting the team.</span>
          <div>
            <Link to="/solutions">Explore solutions <Send size={13} /></Link>
            <Link to="/pricing">View pricing <Send size={13} /></Link>
            <Link to="/faqs">Read FAQs <Send size={13} /></Link>
            <Link to="/laboratory-reporting-software">Laboratory reporting software <Send size={13} /></Link>
          </div>
        </div>

        <form className="contact-form-new" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name<input name="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your name" required maxLength={120} /></label>
            <label>Email<input type="email" name="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@lab.com" required maxLength={320} /></label>
          </div>
          <label>How can we help?<select name="topic" value={form.topic} onChange={(event) => update('topic', event.target.value)}>
            <option value="support">Product & support</option><option value="onboarding">Onboarding</option><option value="sales">Plans & pricing</option><option value="workflow">Laboratory workflow</option><option value="feedback">Product feedback</option>
          </select></label>
          <label>Message<textarea name="message" value={form.message} onChange={(event) => update('message', event.target.value)} rows={7} placeholder="Tell us about your laboratory, reporting workflow or question…" required maxLength={5000} /></label>
          {error && <p className="saas-auth-error" role="alert">{error}</p>}
          <button className="contact-submit" type="submit" disabled={loading}>{submitted ? <CheckCircle2 size={15} /> : <Send size={15} />}{loading ? 'Sending…' : submitted ? 'Message received' : 'Send message'}</button>
          {submitted && <p className="contact-success" role="status">Thanks — your message has been sent. Our team will get back to you promptly.</p>}
        </form>

        <div className="contact-cta-row"><a className="contact-whatsapp" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo on WhatsApp</a></div>
      </section>

      <section className="solutions-model">
        <div><span className="public-eyebrow">Useful next steps</span><h2>Explore the parts of PathMLT that matter to your team.</h2><p>Whether you are evaluating a laboratory reporting system, improving result verification or standardizing PDF reports, these pages explain the workflow in more detail.</p></div>
        <div className="model-list">
          <div><b>01</b><span><strong>Reporting</strong><small>See how laboratory orders, results, verification and final reports connect.</small><Link to="/lab-reporting">Explore lab reporting <ArrowRightIcon /></Link></span></div>
          <div><b>02</b><span><strong>Verification</strong><small>Understand the workflow around result review and controlled sign-off.</small><Link to="/result-verification">Explore verification <ArrowRightIcon /></Link></span></div>
          <div><b>03</b><span><strong>Reports</strong><small>Explore report templates and professional PDF report delivery.</small><Link to="/pdf-reports">Explore PDF reports <ArrowRightIcon /></Link></span></div>
        </div>
      </section>
    </div>
  );
}

function ArrowRightIcon() {
  return <span aria-hidden="true">→</span>;
}

import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, MessageSquare, Phone, Send } from 'lucide-react';
import { submitContactInquiry, type ContactInquiry } from '../services/contactService';

const initialForm: ContactInquiry = { name: '', email: '', topic: 'support', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState<ContactInquiry>(initialForm);
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
      setForm(initialForm);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'We could not send your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="public-saas-page">
    <section className="contact-hero"><span className="public-eyebrow"><MessageSquare size={13} /> Contact PathMLT</span><h1>Let’s make your lab workflow simpler.</h1><p>Questions about onboarding, the product or your workflow? Send us a message and we’ll help you find the right next step.</p></section>
    <section className="contact-layout-new">
      <aside className="contact-info-new"><h2>Talk to the PathMLT team</h2><p>We can help with product questions, onboarding and operational setup.</p><div className="contact-method"><span><Mail size={16} /></span><div><small>Email</small><strong>support@pathmlt.com</strong></div></div><div className="contact-method"><span><Phone size={16} /></span><div><small>Support hours</small><strong>Mon–Fri · Business hours</strong></div></div><div className="contact-method"><span><CheckCircle2 size={16} /></span><div><small>Response</small><strong>We’ll get back to you promptly</strong></div></div><a className="contact-method" href="tel:+916388334513"><span><Phone size={16} /></span><div><small>Phone / WhatsApp</small><strong>+91 63883 34513</strong></div></a></aside>
      <form className="contact-form-new" onSubmit={handleSubmit}><div className="form-row"><label>Name<input name="name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your name" required maxLength={120} /></label><label>Email<input type="email" name="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@lab.com" required maxLength={320} /></label></div><label>How can we help?<select name="topic" value={form.topic} onChange={(event) => update('topic', event.target.value)}><option value="support">Product & support</option><option value="onboarding">Onboarding</option><option value="sales">Plans & pricing</option><option value="feedback">Product feedback</option></select></label><label>Message<textarea name="message" value={form.message} onChange={(event) => update('message', event.target.value)} rows={7} placeholder="Tell us what you need…" required maxLength={5000} /></label>{error && <p className="saas-auth-error" role="alert">{error}</p>}<button className="contact-submit" type="submit" disabled={loading}>{submitted ? <CheckCircle2 size={15} /> : <Send size={15} />}{loading ? 'Sending…' : submitted ? 'Message received' : 'Send message'}</button>{submitted && <p className="contact-success" role="status">Thanks — your message has been sent. Our team will get back to you promptly.</p>}</form>
      <div className="contact-cta-row"><a className="contact-whatsapp" href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo." target="_blank" rel="noreferrer">Book a demo on WhatsApp</a></div>
    </section>
  </div>;
}

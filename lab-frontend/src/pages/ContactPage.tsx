import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="public-page page-shell">
      <section className="page-hero">
        <div>
          <span className="eyebrow">Contact Us</span>
          <h1>Get in touch with the ApexLab support team.</h1>
          <p>
            We are here to help with onboarding, feature requests, and technical
            support for your laboratory workflows.
          </p>
        </div>
      </section>

      <div className="contact-layout">
        <div className="contact-card glass-panel">
          <h2>Reach out directly</h2>
          <p>Questions? Send us a message or use the details below to connect.</p>

          <div className="contact-detail">
            <strong>Email</strong>
            <p>support@apexlab.com</p>
          </div>
          <div className="contact-detail">
            <strong>Phone</strong>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="contact-detail">
            <strong>Office</strong>
            <p>210 Health Avenue, Medical City, USA</p>
          </div>
        </div>

        <form
          className="contact-form glass-panel"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" type="text" name="name" placeholder="Your name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" name="email" placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" name="message" rows={6} placeholder="How can we help?" required />
          </div>
          <button type="submit" className="btn btn-primary">Send Message</button>
          {submitted && (
            <p className="success-message">Thank you! Your message has been received.</p>
          )}
        </form>
      </div>
    </div>
  );
}

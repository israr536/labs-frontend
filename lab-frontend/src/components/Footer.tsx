import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">PathMLT</div>
          <p>
            PathMLT is the operating workspace for diagnostic laboratories—connecting
            patient records, test workflows, verification, governance, and final reporting.
          </p>
          <a
            href="https://wa.me/916388334513?text=Hello%20PathMLT%2C%20I%20want%20to%20book%20a%20demo."
            target="_blank"
            rel="noreferrer"
            className="footer-demo-btn"
          >
            Book demo on WhatsApp
          </a>
        </div>

        <div>
          <h4>Product</h4>
          <nav className="footer-links">
            <Link to="/solutions">Solutions</Link>
            <Link to="/laboratory-reporting-software">Laboratory reporting</Link>
            <Link to="/diagnostic-lab-software">Diagnostic lab software</Link>
            <Link to="/pathology-lab-software">Pathology lab software</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/help">Help center</Link>
            <Link to="/patient-management">Patient management</Link>
            <Link to="/result-verification">Result verification</Link>
            <Link to="/pdf-reports">PDF reports</Link>
          </nav>
        </div>

        <div>
          <h4>Legal</h4>
          <nav className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </nav>
        </div>

        <div>
          <h4>Contact</h4>

          <p className="footer-contact">
            <a href="mailto:support@PathMLT.com">support@PathMLT.com</a>
          </p>

          <p className="footer-contact">
            <a href="tel:+916388334513">+91 63883 34513</a>
          </p>

         <p className="footer-contact">
    <strong>Hyderabad Office</strong><br />
    Hyderabad, Telangana, India
  </p>

  <p className="footer-contact">
    <strong>Noida Office</strong><br />
    Noida, Uttar Pradesh, India
  </p>
  
        </div>
      </div>
    </footer>
  );
}

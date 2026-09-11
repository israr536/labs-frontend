import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">ApexLab</div>
          <p>
            Clinical lab reporting software designed for modern diagnostic
            teams. Secure, efficient, and built to keep workflows moving.
          </p>
          <a
            href="https://wa.me/919876543210?text=Hello%20ApexLab%2C%20I%20want%20to%20book%20a%20demo."
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
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/help">Help center</Link>
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
          <p className="footer-contact">support@apexlab.com</p>
          <p className="footer-contact">+91 98765 43210</p>
          <p className="footer-contact">210 Health Avenue, Medical City</p>
        </div>
      </div>
    </footer>
  );
}

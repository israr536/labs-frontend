type Props = { page: 'pricing' | 'privacy' | 'about' };

export default function PublicPage({ page }: Props) {
  if (page === 'pricing') {
    return (
      <div className="public-page">
        <h2>Pricing</h2>
        <p>Simple, affordable pricing for clinics of all sizes. Contact sales for volume discounts.</p>
      </div>
    );
  }
  if (page === 'privacy') {
    return (
      <div className="public-page">
        <h2>Privacy Policy</h2>
        <p>We respect patient data and follow industry-standard practices. This is a demo policy.</p>
      </div>
    );
  }
  return (
    <div className="public-page">
      <h2>About Us</h2>
      <p>ApexLab — modern lab reporting built for clinicians. Designed for speed and compliance.</p>
    </div>
  );
}

import { MessageCircleMore } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/919876543210?text=Hello%20ApexLab%2C%20I%20want%20to%20book%20a%20demo.';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Book a demo on WhatsApp"
      className="whatsapp-float-button"
    >
      <MessageCircleMore size={22} />
      <span>Demo</span>
    </a>
  );
}

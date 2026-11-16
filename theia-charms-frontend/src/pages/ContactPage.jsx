import { useCatalog } from '../context/CatalogContext';
import { generalEnquiryUrl } from '../utils/whatsapp';
export default function ContactPage() {
  const { settings } = useCatalog();
  return (
    <div className="section max-w-2xl py-14 text-center">
      <h1 className="text-4xl text-brand-burgundy">Contact Us</h1><div className="gold-rule" />
      <p className="mt-8 text-brand-dark/80">📍 {settings?.address}</p>
      {settings?.email && <p className="mt-2 text-brand-dark/80">✉️ {settings.email}</p>}
      <a href={generalEnquiryUrl(settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">💬 Chat on WhatsApp</a>
      {settings?.instagramUrl && <p className="mt-6"><a className="text-brand-burgundy underline" href={settings.instagramUrl} target="_blank" rel="noopener noreferrer">📷 Follow us on Instagram</a></p>}
    </div>
  );
}

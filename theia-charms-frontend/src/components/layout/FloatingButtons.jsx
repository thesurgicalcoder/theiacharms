import { useEffect, useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { generalEnquiryUrl } from '../../utils/whatsapp';
import WhatsAppIcon from '../common/WhatsAppIcon';

export default function FloatingButtons() {
  const { settings } = useCatalog();
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const f = () => setShowTop(window.scrollY > 500); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-3">
      {showTop && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="h-10 w-10 rounded-full bg-brand-burgundy text-white shadow-lg ring-1 ring-brand-gold">↑</button>}
      <a href={generalEnquiryUrl(settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"><WhatsAppIcon className="h-7 w-7" /></a>
    </div>
  );
}

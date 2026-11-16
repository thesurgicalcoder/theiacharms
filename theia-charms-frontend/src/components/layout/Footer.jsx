import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { generalEnquiryUrl } from '../../utils/whatsapp';
import { siteImage } from '../../utils/images';
import Icon from '../common/Icons';
import WhatsAppIcon from '../common/WhatsAppIcon';

export default function Footer() {
  const { settings } = useCatalog();
  const emblem = siteImage('favicon');
  const h = 'mb-3 text-sm font-semibold text-white';
  const a = 'block py-0.5 text-sm text-white/70 hover:text-brand-goldlight';
  const soc = 'flex h-9 w-9 items-center justify-center rounded-full border border-white/40 text-white hover:bg-white/15';
  return (
    <footer className="mt-16 bg-brand-wine text-white">
      <div className="section grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div className="flex items-center gap-3">
          {emblem && <img src={emblem} alt="" className="h-16 w-16 object-contain brightness-0 invert" />}
          <div><p className="font-serif text-2xl tracking-[0.12em]">THEIA CHARMS</p><p className="text-[9px] uppercase tracking-[0.25em] text-brand-goldlight">{settings?.tagline}</p></div>
        </div>
        <div><h4 className={h}>Quick Links</h4><Link to="/" className={a}>Home</Link><Link to="/catalogue" className={a}>Categories</Link><Link to="/catalogue?collection=festive" className={a}>Collections</Link><Link to="/catalogue?collection=new" className={a}>New Arrivals</Link></div>
        <div><h4 className={h}>About Us</h4><Link to="/about" className={a}>Our Story</Link><a href="/#why" className={a}>Why Choose Us</a><Link to="/contact" className={a}>Contact</Link></div>
        <div>
          <h4 className={h}>Get in Touch</h4>
          <div className="flex gap-2">
            {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={soc}><Icon name="instagram" className="h-4 w-4" /></a>}
            <a href={generalEnquiryUrl(settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={soc}><WhatsAppIcon className="h-4 w-4" /></a>
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm text-white/70"><Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" />{settings?.address}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-3 text-center text-xs text-white/50">© {new Date().getFullYear()} THEIA CHARMS. All Rights Reserved.</div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { generalEnquiryUrl } from '../../utils/whatsapp';

export default function Footer() {
  const { settings, categories } = useCatalog();
  const h = 'mb-3 font-serif text-lg text-brand-goldlight';
  const a = 'block py-1 text-sm text-white/75 hover:text-brand-goldlight';
  return (
    <footer className="mt-20 bg-brand-wine text-white">
      <div className="section grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl tracking-[0.15em]">THEIA CHARMS</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-brand-gold">{settings?.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">Trendy, budget-friendly accessories — handpicked in Bayana for every you.</p>
        </div>
        <div><h4 className={h}>Quick Links</h4>
          <Link to="/" className={a}>Home</Link><Link to="/catalogue" className={a}>All Products</Link>
          <Link to="/catalogue?collection=new" className={a}>New Arrivals</Link><Link to="/about" className={a}>About Us</Link><Link to="/contact" className={a}>Contact</Link>
        </div>
        <div><h4 className={h}>Shop</h4>
          {categories.slice(0, 6).map((c) => <Link key={c._id} to={`/catalogue?category=${c.slug}`} className={a}>{c.name}</Link>)}
        </div>
        <div><h4 className={h}>Visit & Connect</h4>
          <p className="text-sm text-white/75">📍 {settings?.address}</p>
          <a href={generalEnquiryUrl(settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" className={a}>💬 WhatsApp</a>
          {settings?.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className={a}>📷 Instagram</a>}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} THEIA CHARMS. All rights reserved.</div>
    </footer>
  );
}

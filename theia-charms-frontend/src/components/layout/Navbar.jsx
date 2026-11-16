import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { generalEnquiryUrl } from '../../utils/whatsapp';
import { siteImage } from '../../utils/images';
import Icon from '../common/Icons';

const COLLECTIONS = [['minimal', 'Minimal Collection'], ['festive', 'Festive Collection'], ['gift', 'Gift Collection'], ['daily', 'Daily Wear']];
const link = ({ isActive }) => `text-sm transition hover:text-brand-burgundy ${isActive ? 'text-brand-burgundy font-medium' : 'text-brand-dark/80'}`;

function Dropdown({ label, items }) {
  return (
    <div className="group relative">
      <button className="text-sm text-brand-dark/80 hover:text-brand-burgundy" aria-haspopup="true">{label} ▾</button>
      <div className="invisible absolute left-0 top-full z-40 min-w-48 rounded-xl border border-brand-gold/30 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {items.map(([to, text]) => <Link key={to} to={to} className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-blush">{text}</Link>)}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { categories, settings } = useCatalog();
  const { count } = useWishlist();
  const { setWishlistOpen } = useUI();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const submit = (e) => { e.preventDefault(); nav(`/catalogue?q=${encodeURIComponent(q)}`); setSearching(false); setOpen(false); };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-gold/20 bg-brand-cream/95 backdrop-blur">
      <div className="section flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 leading-tight" onClick={() => setOpen(false)}>
          {siteImage('favicon') && <img src={siteImage('favicon')} alt="" className="h-11 w-11 object-contain" />}
          <span><span className="block font-serif text-xl font-semibold tracking-[0.14em] text-brand-burgundy">THEIA CHARMS</span>
          <span className="block text-[8px] uppercase tracking-[0.22em] text-brand-gold">{settings?.tagline}</span></span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          <NavLink to="/" end className={link}>Home</NavLink>
          <Dropdown label="Categories" items={categories.map((c) => [`/catalogue?category=${c.slug}`, `${c.icon || ''} ${c.name}`])} />
          <Dropdown label="Collections" items={COLLECTIONS.map(([k, t]) => [`/catalogue?collection=${k}`, t])} />
          <NavLink to="/catalogue?collection=new" className={link}>New Arrivals</NavLink>
          <NavLink to="/about" className={link}>About Us</NavLink>
          <NavLink to="/contact" className={link}>Contact</NavLink>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setSearching((s) => !s)} aria-label="Search" className="rounded-full p-2 text-brand-burgundy hover:bg-brand-blush"><Icon name="search" className="h-5 w-5" /></button>
          <button onClick={() => setWishlistOpen(true)} aria-label={`Wishlist, ${count} saved`} className="relative rounded-full p-2 text-brand-burgundy hover:bg-brand-blush">
            <Icon name="heart" className="h-5 w-5" />{count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-burgundy px-1 text-[10px] text-white">{count}</span>}
          </button>
          <a href={generalEnquiryUrl(settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" className="btn-primary hidden !px-4 !py-2 sm:inline-flex">💬 Enquire</a>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} className="rounded-full p-2 text-xl lg:hidden">{open ? '✕' : '☰'}</button>
        </div>
      </div>

      {searching && (
        <form onSubmit={submit} className="section pb-3">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or code (e.g. Floral, TC-001)…" className="w-full rounded-full border border-brand-gold/40 bg-white px-5 py-2.5 text-sm outline-none focus:border-brand-burgundy" />
        </form>
      )}

      {open && (
        <nav className="section space-y-1 border-t border-brand-gold/20 pb-4 pt-2 lg:hidden" aria-label="Mobile">
          {[['/', 'Home'], ['/catalogue', 'All Products'], ['/catalogue?collection=new', 'New Arrivals'], ['/catalogue?collection=festive', 'Festive Collection'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, t]) => (
            <Link key={t} to={to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-brand-blush">{t}</Link>
          ))}
          <a href={generalEnquiryUrl(settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-2 w-full">💬 Enquire on WhatsApp</a>
        </nav>
      )}
    </header>
  );
}

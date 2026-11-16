import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useUI } from '../../context/UIContext';
import { formatPrice } from '../../utils/formatters';
import ProductImage from '../common/ProductImage';

export default function Hero() {
  const { products } = useCatalog();
  const { openProduct } = useUI();
  const slides = products.filter((p) => p.isFeatured && !p.isSoldOut).slice(0, 5);
  const [i, setI] = useState(0);
  useEffect(() => { if (slides.length < 2) return undefined; const t = setInterval(() => setI((x) => (x + 1) % slides.length), 4500); return () => clearInterval(t); }, [slides.length]);
  const cur = slides[i % (slides.length || 1)];

  return (
    <section className="bg-gradient-to-br from-brand-blush to-brand-cream">
      <div className="section grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-semibold leading-tight text-brand-burgundy sm:text-5xl lg:text-6xl">Trendy Accessories for Every You! <span className="text-brand-gold">♡</span></h1>
          <p className="mt-5 text-sm tracking-wide text-brand-dark/70">Earrings | Pendants | Bracelets | Rings | Hair Accessories & More</p>
          <Link to="/catalogue" className="btn-primary mt-8">Explore Collection →</Link>
        </div>
        {cur && (
          <div className="mx-auto w-full max-w-sm">
            <button onClick={() => openProduct(cur)} className="block w-full overflow-hidden rounded-3xl border border-brand-gold bg-white p-3 text-left shadow-xl">
              <div className="relative aspect-square overflow-hidden rounded-2xl"><ProductImage product={cur} width={700} />
                <span className="absolute left-3 top-3 rounded bg-brand-wine px-2 py-1 text-[9px] tracking-[0.2em] text-brand-goldlight">THEIA CHARMS</span></div>
              <p className="mt-3 font-serif text-xl text-brand-burgundy">{cur.name}</p><p className="text-sm text-brand-dark/70">{formatPrice(cur.price)}</p>
            </button>
            {slides.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <button onClick={() => setI((x) => (x - 1 + slides.length) % slides.length)} aria-label="Previous" className="h-8 w-8 rounded-full border border-brand-gold">‹</button>
                {slides.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-brand-burgundy' : 'w-2 bg-brand-gold/50'}`} />)}
                <button onClick={() => setI((x) => (x + 1) % slides.length)} aria-label="Next" className="h-8 w-8 rounded-full border border-brand-gold">›</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

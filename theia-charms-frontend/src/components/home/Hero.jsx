import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { siteImage, safeLink } from '../../utils/images';

const CATS_LINE = 'Earrings | Pendants | Bracelets | Rings | Hair Accessories & More';

function DefaultSlide() {
  const desktop = siteImage('hero-desktop'); const mobile = siteImage('hero-mobile');
  const phone = mobile || desktop;
  return (
    <div className="relative bg-gradient-to-br from-brand-blush to-brand-cream">
      {desktop && <img src={desktop} alt="" className="absolute inset-0 hidden h-full w-full object-cover object-right md:block" />}
      <div className="absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r from-brand-blush/85 via-brand-blush/35 to-transparent md:block" />
      <div className="relative mx-auto grid max-w-[1600px] md:min-h-[440px] md:grid-cols-[46%_1fr] lg:min-h-[500px]">
        {phone && <img src={phone} alt="THEIA CHARMS accessories" className={`max-h-[480px] w-full object-cover md:hidden ${mobile ? 'aspect-[4/5]' : 'aspect-[4/3] object-right'}`} />}
        <div className="flex flex-col justify-center px-6 py-8 text-center md:px-10 md:py-12 md:text-left lg:px-16">
          <h1 className="font-serif text-4xl italic leading-tight text-brand-dark sm:text-5xl lg:text-6xl">Trendy Accessories <br className="hidden md:block" />for <span className="font-semibold text-brand-burgundy">Every You!</span> <span className="not-italic">♡</span></h1>
          <p className="mt-4 text-sm tracking-wide text-brand-dark/80">{CATS_LINE}</p>
          <div className="mt-6"><Link to="/catalogue" className="btn-primary">Explore Collection →</Link></div>
        </div>
      </div>
    </div>
  );
}

function BannerSlide({ b }) {
  const link = safeLink(b.linkUrl);
  const inner = (
    <div className="relative min-h-[320px] md:min-h-[460px]">
      <img src={b.imageUrl} alt={b.title || ''} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-deepwine/75 via-brand-deepwine/25 to-transparent" />
      <div className="relative mx-auto flex min-h-[320px] max-w-[1600px] flex-col justify-center px-6 text-white md:min-h-[460px] md:px-16">
        {b.title && <h2 className="max-w-xl font-serif text-4xl italic md:text-5xl">{b.title}</h2>}
        {b.subtitle && <p className="mt-3 max-w-md text-sm text-white/85">{b.subtitle}</p>}
      </div>
    </div>
  );
  if (!link) return inner;
  return link.startsWith('/') ? <Link to={link}>{inner}</Link> : <a href={link} target="_blank" rel="noopener noreferrer">{inner}</a>;
}

export default function Hero() {
  const { banners } = useCatalog();
  const slides = [{ id: 'default' }, ...banners.filter((b) => b.imageUrl).map((b) => ({ ...b, id: b._id }))];
  const n = slides.length;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (n < 2) return undefined;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6500);
    return () => clearInterval(t);
  }, [n, i]);
  const cur = slides[i % n];
  const arrow = 'absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-gold bg-white/90 text-lg text-brand-burgundy shadow hover:bg-white';

  return (
    <section className="relative overflow-hidden" aria-roledescription="carousel">
      {cur.id === 'default' ? <DefaultSlide /> : <BannerSlide b={cur} />}
      {n > 1 && (
        <>
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous slide" className={`${arrow} left-3`}>‹</button>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next slide" className={`${arrow} right-3`}>›</button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((s, k) => <button key={s.id} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2.5 rounded-full transition-all ${k === i ? 'w-7 bg-brand-burgundy' : 'w-2.5 bg-brand-burgundy/35'}`} />)}
          </div>
        </>
      )}
    </section>
  );
}

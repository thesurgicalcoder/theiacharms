import { Link } from 'react-router-dom';
import { siteImage } from '../../utils/images';
export default function FestiveBanner() {
  const img = siteImage('festive-banner');
  return (
    <section className="section mt-12">
      <div className="relative min-h-[190px] overflow-hidden rounded-3xl bg-gradient-to-r from-brand-deepwine via-brand-wine to-brand-burgundy ring-1 ring-brand-gold sm:min-h-[230px]">
        {img && <img src={img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-right" />}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deepwine/85 via-brand-deepwine/45 to-transparent" />
        <div className="relative max-w-md px-6 py-9 sm:px-12 sm:py-12">
          <h2 className="font-serif text-4xl italic text-white sm:text-5xl">Festive Collection <span className="not-italic text-brand-goldlight">✨</span></h2>
          <p className="mt-2 text-sm text-white/85 sm:text-base">Elegant Picks for Every Occasion</p>
          <Link to="/catalogue?collection=festive" className="mt-5 inline-flex rounded-full bg-brand-goldlight px-6 py-2 text-sm font-medium text-brand-wine hover:bg-white">Explore Now →</Link>
        </div>
      </div>
    </section>
  );
}

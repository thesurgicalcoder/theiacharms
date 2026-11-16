import { Link } from 'react-router-dom';
export default function FestiveBanner() {
  return (
    <section className="section mt-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-deepwine via-brand-wine to-brand-burgundy px-6 py-12 text-center ring-1 ring-brand-gold sm:py-16">
        <span className="absolute left-6 top-4 text-3xl text-brand-gold/40">✦</span><span className="absolute bottom-4 right-8 text-4xl text-brand-gold/40">✦</span>
        <h2 className="text-3xl text-brand-goldlight sm:text-5xl">Festive Collection ✨</h2>
        <p className="mt-3 text-sm text-white/80 sm:text-base">Elegant Picks for Every Occasion</p>
        <Link to="/catalogue?collection=festive" className="mt-6 inline-flex rounded-full border border-brand-gold px-6 py-2.5 text-sm text-brand-goldlight hover:bg-brand-gold hover:text-brand-wine">Explore Now →</Link>
      </div>
    </section>
  );
}

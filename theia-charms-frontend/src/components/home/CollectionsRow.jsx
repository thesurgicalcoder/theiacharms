import { Link } from 'react-router-dom';
const COLS = [['minimal', 'Minimal Collection', '🤍'], ['festive', 'Festive Collection', '🪔'], ['gift', 'Gift Collection', '🎁'], ['daily', 'Daily Wear', '☀️']];
export default function CollectionsRow() {
  return (
    <section className="section mt-16">
      <h2 className="section-title">Special Collections</h2><div className="gold-rule" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {COLS.map(([k, t, e]) => (
          <Link key={k} to={`/catalogue?collection=${k}`} className="rounded-2xl border border-brand-gold/40 bg-gradient-to-br from-white to-brand-blush p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
            <span className="text-3xl">{e}</span><p className="mt-2 font-serif text-lg text-brand-burgundy">{t} →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { siteImage } from '../../utils/images';

const COLS = [['minimal', 'Minimal Collection', '🤍'], ['festive', 'Festive Collection', '🪔'], ['gift', 'Gift Collection', '🎁'], ['daily', 'Daily Wear', '☀️']];
export default function CollectionsBand() {
  return (
    <section className="section mt-14">
      <div className="grid items-center gap-5 rounded-3xl bg-gradient-to-r from-brand-deepwine via-brand-wine to-brand-burgundy p-5 ring-1 ring-brand-gold lg:grid-cols-[250px_1fr] lg:p-6">
        <h2 className="text-center font-script text-4xl leading-tight text-white lg:text-left lg:text-5xl">Explore Our Special Collections</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {COLS.map(([k, t, e]) => {
            const img = siteImage(`col-${k}`);
            return (
              <Link key={k} to={`/catalogue?collection=${k}`} className="group overflow-hidden rounded-xl bg-white shadow">
                <div className="aspect-[3/2] overflow-hidden bg-brand-blush">
                  {img ? <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl">{e}</div>}
                </div>
                <p className="px-3 py-2 text-xs text-brand-burgundy sm:text-sm">{t} →</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

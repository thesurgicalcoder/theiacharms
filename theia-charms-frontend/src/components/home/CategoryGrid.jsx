import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { siteImage } from '../../utils/images';

export function SectionTitle({ children, sub }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-brand-gold sm:w-20" />
        <h2 className="font-serif text-3xl text-brand-burgundy sm:text-4xl">{children}</h2>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-brand-gold sm:w-20" />
      </div>
      {sub && <p className="mt-1 text-sm text-brand-dark/70">{sub}</p>}
    </div>
  );
}

export default function CategoryGrid() {
  const { categories } = useCatalog();
  return (
    <section className="section mt-12">
      <SectionTitle>Shop by Category</SectionTitle>
      <div className="mt-8 grid grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-4 lg:grid-cols-8">
        {categories.map((c) => {
          const img = c.imageUrl || siteImage(`cat-${c.slug}`);
          return (
            <Link key={c._id} to={c.slug === 'more' ? '/catalogue' : `/catalogue?category=${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-brand-gold/50 bg-brand-blush shadow-sm transition group-hover:scale-105 group-hover:shadow-md sm:h-20 sm:w-20 lg:h-24 lg:w-24">
                {img ? <img src={img} alt="" loading="lazy" className="h-full w-full scale-110 object-cover" /> : <span className="text-2xl sm:text-3xl">{c.icon || '✨'}</span>}
              </span>
              <span className="text-xs leading-tight text-brand-dark/85 sm:text-sm">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

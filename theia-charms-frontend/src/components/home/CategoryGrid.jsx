import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
export default function CategoryGrid() {
  const { categories } = useCatalog();
  return (
    <section className="section mt-16">
      <h2 className="section-title">Shop by Category</h2><div className="gold-rule" />
      <div className="mt-8 grid grid-cols-4 gap-3 sm:gap-6 lg:grid-cols-8">
        {categories.map((c) => (
          <Link key={c._id} to={`/catalogue?category=${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold bg-white text-2xl transition group-hover:bg-brand-blush sm:h-20 sm:w-20 sm:text-3xl">{c.icon || '✨'}</span>
            <span className="text-xs text-brand-dark/80 sm:text-sm">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

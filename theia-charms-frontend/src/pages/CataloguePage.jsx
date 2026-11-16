import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import ProductGrid from '../components/product/ProductGrid';

const FLAG = { new: 'isNewArrival', featured: 'isFeatured', festive: 'isFestive', budget: 'isBudget', minimal: 'isMinimal', gift: 'isGift', daily: 'isDailyWear' };
const TITLES = { new: 'New Arrivals', festive: 'Festive Collection', minimal: 'Minimal Collection', gift: 'Gift Collection', daily: 'Daily Wear', budget: 'Budget Friendly', featured: 'Featured' };
const SORT = {
  featured: (a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured),
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

export default function CataloguePage() {
  const { products, categories, loading } = useCatalog();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const collection = params.get('collection') || '';
  const availability = params.get('availability') || 'all';
  const sort = params.get('sort') || 'featured';
  const set = (k, v) => { const n = new URLSearchParams(params); if (v && v !== 'all') n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products
      .filter((p) => !category || categories.find((c) => c.slug === category)?.name === p.categoryName)
      .filter((p) => !collection || !FLAG[collection] || p[FLAG[collection]])
      .filter((p) => availability === 'all' || (availability === 'available' ? !p.isSoldOut : p.isSoldOut))
      .filter((p) => !needle || `${p.name} ${p.productId} ${p.categoryName}`.toLowerCase().includes(needle))
      .sort(SORT[sort] || SORT.featured);
  }, [products, categories, q, category, collection, availability, sort]);

  const pill = (active) => `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${active ? 'border-brand-burgundy bg-brand-burgundy text-white' : 'border-brand-gold/50 bg-white hover:bg-brand-blush'}`;
  const field = 'rounded-full border border-brand-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-brand-burgundy';

  return (
    <div className="section py-10">
      <h1 className="text-center text-4xl text-brand-burgundy">{TITLES[collection] || 'Our Catalogue'}</h1><div className="gold-rule" />

      <div className="mt-8 space-y-4">
        <input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search by product name or code (e.g. Floral, TC-001)…" className={`${field} w-full`} aria-label="Search products" />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => set('category', '')} className={pill(!category)}>All</button>
          {categories.map((c) => <button key={c._id} onClick={() => set('category', c.slug)} className={pill(category === c.slug)}>{c.name}</button>)}
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={availability} onChange={(e) => set('availability', e.target.value)} className={field} aria-label="Availability">
            <option value="all">All items</option><option value="available">Available only</option><option value="sold_out">Sold out</option>
          </select>
          <select value={sort} onChange={(e) => set('sort', e.target.value)} className={field} aria-label="Sort">
            <option value="featured">Featured</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="newest">Newest</option>
          </select>
          {(q || category || collection || availability !== 'all') && <button onClick={() => setParams({}, { replace: true })} className="text-sm text-brand-burgundy underline">Clear filters</button>}
          <span className="ml-auto self-center text-sm text-brand-dark/60">{list.length} item{list.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div className="mt-8">
        {loading ? <p className="py-20 text-center text-brand-dark/60">Loading our collection…</p>
          : list.length ? <ProductGrid products={list} />
          : <p className="py-20 text-center text-brand-dark/60">No pieces match your search. Try clearing the filters.</p>}
      </div>
    </div>
  );
}

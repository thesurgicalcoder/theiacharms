import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import ProductGrid from '../product/ProductGrid';
import { SectionTitle } from './CategoryGrid';

export default function NewArrivals() {
  const { products } = useCatalog();
  const items = products.filter((p) => p.isNewArrival).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  if (!items.length) return null;
  return (
    <section className="section mt-14">
      <div className="relative">
        <SectionTitle sub="Fresh Picks Just for You">New Arrivals</SectionTitle>
        <Link to="/catalogue?collection=new" className="btn-outline mt-4 !px-4 !py-1.5 sm:absolute sm:right-0 sm:top-2 sm:mt-0">View All →</Link>
      </div>
      <div className="mt-7"><ProductGrid products={items} cols={5} /></div>
    </section>
  );
}

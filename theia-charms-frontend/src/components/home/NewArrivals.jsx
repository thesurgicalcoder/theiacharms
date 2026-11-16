import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import ProductGrid from '../product/ProductGrid';
export default function NewArrivals() {
  const { products } = useCatalog();
  const items = products.filter((p) => p.isNewArrival).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  if (!items.length) return null;
  return (
    <section className="section mt-16">
      <h2 className="section-title">New Arrivals</h2><div className="gold-rule" />
      <div className="mt-8"><ProductGrid products={items} /></div>
      <div className="mt-8 text-center"><Link to="/catalogue?collection=new" className="btn-outline">View All →</Link></div>
    </section>
  );
}

import ProductCard from './ProductCard';
const COLS = { 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };
export default function ProductGrid({ products, cols = 4 }) {
  return <div className={`grid grid-cols-2 gap-3 sm:gap-5 ${COLS[cols]}`}>{products.map((p) => <ProductCard key={p.productId} product={p} />)}</div>;
}

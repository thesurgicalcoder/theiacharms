import ProductCard from './ProductCard';
export default function ProductGrid({ products }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.productId} product={p} />)}</div>;
}

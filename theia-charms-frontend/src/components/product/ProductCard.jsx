import { useWishlist } from '../../context/WishlistContext';
import { useUI } from '../../context/UIContext';
import { formatPrice } from '../../utils/formatters';
import ProductImage from '../common/ProductImage';

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const { openProduct, notify } = useUI();
  const saved = has(product.productId);
  const onHeart = (e) => { e.stopPropagation(); notify(toggle(product.productId) ? '♥ Added to wishlist' : 'Removed from wishlist'); };

  return (
    <article onClick={() => openProduct(product)} className="group cursor-pointer overflow-hidden rounded-2xl border border-brand-gold/30 bg-white transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        <div className="h-full w-full transition duration-500 group-hover:scale-105"><ProductImage product={product} width={500} /></div>
        {product.isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/55">
            <span className="rounded-full bg-white px-4 py-1 text-xs font-semibold tracking-widest text-brand-burgundy">SOLD OUT</span>
          </div>
        )}
        <button onClick={onHeart} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow hover:bg-white">
          <span key={String(saved)} className={saved ? 'animate-pop' : ''}>{saved ? '❤️' : '🤍'}</span>
        </button>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-brand-gold">{product.categoryName}</p>
        <h3 className="mt-0.5 truncate font-serif text-lg text-brand-dark">{product.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-medium text-brand-burgundy">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && <span className="text-xs text-brand-dark/40 line-through">{formatPrice(product.originalPrice)}</span>}
        </div>
      </div>
    </article>
  );
}

import { useEffect, useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCatalog } from '../../context/CatalogContext';
import { formatPrice } from '../../utils/formatters';
import { productEnquiryUrl } from '../../utils/whatsapp';
import ProductImage from '../common/ProductImage';
import WhatsAppIcon from '../common/WhatsAppIcon';

export default function ProductModal() {
  const { product, openProduct, closeProduct, notify } = useUI();
  const { settings, products } = useCatalog();
  const { has, toggle } = useWishlist();
  const [idx, setIdx] = useState(0);

  useEffect(() => { setIdx(0); }, [product?.productId]);
  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeProduct();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [product, closeProduct]);

  if (!product) return null;
  const images = product.images?.length ? product.images : [null];
  const similar = products.filter((p) => p.categoryName === product.categoryName && p.productId !== product.productId).slice(0, 3);
  const saved = has(product.productId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-deepwine/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={closeProduct} role="dialog" aria-modal="true" aria-label={product.name}>
      <div onClick={(e) => e.stopPropagation()} className="relative grid max-h-[92vh] w-full max-w-4xl animate-fadeUp overflow-y-auto rounded-t-3xl bg-brand-cream sm:grid-cols-2 sm:rounded-3xl">
        <button onClick={closeProduct} aria-label="Close" className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-white/90 shadow">✕</button>

        <div className="p-4 sm:p-6">
          <div className="aspect-square overflow-hidden rounded-2xl border border-brand-gold/30">
            <ProductImage product={product} src={images[idx]?.url} width={900} />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((im, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`Photo ${i + 1}`} className={`h-14 w-14 overflow-hidden rounded-lg border-2 ${i === idx ? 'border-brand-burgundy' : 'border-transparent opacity-70'}`}>
                  <ProductImage product={product} src={im?.url} width={120} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-brand-blush px-2 py-0.5 font-mono text-[11px] text-brand-burgundy">{product.productId}</span>
            <span className="rounded-full border border-brand-gold px-2.5 py-0.5 text-[11px] text-brand-gold">{product.categoryName}</span>
          </div>
          <h2 className="mt-3 text-3xl text-brand-burgundy">{product.name}</h2>
          <p className="mt-1 text-2xl font-medium">{formatPrice(product.price)}</p>
          <p className={`mt-2 text-sm font-medium ${product.isSoldOut ? 'text-red-700' : 'text-green-700'}`}>{product.isSoldOut ? '● Sold Out — Restock Soon' : '● In Stock'}</p>
          <p className="mt-4 text-sm leading-relaxed text-brand-dark/80">{product.description}</p>
          <ul className="mt-4 space-y-1 text-xs text-brand-dark/70"><li>✔ Anti-tarnish gold plating</li><li>✔ Hypoallergenic, skin-friendly</li></ul>

          <div className="mt-auto space-y-2.5 pt-6">
            <a href={productEnquiryUrl(product, settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" onClick={() => notify('Opening WhatsApp…')}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-burgundy px-5 py-3.5 text-sm font-medium text-white ring-1 ring-brand-gold hover:bg-brand-wine">
              <WhatsAppIcon className="h-5 w-5" /> {product.isSoldOut ? 'Notify me on WhatsApp' : 'Enquire on WhatsApp'}
            </a>
            <button onClick={() => notify(toggle(product.productId) ? '♥ Added to wishlist' : 'Removed from wishlist')} className="btn-outline w-full">{saved ? '❤️ Saved to wishlist' : '🤍 Save to wishlist'}</button>
          </div>

          {similar.length > 0 && (
            <div className="mt-6 border-t border-brand-gold/30 pt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-brand-gold">You may also like</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">{similar.map((p) => <button key={p.productId} onClick={() => openProduct(p)} className="text-sm text-brand-burgundy hover:underline">{p.name} →</button>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCatalog } from '../../context/CatalogContext';
import { formatPrice } from '../../utils/formatters';
import { productEnquiryUrl } from '../../utils/whatsapp';
import ProductImage from '../common/ProductImage';

export default function WishlistDrawer() {
  const { wishlistOpen, setWishlistOpen, openProduct } = useUI();
  const { ids, remove } = useWishlist();
  const { byId, settings } = useCatalog();
  useEffect(() => {
    if (!wishlistOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setWishlistOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [wishlistOpen, setWishlistOpen]);
  if (!wishlistOpen) return null;
  const items = ids.map((id) => byId[id]).filter(Boolean); // silently drops products deleted by admin

  return (
    <div className="fixed inset-0 z-50 bg-brand-deepwine/50" onClick={() => setWishlistOpen(false)}>
      <aside onClick={(e) => e.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-sm animate-slideIn flex-col bg-brand-cream shadow-2xl" aria-label="Wishlist">
        <div className="flex items-center justify-between border-b border-brand-gold/30 p-5">
          <h2 className="text-2xl text-brand-burgundy">My Wishlist <span className="text-base text-brand-gold">({items.length})</span></h2>
          <button onClick={() => setWishlistOpen(false)} aria-label="Close wishlist" className="h-9 w-9 rounded-full hover:bg-brand-blush">✕</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {items.length === 0 && <p className="mt-16 text-center text-sm text-brand-dark/60">Your wishlist is empty.<br />Tap 🤍 on any piece you love.</p>}
          {items.map((p) => (
            <div key={p.productId} className="flex gap-3 rounded-2xl border border-brand-gold/30 bg-white p-3">
              <button onClick={() => { setWishlistOpen(false); openProduct(p); }} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"><ProductImage product={p} width={200} /></button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif">{p.name}</p>
                <p className="text-sm text-brand-burgundy">{formatPrice(p.price)}{p.isSoldOut && <span className="ml-2 text-xs text-red-700">Sold out</span>}</p>
                <div className="mt-2 flex items-center gap-3">
                  <a href={productEnquiryUrl(p, settings?.whatsappPhone)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-brand-burgundy px-3 py-1 text-xs text-white">💬 Enquire</a>
                  <button onClick={() => remove(p.productId)} className="text-xs text-brand-dark/50 hover:text-red-700">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

import { optimizeImage, primaryImage } from '../../utils/formatters';

// Real photo when available, otherwise an elegant emoji placeholder.
export default function ProductImage({ product, src, width = 600, className = '' }) {
  const url = src || primaryImage(product);
  if (url) return <img src={optimizeImage(url, width)} alt={product?.name || ''} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blush to-brand-softpink text-6xl ${className}`} aria-label={product?.name}>
      {product?.emoji || '✨'}
    </div>
  );
}

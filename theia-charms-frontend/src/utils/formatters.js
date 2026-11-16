export const formatPrice = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
// Cloudinary: serve optimised WebP/AVIF at a sensible width
export const optimizeImage = (url, width = 600) =>
  url && url.includes('res.cloudinary.com') && url.includes('/upload/') ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`) : url;
export const primaryImage = (p) => p?.images?.find((i) => i.isPrimary)?.url || p?.images?.[0]?.url || null;

const P = (n, productId, name, category, price, emoji, description, flags = {}, isSoldOut = false) => ({
  _id: productId, productId, name, category, categoryName: category, price, emoji, description, images: [],
  isSoldOut, stock: isSoldOut ? 0 : 5, isNewArrival: true, createdAt: new Date(2026, 0, n).toISOString(), ...flags,
});
export const SAMPLE_PRODUCTS = [
  P(1, 'TC-001', 'Floral Pearl Earrings', 'Earrings', 299, '🌸', 'Handcrafted 18k gold plated floral stud earrings with premium faux pearls. Tarnish-resistant and skin-friendly.', { isFeatured: true, isMinimal: true, isDailyWear: true }),
  P(2, 'TC-002', 'Heart Charm Pendant', 'Pendants', 349, '💛', 'Delicate micro-paved gold heart charm necklace with an adjustable dainty link chain.', { isFeatured: true, isGift: true }),
  P(3, 'TC-003', 'Leaf Charm Bracelet', 'Bracelets', 399, '🌿', 'Elegant leafy filigree bangle with shimmer crystal accents for modern everyday chic.', { isFeatured: true, isDailyWear: true }),
  P(4, 'TC-004', 'Classic Stone Ring', 'Rings', 329, '💍', 'Solitaire-inspired timeless cubic zirconia ring set in anti-fade champagne brass.', { isFeatured: true, isGift: true }),
  P(5, 'TC-005', 'Traditional Jhumka', 'Earrings', 399, '🪔', 'Royal vintage antique gold tone bells with cluster hanging pearls.', { isFestive: true }, true),
  P(6, 'TC-006', 'Kundan Meenakari Choker', 'Pendants', 599, '✨', 'Hand-enameled choker with regal Kundan stones and adjustable soft silk dori thread.', { isFestive: true, isGift: true }),
  P(7, 'TC-007', 'Pearl Hair Clip Set', 'Hair Accessories', 199, '🎀', 'Pair of minimalist pearl alligator hair barrettes for effortless party and salon styling.', { isBudget: true, isMinimal: true }),
  P(8, 'TC-008', 'Evil Eye Gold Bracelet', 'Bracelets', 379, '🧿', 'Protective mother-of-pearl evil eye motif bracelet with anti-tarnish sealing.', { isDailyWear: true, isMinimal: true }),
];
const C = (name, icon, i) => ({ _id: name, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), icon, displayOrder: i });
export const SAMPLE_CATEGORIES = [['Earrings', '💎'], ['Pendants', '💛'], ['Bracelets', '🌿'], ['Rings', '💍'], ['Hair Accessories', '🎀'], ['Hair Clips', '📎'], ['Keychains', '🔑'], ['More', '✨']].map(([n, i], k) => C(n, i, k));
export const SAMPLE_SETTINGS = {
  whatsappPhone: import.meta.env.VITE_WHATSAPP_PHONE || '919876543210',
  brandName: 'THEIA CHARMS', tagline: 'Little Charms, Big Smiles',
  announcement: '★ New Arrivals Every Week | 📷 Follow Us on Instagram | 💬 Enquire on WhatsApp',
  instagramUrl: '', address: 'Bamda Colony, Subhash Chowk, Bayana', email: '',
};

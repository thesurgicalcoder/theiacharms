// Adds 8 sample products (only if the catalogue is empty). Categories and owner are created automatically too.
const db = require('../db');
const bootstrap = require('../db/bootstrap');
const products = require('../db/products');
const categories = require('../db/categories');

const P = (name, cat, price, emoji, description, flags = {}, stock = 5) => ({ name, cat, price, emoji, description, stock, ...flags });
const SAMPLE = [
  P('Floral Pearl Earrings', 'Earrings', 299, '🌸', 'Handcrafted gold plated floral stud earrings with premium faux pearls.', { isFeatured: true, isMinimal: true, isDailyWear: true }),
  P('Heart Charm Pendant', 'Pendants', 349, '💛', 'Delicate gold heart charm necklace with an adjustable dainty chain.', { isFeatured: true, isGift: true }),
  P('Leaf Charm Bracelet', 'Bracelets', 399, '🌿', 'Elegant leafy filigree bangle with shimmer crystal accents.', { isFeatured: true, isDailyWear: true }),
  P('Classic Stone Ring', 'Rings', 329, '💍', 'Solitaire-inspired cubic zirconia ring in champagne brass.', { isFeatured: true, isGift: true }),
  P('Traditional Jhumka', 'Earrings', 399, '🪔', 'Vintage antique gold tone bells with cluster hanging pearls.', { isFestive: true }, 0),
  P('Kundan Meenakari Choker', 'Pendants', 599, '✨', 'Hand-enameled choker with Kundan stones and adjustable silk dori.', { isFestive: true, isGift: true }),
  P('Pearl Hair Clip Set', 'Hair Accessories', 199, '🎀', 'Pair of minimalist pearl alligator hair barrettes.', { isBudget: true, isMinimal: true }),
  P('Evil Eye Gold Bracelet', 'Bracelets', 379, '🧿', 'Mother-of-pearl evil eye motif bracelet.', { isDailyWear: true, isMinimal: true }),
];

(async () => {
  db.connect();
  await bootstrap();
  if (products.count()) { console.log('[seed] Products already exist - skipping sample products.'); return; }
  for (const { cat, ...p } of SAMPLE) {
    const c = categories.bySlugOrName(cat);
    products.create({ ...p, category: c._id, categoryName: c.name, isSoldOut: p.stock === 0, isNewArrival: true });
  }
  console.log(`[seed] ${SAMPLE.length} sample products created`);
})().catch((e) => { console.error('[seed] failed:', e.message); process.exitCode = 1; }).finally(() => db.close());

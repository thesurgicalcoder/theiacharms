const { run, get, all, tx, now } = require('./index');
const slugify = require('../utils/slugify');

const FLAGS = { isFeatured: 'is_featured', isNewArrival: 'is_new_arrival', isFestive: 'is_festive', isBudget: 'is_budget', isMinimal: 'is_minimal', isGift: 'is_gift', isDailyWear: 'is_daily_wear' };
const COLLECTION = { new: 'is_new_arrival', featured: 'is_featured', festive: 'is_festive', budget: 'is_budget', minimal: 'is_minimal', gift: 'is_gift', daily: 'is_daily_wear' };
const SORTS = { newest: 'created_at DESC, id DESC', price_asc: 'price ASC', price_desc: 'price DESC', featured: 'is_featured DESC, created_at DESC' };
const esc = (s) => String(s).replace(/[\\%_]/g, '\\$&');
const parseImages = (s) => { try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; } };

const map = (r) => r && ({
  _id: String(r.id), productId: r.product_id, name: r.name, slug: r.slug, category: String(r.category_id), categoryName: r.category_name,
  description: r.description, price: r.price, originalPrice: r.original_price ?? null, stock: r.stock, isSoldOut: !!r.is_sold_out,
  images: parseImages(r.images), isFeatured: !!r.is_featured, isNewArrival: !!r.is_new_arrival, isFestive: !!r.is_festive,
  isBudget: !!r.is_budget, isMinimal: !!r.is_minimal, isGift: !!r.is_gift, isDailyWear: !!r.is_daily_wear, emoji: r.emoji,
  createdAt: r.created_at, updatedAt: r.updated_at,
});
exports.map = map;

function where(q, categoryRow) {
  const w = []; const p = [];
  if (q.category) { w.push('category_id = ?'); p.push(categoryRow ? Number(categoryRow._id) : -1); }
  if (q.availability === 'in_stock' || q.status === 'available') w.push('is_sold_out = 0');
  if (q.availability === 'sold_out' || q.status === 'sold_out') w.push('is_sold_out = 1');
  if (q.minPrice) { w.push('price >= ?'); p.push(Number(q.minPrice)); }
  if (q.maxPrice) { w.push('price <= ?'); p.push(Number(q.maxPrice)); }
  if (q.collection && COLLECTION[q.collection]) w.push(`${COLLECTION[q.collection]} = 1`);
  if (q.q && String(q.q).trim()) {
    const like = `%${esc(String(q.q).trim())}%`;
    w.push("(name LIKE ? ESCAPE '\\' OR product_id LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR category_name LIKE ? ESCAPE '\\')");
    p.push(like, like, like, like);
  }
  return { sql: w.length ? `WHERE ${w.join(' AND ')}` : '', p };
}

exports.list = (q, page, limit, categoryRow) => {
  const { sql, p } = where(q, categoryRow);
  const total = get(`SELECT COUNT(*) n FROM products ${sql}`, p).n;
  const rows = all(`SELECT * FROM products ${sql} ORDER BY ${SORTS[q.sort] || SORTS.newest} LIMIT ? OFFSET ?`, [...p, limit, (page - 1) * limit]);
  return { items: rows.map(map), total };
};
exports.listAllFiltered = (f) => {
  const w = []; const p = [];
  if (f.filter === 'in_stock') w.push('is_sold_out = 0');
  if (f.filter === 'sold_out') w.push('is_sold_out = 1');
  if (f.from) { w.push('created_at >= ?'); p.push(new Date(f.from).toISOString()); }
  if (f.to) { w.push('created_at <= ?'); p.push(new Date(`${f.to}T23:59:59.999Z`).toISOString()); }
  return all(`SELECT * FROM products ${w.length ? `WHERE ${w.join(' AND ')}` : ''} ORDER BY product_id`, p).map(map);
};
exports.flagged = (col, limit, order = 'created_at DESC') => all(`SELECT * FROM products WHERE ${col} = 1 ORDER BY ${order} LIMIT ?`, [limit]).map(map);
exports.highlights = () => ({
  newArrivals: exports.flagged('is_new_arrival', 8), featured: exports.flagged('is_featured', 6), festive: exports.flagged('is_festive', 8),
  minimal: exports.flagged('is_minimal', 8), gift: exports.flagged('is_gift', 8), daily: exports.flagged('is_daily_wear', 8),
});
exports.find = (ident) => {
  const s = String(ident); const n = /^\d+$/.test(s) ? Number(s) : -1;
  return map(get('SELECT * FROM products WHERE product_id = ? OR slug = ? OR id = ?', [s.toUpperCase(), s.toLowerCase(), n]));
};
exports.byProductId = (pid) => map(get('SELECT * FROM products WHERE product_id = ?', [String(pid).toUpperCase()]));
exports.similar = (p, n = 4) => all('SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT ?', [Number(p.category), Number(p._id), n]).map(map);
exports.names = () => all('SELECT name, product_id FROM products');
exports.count = () => get('SELECT COUNT(*) n FROM products').n;
exports.stats = () => ({ total: exports.count(), soldOut: get('SELECT COUNT(*) n FROM products WHERE is_sold_out = 1').n });
exports.recent = (n = 6) => all('SELECT * FROM products ORDER BY created_at DESC, id DESC LIMIT ?', [n]).map(map);

// shared rules: stock 0 => sold out; first image is primary
function normalise(p) {
  const stock = Math.max(0, Number(p.stock) || 0);
  const images = (p.images || []).slice(0, 5).map((im, i) => ({ url: im.url, publicId: im.publicId, isPrimary: i === 0, order: i }));
  return { ...p, stock, isSoldOut: stock <= 0 ? true : !!p.isSoldOut, images };
}
const cols = (p, t) => [p.name, p.slug, Number(p.category), p.categoryName, p.description || '', Number(p.price), p.originalPrice == null ? null : Number(p.originalPrice),
  p.stock, p.isSoldOut, JSON.stringify(p.images), p.isFeatured, p.isNewArrival, p.isFestive, p.isBudget, p.isMinimal, p.isGift, p.isDailyWear, p.emoji || '✨', t];

exports.create = (d) => tx(() => {
  run('INSERT OR IGNORE INTO counters (name, seq) VALUES (?, 0)', ['product']);
  run('UPDATE counters SET seq = seq + 1 WHERE name = ?', ['product']);
  const productId = `TC-${String(get('SELECT seq FROM counters WHERE name = ?', ['product']).seq).padStart(3, '0')}`;
  const defaults = { isFeatured: false, isNewArrival: true, isFestive: false, isBudget: false, isMinimal: false, isGift: false, isDailyWear: false, stock: 1, isSoldOut: false, images: [] };
  const p = normalise({ ...defaults, ...d });
  p.slug = `${slugify(p.name)}-${productId.toLowerCase()}`;
  const t = now();
  run(`INSERT INTO products (name, slug, category_id, category_name, description, price, original_price, stock, is_sold_out, images,
        is_featured, is_new_arrival, is_festive, is_budget, is_minimal, is_gift, is_daily_wear, emoji, updated_at, product_id, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [...cols(p, t), productId, t]);
  return exports.byProductId(productId);
});

exports.save = (p0) => {
  const p = normalise(p0);
  p.slug = `${slugify(p.name)}-${p.productId.toLowerCase()}`;
  run(`UPDATE products SET name=?, slug=?, category_id=?, category_name=?, description=?, price=?, original_price=?, stock=?, is_sold_out=?, images=?,
        is_featured=?, is_new_arrival=?, is_festive=?, is_budget=?, is_minimal=?, is_gift=?, is_daily_wear=?, emoji=?, updated_at=? WHERE product_id=?`,
  [...cols(p, now()), p.productId]);
  return exports.byProductId(p.productId);
};
exports.remove = (pid) => { const p = exports.byProductId(pid); if (p) run('DELETE FROM products WHERE product_id = ?', [p.productId]); return p; };
exports.FLAG_KEYS = Object.keys(FLAGS);

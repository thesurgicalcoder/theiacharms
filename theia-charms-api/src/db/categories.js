const { run, get, all, now } = require('./index');
const slugify = require('../utils/slugify');

const id = (v) => { const n = Number(v); return Number.isInteger(n) ? n : -1; };
const map = (r) => r && ({ _id: String(r.id), name: r.name, slug: r.slug, imageUrl: r.image_url, icon: r.icon, displayOrder: r.display_order, isActive: !!r.is_active, createdAt: r.created_at, updatedAt: r.updated_at });

exports.listActive = () => all('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order, name').map(map);
exports.listAll = () => all('SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count FROM categories c ORDER BY display_order, name')
  .map((r) => ({ ...map(r), productCount: r.product_count }));
exports.byId = (v) => map(get('SELECT * FROM categories WHERE id = ?', [id(v)]));
exports.byIds = (list) => list.map((v) => exports.byId(v)).filter(Boolean);
exports.bySlugOrName = (v) => map(get('SELECT * FROM categories WHERE slug = ? OR name = ?', [String(v).toLowerCase(), String(v)]));
exports.count = () => get('SELECT COUNT(*) n FROM categories').n;
exports.productCount = (v) => get('SELECT COUNT(*) n FROM products WHERE category_id = ?', [id(v)]).n;

exports.create = (d) => {
  const t = now();
  run('INSERT INTO categories (name, slug, image_url, icon, display_order, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)',
    [String(d.name).trim(), slugify(d.name), d.imageUrl || '', d.icon || '✨', Number(d.displayOrder) || 0, d.isActive === undefined ? true : d.isActive, t, t]);
  return exports.bySlugOrName(slugify(d.name));
};
exports.update = (v, patch) => {
  const c = exports.byId(v); if (!c) return null;
  const m = { ...c, ...Object.fromEntries(Object.entries(patch).filter(([, x]) => x !== undefined)) };
  run('UPDATE categories SET name=?, slug=?, image_url=?, icon=?, display_order=?, is_active=?, updated_at=? WHERE id=?',
    [String(m.name).trim(), slugify(m.name), m.imageUrl || '', m.icon || '✨', Number(m.displayOrder) || 0, m.isActive, now(), id(v)]);
  run('UPDATE products SET category_name = ? WHERE category_id = ?', [String(m.name).trim(), id(v)]);
  return exports.byId(v);
};
exports.remove = (v) => { const c = exports.byId(v); if (c) run('DELETE FROM categories WHERE id = ?', [id(v)]); return c; };

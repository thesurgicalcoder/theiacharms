const { run, get, all, now } = require('./index');
const id = (v) => { const n = Number(v); return Number.isInteger(n) ? n : -1; };
const map = (r) => r && ({ _id: String(r.id), title: r.title, subtitle: r.subtitle, imageUrl: r.image_url, linkUrl: r.link_url, displayOrder: r.display_order, isActive: !!r.is_active, createdAt: r.created_at, updatedAt: r.updated_at });

exports.listActive = () => all('SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order').map(map);
exports.listAll = () => all('SELECT * FROM banners ORDER BY display_order').map(map);
exports.byId = (v) => map(get('SELECT * FROM banners WHERE id = ?', [id(v)]));
exports.create = (d) => {
  const t = now();
  const r = run('INSERT INTO banners (title, subtitle, image_url, link_url, display_order, is_active, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)',
    [d.title || '', d.subtitle || '', d.imageUrl || '', d.linkUrl || '', Number(d.displayOrder) || 0, d.isActive === undefined ? true : d.isActive, t, t]);
  return exports.byId(r.lastInsertRowid);
};
exports.update = (v, patch) => {
  const b = exports.byId(v); if (!b) return null;
  const m = { ...b, ...Object.fromEntries(Object.entries(patch).filter(([, x]) => x !== undefined)) };
  run('UPDATE banners SET title=?, subtitle=?, image_url=?, link_url=?, display_order=?, is_active=?, updated_at=? WHERE id=?',
    [m.title || '', m.subtitle || '', m.imageUrl || '', m.linkUrl || '', Number(m.displayOrder) || 0, m.isActive, now(), id(v)]);
  return exports.byId(v);
};
exports.remove = (v) => { const b = exports.byId(v); if (b) run('DELETE FROM banners WHERE id = ?', [id(v)]); return b; };

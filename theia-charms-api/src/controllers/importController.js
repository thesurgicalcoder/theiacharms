const products = require('../db/products');
const categories = require('../db/categories');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activity');
const { parseProducts } = require('../utils/importParse');
const ai = require('../services/ai');
const storage = require('../services/storage');
const env = require('../config/env');

exports.status = (_req, res) => res.json({ success: true, data: { aiEnabled: ai.enabled(), provider: ai.enabled() ? env.aiProvider : 'none', storage: storage.mode } });

// POST /api/admin/import/analyze  (multipart: pages[] = up to 5 images)
exports.analyze = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (!files.length) throw new AppError('No pages received');
  const categoryNames = categories.listActive().map((c) => c.name);
  const existing = new Map(products.names().map((p) => [p.name.toLowerCase(), p.product_id]));
  const raw = await ai.analyze(files, categoryNames);
  res.json({ success: true, data: { products: parseProducts(raw, { categoryNames, pageCount: files.length, existing }) } });
});

// POST /api/admin/import/confirm  { items: [{ name, description, price, stock, category(id), images:[{url,publicId}] }] }
exports.confirm = asyncHandler(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) throw new AppError('Nothing to import');
  if (items.length > 50) throw new AppError('Import at most 50 products at a time');
  const created = []; const failed = [];
  items.forEach((it, idx) => {
    try {
      const cat = categories.byId(it.category);
      const price = Number(it.price);
      if (!String(it.name || '').trim()) throw new Error('Name is required');
      if (!cat) throw new Error('Category is required');
      if (it.price === '' || it.price == null || !(price >= 0)) throw new Error('Price is required');
      const stock = it.stock === '' || it.stock == null ? 1 : Math.max(0, Number(it.stock) || 0);
      const images = (Array.isArray(it.images) ? it.images : []).filter((im) => /^https?:\/\//.test(im?.url || '')).slice(0, 5);
      const p = products.create({ name: String(it.name).trim().slice(0, 120), description: String(it.description || '').slice(0, 2000), price, stock, isSoldOut: stock === 0,
        category: cat._id, categoryName: cat.name, emoji: cat.icon || '✨', images, isNewArrival: true });
      created.push({ index: idx, productId: p.productId, name: p.name });
    } catch (e) { failed.push({ index: idx, name: it?.name, error: e.message }); }
  });
  if (created.length) await logActivity(req, 'PRODUCT_IMPORT', 'product', created[0].productId, { count: created.length, ids: created.map((c) => c.productId) });
  res.status(created.length ? 201 : 400).json({ success: created.length > 0, data: { created, failed } });
});

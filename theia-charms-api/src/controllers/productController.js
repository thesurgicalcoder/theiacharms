const products = require('../db/products');
const categories = require('../db/categories');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activity');
const storage = require('../services/storage');

// GET /api/products  and  GET /api/admin/products
exports.getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '24', 10), 1), 100);
  const cat = req.query.category ? categories.bySlugOrName(req.query.category) : null;
  const { items, total } = products.list(req.query, page, limit, cat);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getHighlights = asyncHandler(async (_req, res) => res.json({ success: true, data: products.highlights() }));

exports.getProduct = asyncHandler(async (req, res) => {
  const product = products.find(req.params.identifier);
  if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
  res.json({ success: true, data: product, similar: products.similar(product) });
});

// ---------- admin ----------
const FIELDS = ['name', 'description', 'price', 'originalPrice', 'stock', 'isSoldOut', 'images', 'isFeatured', 'isNewArrival', 'isFestive', 'isBudget', 'isMinimal', 'isGift', 'isDailyWear', 'emoji', 'category'];
function pickBody(b) {
  const out = {};
  FIELDS.forEach((k) => { if (b[k] !== undefined) out[k] = b[k]; });
  if (out.name !== undefined) out.name = String(out.name).trim().slice(0, 120);
  if (out.description !== undefined) out.description = String(out.description).slice(0, 2000);
  if (out.price !== undefined) out.price = Number(out.price);
  if (out.stock !== undefined) out.stock = Number(out.stock);
  if (out.originalPrice === '' || out.originalPrice === null) out.originalPrice = null;
  else if (out.originalPrice !== undefined) out.originalPrice = Number(out.originalPrice);
  if (out.images) out.images = out.images.slice(0, 5).map((im, i) => ({ url: im.url, publicId: im.publicId, isPrimary: i === 0, order: i }));
  return out;
}
function validate(b, { partial = false } = {}) {
  if (!partial || b.name !== undefined) if (!b.name || !String(b.name).trim()) throw new AppError('Product name is required');
  if (!partial || b.price !== undefined) if (b.price === '' || b.price === undefined || b.price === null || !(Number(b.price) >= 0)) throw new AppError('A valid price (₹) is required');
  if (b.stock !== undefined && !(Number(b.stock) >= 0)) throw new AppError('Stock must be 0 or more');
  if (b.images && b.images.length > 5) throw new AppError('Maximum 5 images per product');
  if (!partial && !b.category) throw new AppError('Category is required');
}

exports.createProduct = asyncHandler(async (req, res) => {
  validate(req.body);
  const data = pickBody(req.body);
  const cat = categories.byId(data.category);
  if (!cat) throw new AppError('Category not found', 404);
  const product = products.create({ ...data, category: cat._id, categoryName: cat.name });
  await logActivity(req, 'PRODUCT_CREATE', 'product', product.productId, { name: product.name, price: product.price });
  res.status(201).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  validate(req.body, { partial: true });
  const current = products.byProductId(req.params.id);
  if (!current) throw new AppError('Product not found', 404);
  const before = { price: current.price, stock: current.stock, isSoldOut: current.isSoldOut };
  const data = pickBody(req.body);
  if (data.category && String(data.category) !== current.category) {
    const cat = categories.byId(data.category);
    if (!cat) throw new AppError('Category not found', 404);
    data.category = cat._id; data.categoryName = cat.name;
  }
  if (data.stock > 0 && data.isSoldOut === undefined && current.isSoldOut) data.isSoldOut = false; // restocked
  const product = products.save({ ...current, ...data });
  if (before.price !== product.price) await logActivity(req, 'PRICE_UPDATE', 'product', product.productId, { name: product.name, from: before.price, to: product.price });
  if (before.isSoldOut !== product.isSoldOut || before.stock !== product.stock)
    await logActivity(req, 'STOCK_STATUS_TOGGLE', 'product', product.productId, { name: product.name, from: { stock: before.stock, isSoldOut: before.isSoldOut }, to: { stock: product.stock, isSoldOut: product.isSoldOut } });
  await logActivity(req, 'PRODUCT_UPDATE', 'product', product.productId, { name: product.name });
  res.json({ success: true, data: product });
});

// PATCH /api/admin/products/:id/status  (manager+)
exports.updateStatus = asyncHandler(async (req, res) => {
  const { isSoldOut, stock } = req.body;
  const p = products.byProductId(req.params.id);
  if (!p) throw new AppError('Product not found', 404);
  const before = { stock: p.stock, isSoldOut: p.isSoldOut };
  if (stock !== undefined) { if (!(Number(stock) >= 0)) throw new AppError('Stock must be 0 or more'); p.stock = Number(stock); }
  if (isSoldOut !== undefined) {
    p.isSoldOut = Boolean(isSoldOut);
    if (p.isSoldOut) p.stock = 0; else if (p.stock <= 0) p.stock = 1;
  } else if (p.stock > 0) p.isSoldOut = false;
  const saved = products.save(p);
  await logActivity(req, 'STOCK_STATUS_TOGGLE', 'product', saved.productId, { name: saved.name, from: before, to: { stock: saved.stock, isSoldOut: saved.isSoldOut } });
  res.json({ success: true, data: saved });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = products.remove(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  await Promise.all(product.images.map((i) => storage.remove(i.publicId)));
  await logActivity(req, 'PRODUCT_DELETE', 'product', product.productId, { name: product.name });
  res.json({ success: true, message: 'Product deleted' });
});

exports.duplicateProduct = asyncHandler(async (req, res) => {
  const src = products.byProductId(req.params.id);
  if (!src) throw new AppError('Product not found', 404);
  const copy = products.create({ ...src, name: `${src.name} (Copy)`, images: [] });
  await logActivity(req, 'PRODUCT_DUPLICATE', 'product', copy.productId, { from: src.productId });
  res.status(201).json({ success: true, data: copy });
});

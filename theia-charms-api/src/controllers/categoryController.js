const categories = require('../db/categories');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activity');

exports.getPublic = asyncHandler(async (_req, res) => res.json({ success: true, data: categories.listActive() }));
exports.getAll = asyncHandler(async (_req, res) => res.json({ success: true, data: categories.listAll() }));
exports.create = asyncHandler(async (req, res) => {
  if (!req.body.name?.trim()) throw new AppError('Category name is required');
  const c = categories.create(req.body);
  await logActivity(req, 'CATEGORY_ADD', 'category', c.slug, { name: c.name });
  res.status(201).json({ success: true, data: c });
});
exports.update = asyncHandler(async (req, res) => {
  if (req.body.name !== undefined && !String(req.body.name).trim()) throw new AppError('Category name is required');
  const c = categories.update(req.params.id, req.body);
  if (!c) throw new AppError('Category not found', 404);
  await logActivity(req, 'CATEGORY_UPDATE', 'category', c.slug, { name: c.name });
  res.json({ success: true, data: c });
});
exports.remove = asyncHandler(async (req, res) => {
  const n = categories.productCount(req.params.id);
  if (n) throw new AppError(`Cannot delete: ${n} product(s) use this category. Move or delete them first.`, 409, 'IN_USE');
  const c = categories.remove(req.params.id);
  if (!c) throw new AppError('Category not found', 404);
  await logActivity(req, 'CATEGORY_DELETE', 'category', c.slug, { name: c.name });
  res.json({ success: true, message: 'Category deleted' });
});

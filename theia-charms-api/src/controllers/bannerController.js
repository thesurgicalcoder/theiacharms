const banners = require('../db/banners');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activity');

exports.getPublic = asyncHandler(async (_req, res) => res.json({ success: true, data: banners.listActive() }));
exports.getAll = asyncHandler(async (_req, res) => res.json({ success: true, data: banners.listAll() }));
exports.create = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim() && !req.body.imageUrl) throw new AppError('Banner needs a title or an image');
  const b = banners.create(req.body);
  await logActivity(req, 'BANNER_CREATE', 'banner', b._id, { title: b.title });
  res.status(201).json({ success: true, data: b });
});
exports.update = asyncHandler(async (req, res) => {
  const b = banners.update(req.params.id, req.body);
  if (!b) throw new AppError('Banner not found', 404);
  await logActivity(req, 'BANNER_UPDATE', 'banner', b._id, { title: b.title });
  res.json({ success: true, data: b });
});
exports.remove = asyncHandler(async (req, res) => {
  const b = banners.remove(req.params.id);
  if (!b) throw new AppError('Banner not found', 404);
  await logActivity(req, 'BANNER_DELETE', 'banner', b._id, { title: b.title });
  res.json({ success: true, message: 'Banner deleted' });
});

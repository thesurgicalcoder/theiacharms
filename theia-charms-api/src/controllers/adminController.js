const ExcelJS = require('exceljs');
const products = require('../db/products');
const categories = require('../db/categories');
const logs = require('../db/logs');
const settings = require('../db/settings');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { logActivity } = require('../utils/activity');
const storage = require('../services/storage');

exports.dashboard = asyncHandler(async (_req, res) => {
  const { total, soldOut } = products.stats();
  res.json({ success: true, data: { total, available: total - soldOut, soldOut, categories: categories.count(), recent: products.recent(6) } });
});

exports.logs = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '30', 10), 1), 100);
  const { items, total } = logs.list(req.query, page, limit);
  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new AppError('No image received');
  const results = await Promise.all(req.files.map((f) => storage.save(f, req)));
  res.status(201).json({ success: true, data: results });
});

// GET /api/admin/export?format=xlsx|csv&filter=all|in_stock|sold_out&from=&to=
exports.exportProducts = asyncHandler(async (req, res) => {
  const { format = 'xlsx', filter = 'all', from, to } = req.query;
  const items = products.listAllFiltered({ filter, from, to });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Catalogue');
  ws.columns = [
    { header: 'Product ID', key: 'productId', width: 12 }, { header: 'Title', key: 'name', width: 32 }, { header: 'Category', key: 'categoryName', width: 18 },
    { header: 'Price (₹)', key: 'price', width: 12 }, { header: 'Stock', key: 'stock', width: 8 }, { header: 'Status', key: 'status', width: 12 },
    { header: 'Image URLs', key: 'images', width: 50 }, { header: 'Created', key: 'createdAt', width: 14 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B1028' } };
  items.forEach((p) => ws.addRow({ ...p, status: p.isSoldOut ? 'Sold Out' : 'Available', images: p.images.map((i) => i.url).join(' | '), createdAt: String(p.createdAt).slice(0, 10) }));

  await logActivity(req, 'EXCEL_EXPORT', 'export', format, { filter, rows: items.length });
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="theia-charms-${stamp}.csv"`);
    res.write('\uFEFF');
    await wb.csv.write(res);
    return res.end();
  }
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="theia-charms-${stamp}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

exports.getSettingsPublic = asyncHandler(async (_req, res) => res.json({ success: true, data: settings.getPublic() }));
exports.updateSettings = asyncHandler(async (req, res) => {
  const merged = { ...settings.getPublic(), ...req.body };
  if (!/^\d{10,15}$/.test(String(merged.whatsappPhone))) throw new AppError('WhatsApp number must be digits only with country code, e.g. 919876543210');
  const s = settings.update(req.body);
  await logActivity(req, 'SETTINGS_UPDATE', 'settings', 'public');
  res.json({ success: true, data: s });
});

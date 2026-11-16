// Turns the model's tool output into safe, validated product drafts. The model output is untrusted data.
const clamp01 = (n) => Math.min(1, Math.max(0, n));
const money = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 10000000 ? Math.round(v) : null);
const text = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, max) : '');

function cleanBBox(b) {
  if (!b || ![b.x, b.y, b.w, b.h].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
  const x = clamp01(b.x), y = clamp01(b.y);
  const w = Math.min(b.w, 1 - x), h = Math.min(b.h, 1 - y);
  return w >= 0.05 && h >= 0.05 ? { x, y, w, h } : null; // too small/odd -> caller falls back to whole page
}

function parseProducts(raw, { categoryNames, pageCount, existing }) {
  const list = Array.isArray(raw?.products) ? raw.products.slice(0, 60) : [];
  const catMap = new Map(categoryNames.map((n) => [n.toLowerCase(), n]));
  return list.map((p) => {
    const name = text(p.name, 120);
    const category = catMap.get(String(p.category || '').trim().toLowerCase()) || null;
    const page = Math.min(Math.max(parseInt(p.page, 10) || 1, 1), Math.max(pageCount, 1));
    return {
      name,
      nameSource: p.nameSource === 'printed' ? 'printed' : 'suggested',
      description: text(p.description, 400),
      category,
      confidence: typeof p.confidence === 'number' ? clamp01(p.confidence) : 0.5,
      seenPrice: money(p.seenPrice),
      seenPriceLabel: text(p.seenPriceLabel, 60),
      page,
      bbox: cleanBBox(p.bbox),
      notes: text(p.notes, 200),
      duplicateOf: name ? existing.get(name.toLowerCase()) || null : null,
    };
  }).filter((p) => p.name);
}
module.exports = { parseProducts, cleanBBox };

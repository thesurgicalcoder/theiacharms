// "CxR" = C columns x R rows. Used when AI is not available: a page is cut into equal cells, one product per cell.
export const LAYOUTS = [
  ['single', '1 product per page / photo'], ['1x2', '2 per page (top & bottom)'], ['2x1', '2 per page (left & right)'],
  ['2x2', '4 per page (2 × 2)'], ['2x3', '6 per page (2 columns × 3 rows)'], ['3x2', '6 per page (3 columns × 2 rows)'],
  ['3x3', '9 per page (3 × 3)'], ['3x4', '12 per page (3 columns × 4 rows)'],
];
export function gridBoxes(layout) {
  if (!layout || layout === 'single') return [null];
  const [c, r] = layout.split('x').map(Number);
  const out = [];
  for (let i = 0; i < r; i += 1) for (let j = 0; j < c; j += 1) out.push({ x: j / c, y: i / r, w: 1 / c, h: 1 / r });
  return out;
}
export const nameFromFile = (label = '') => label.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);

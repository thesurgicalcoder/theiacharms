// Finds the pictures in public/images, whatever their extension (.png .jpg .webp ...), so the site never guesses file names.
import fs from 'node:fs';

const PREFER = ['webp', 'avif', 'jpg', 'jpeg', 'png', 'svg', 'gif'];
export const EXPECTED = [
  'logo', 'favicon', 'hero-desktop', 'hero-mobile',
  'cat-earrings', 'cat-pendants', 'cat-bracelets', 'cat-rings', 'cat-hair-accessories', 'cat-hair-clips', 'cat-keychains', 'cat-more',
  'festive-banner', 'col-minimal', 'col-festive', 'col-gift', 'col-daily', 'our-story', 'floral-left', 'floral-right', 'og-share',
];

export function scanImages(dir) {
  const found = {}; let files = [];
  try { files = fs.readdirSync(dir); } catch { return { found, ignored: [] }; }
  const ignored = [];
  for (const file of files) {
    const m = /^([a-z0-9-]+)\.(png|jpe?g|webp|avif|svg|gif)$/i.exec(file);
    if (!m) { if (!file.startsWith('.')) ignored.push(file); continue; }
    const name = m[1].toLowerCase(); const ext = m[2].toLowerCase();
    const st = fs.statSync(`${dir}/${file}`);
    const cur = found[name];
    if (!cur || PREFER.indexOf(ext) < PREFER.indexOf(cur.ext)) found[name] = { file, ext, bytes: st.size, mtime: Math.floor(st.mtimeMs) };
  }
  return { found, ignored };
}
// name -> public URL (with a version so a replaced picture is not served from browser cache)
export const toUrlMap = ({ found }) => Object.fromEntries(Object.entries(found).map(([k, v]) => [k, `/images/${v.file}?v=${v.mtime}`]));

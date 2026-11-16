// Run:  npm run check-images   -> tells you which pictures are found, missing or too heavy.
import { fileURLToPath } from 'node:url';
import { scanImages, EXPECTED } from './imageManifest.js';

const dir = fileURLToPath(new URL('../public/images', import.meta.url));
const { found, ignored } = scanImages(dir);
const kb = (b) => `${Math.round(b / 1024)} KB`;
let missing = 0; let heavy = 0;
console.log(`\nChecking ${dir}\n`);
for (const name of EXPECTED) {
  const f = found[name];
  if (!f) { console.log(`  MISSING  ${name}`); missing += 1; continue; }
  const big = f.bytes > 600 * 1024; if (big) heavy += 1;
  console.log(`  ok       ${name.padEnd(22)} ${f.file.padEnd(28)} ${kb(f.bytes)}${big ? '   <- heavy, compress it (target under 300 KB)' : ''}`);
}
if (ignored.length) console.log(`\n  Ignored (name not recognised): ${ignored.join(', ')}`);
console.log(`\n${EXPECTED.length - missing}/${EXPECTED.length} found, ${missing} missing, ${heavy} heavy.\n`);

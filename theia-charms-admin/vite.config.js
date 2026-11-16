import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { scanImages, toUrlMap } from './scripts/imageManifest.js';

const FALLBACK_ICON = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔐</text></svg>';

export default defineConfig(() => {
  const images = toUrlMap(scanImages(fileURLToPath(new URL('./public/images', import.meta.url))));
  return {
    plugins: [react(), { name: 'theia-html-images', transformIndexHtml: (html) => html.replaceAll('__FAVICON__', images.favicon || FALLBACK_ICON) }],
    define: { __IMAGES__: JSON.stringify(images) }, // restart "npm run dev" after adding/renaming pictures
    server: { port: 5174 },
  };
});

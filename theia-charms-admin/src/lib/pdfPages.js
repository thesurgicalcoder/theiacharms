// Turns a PDF or photo files into page images in the browser (nothing is uploaded until you analyse).
// hi  = high-res blob used later to crop product photos;  send = smaller JPEG sent to the AI.
const HI = 2400, SEND = 1600;

const toBlob = (canvas, q = 0.9) => new Promise((res) => canvas.toBlob(res, 'image/jpeg', q));
function scaled(src, sw, sh, max) {
  const k = Math.min(1, max / Math.max(sw, sh));
  const c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(src, 0, 0, c.width, c.height);
  return c;
}
async function fromSource(src, w, h, label) {
  const hiC = scaled(src, w, h, HI);
  const hi = await toBlob(hiC, 0.9);
  const send = Math.max(hiC.width, hiC.height) > SEND ? await toBlob(scaled(hiC, hiC.width, hiC.height, SEND), 0.82) : await toBlob(hiC, 0.82);
  return { hi, send, url: URL.createObjectURL(hi), w: hiC.width, h: hiC.height, label };
}

export async function loadPages(files, onProgress, maxPages = 40) {
  const pages = []; let truncated = false;
  for (const file of files) {
    if (pages.length >= maxPages) { truncated = true; break; }
    if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      for (let i = 1; i <= doc.numPages; i += 1) {
        if (pages.length >= maxPages) { truncated = true; break; }
        const page = await doc.getPage(i);
        const base = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: Math.min(4, HI / Math.max(base.width, base.height)) });
        const c = document.createElement('canvas'); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
        const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        pages.push(await fromSource(c, c.width, c.height, `${file.name} · page ${i}`));
        onProgress?.(pages.length);
      }
    } else if (file.type.startsWith('image/')) {
      const bmp = await createImageBitmap(file);
      pages.push({ ...(await fromSource(bmp, bmp.width, bmp.height, file.name)), isImage: true }); bmp.close?.();
      onProgress?.(pages.length);
    }
  }
  return { pages, truncated };
}

// Crop a product photo out of a page using the AI's box (fractions 0-1). Adds a little padding.
export async function cropPage(page, bbox, pad = 0.03) {
  if (!bbox) return page.hi;
  const bmp = await createImageBitmap(page.hi);
  const x = Math.max(0, (bbox.x - pad) * bmp.width), y = Math.max(0, (bbox.y - pad) * bmp.height);
  const w = Math.min(bmp.width - x, (bbox.w + pad * 2) * bmp.width), h = Math.min(bmp.height - y, (bbox.h + pad * 2) * bmp.height);
  const k = Math.min(1, 1200 / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
  c.getContext('2d').drawImage(bmp, x, y, w, h, 0, 0, c.width, c.height); bmp.close?.();
  return toBlob(c, 0.9);
}

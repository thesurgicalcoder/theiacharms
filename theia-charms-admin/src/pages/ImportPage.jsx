import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/adminApi';
import { useToast } from '../context/ToastContext';
import { loadPages, cropPage } from '../lib/pdfPages';
import { LAYOUTS, gridBoxes, nameFromFile } from '../lib/layouts';
import { ErrorBox, PageHeader, Spinner, inr } from '../components/ui';

const BATCH = 4;
const MODES = [['crop', 'Cropped'], ['page', 'Whole page'], ['none', 'No photo']];

export default function ImportPage() {
  const toast = useToast();
  const [status, setStatus] = useState(null); const [cats, setCats] = useState([]);
  const [step, setStep] = useState('pick'); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [warn, setWarn] = useState('');
  const [rows, setRows] = useState([]); const pagesRef = useRef([]); const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false); const fileRef = useRef();
  const [bulk, setBulk] = useState({ category: '', price: '', stock: '' });
  const [layout, setLayout] = useState('single');

  useEffect(() => { api.importStatus().then((r) => { setStatus(r.data); setLayout(r.data.aiEnabled ? 'auto' : 'single'); }).catch((e) => setErr(e.message)); api.categories().then((r) => setCats(r.data.filter((c) => c.isActive))).catch(() => {}); }, []);
  const catByName = (n) => cats.find((c) => c.name === n)?._id || '';
  const upd = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const start = async (fileList) => {
    const files = [...fileList].filter((f) => f.type === 'application/pdf' || f.type.startsWith('image/') || /\.pdf$/i.test(f.name));
    if (!files.length) return setErr('Please choose a PDF or photo files.');
    setErr(''); setWarn(''); setStep('analyzing');
    try {
      setMsg('Reading your file…');
      const { pages, truncated } = await loadPages(files, (n) => setMsg(`Reading pages… ${n}`));
      pagesRef.current = pages;
      if (truncated) setWarn('Only the first 40 pages were used. Import the rest as a second file.');
      const found = []; const failed = [];
      if (layout === 'auto') {
        for (let s = 0; s < pages.length; s += BATCH) {
          const batch = pages.slice(s, s + BATCH);
          setMsg(`AI is reading pages ${s + 1}–${s + batch.length} of ${pages.length}…`);
          try {
            const r = await api.analyzePages(batch.map((p, i) => new File([p.send], `page-${s + i + 1}.jpg`, { type: 'image/jpeg' })));
            r.data.products.forEach((p) => found.push({ ...p, page: s + p.page - 1 }));
          } catch (e) {
            if ([401, 403, 503].includes(e.status)) throw e; // config problem: no point continuing
            failed.push(`${s + 1}–${s + batch.length}`); toast(e.message, 'err');
            if (e.status === 429) break; // free quota used up: stop instead of failing every batch
          }
        }
        if (failed.length) setWarn((w) => `${w} Pages ${failed.join(', ')} were not read - import them again later, or use a manual layout.`.trim());
      } else {
        // No AI: cut each page into the chosen grid. You choose category/price/name in the review step.
        pages.forEach((pg, pi) => gridBoxes(layout).forEach((bbox) => found.push({
          page: pi, name: pg.isImage ? nameFromFile(pg.label) : '', nameSource: 'manual', description: '', category: null, confidence: 1,
          seenPrice: null, seenPriceLabel: '', bbox, pad: 0, notes: '', duplicateOf: null,
        })));
      }
      setMsg('Preparing photos…');
      const built = [];
      for (const [i, p] of found.entries()) {
        const page = pages[p.page]; const blob = await cropPage(page, p.bbox, p.pad ?? 0.03);
        built.push({
          id: i, include: !p.duplicateOf, ...p, category: catByName(p.category), price: '', stock: 1,
          mode: p.bbox ? 'crop' : 'page', cropUrl: URL.createObjectURL(blob), cropBlob: blob, customFile: null, customUrl: null,
        });
      }
      setRows(built); setStep('review');
      if (!built.length) setErr('No products were found. Try a clearer file.');
    } catch (e) { setErr(e.message); setStep('pick'); }
  };

  const previewOf = (r) => (r.mode === 'none' ? null : r.customUrl || (r.mode === 'page' ? pagesRef.current[r.page]?.url : r.cropUrl));
  const blobOf = (r) => (r.mode === 'none' ? null : r.customFile || (r.mode === 'page' ? pagesRef.current[r.page].hi : r.cropBlob));

  const included = rows.filter((r) => r.include);
  const problems = (r) => [!r.name.trim() && 'name', !r.category && 'category', (r.price === '' || Number(r.price) < 0) && 'price'].filter(Boolean);
  const blocked = included.some((r) => problems(r).length);

  const applyBulk = () => setRows((rs) => rs.map((r) => (r.include ? { ...r, ...(bulk.category && { category: bulk.category }), ...(bulk.price !== '' && { price: bulk.price }), ...(bulk.stock !== '' && { stock: bulk.stock }) } : r)));

  const confirm = async () => {
    setErr(''); setStep('saving');
    try {
      const items = [];
      const withPhoto = included.filter((r) => blobOf(r));
      const uploaded = new Map();
      for (let i = 0; i < withPhoto.length; i += 5) {
        setMsg(`Uploading photos ${Math.min(i + 5, withPhoto.length)} / ${withPhoto.length}…`);
        const grp = withPhoto.slice(i, i + 5);
        const r = await api.upload(grp.map((x, k) => new File([blobOf(x)], `${x.name.replace(/\W+/g, '-')}-${k}.jpg`, { type: 'image/jpeg' })));
        grp.forEach((x, k) => uploaded.set(x.id, [r.data[k]]));
      }
      setMsg('Adding products…');
      included.forEach((r) => items.push({ name: r.name, description: r.description, category: r.category, price: Number(r.price), stock: Number(r.stock), images: uploaded.get(r.id) || [] }));
      const r = await api.confirmImport(items);
      setResult(r.data); setStep('done');
    } catch (e) { setErr(e.message); setStep('review'); }
  };

  const reset = () => { setRows([]); setResult(null); setErr(''); setWarn(''); pagesRef.current = []; setStep('pick'); };

  if (!status) return err ? <ErrorBox error={err} /> : <Spinner />;
  const field = 'input !py-2';

  return (
    <>
      <PageHeader title="Import from PDF" subtitle="Upload a PDF or photos of items you purchased. AI reads them, you review, then confirm." />
      <ErrorBox error={err} />
      {warn && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">{warn}</p>}

      {step === 'pick' && (
        <div className="card mb-4 space-y-2">
          <label className="label" htmlFor="layout">How are the products arranged in your file?</label>
          <select id="layout" className="input max-w-md" value={layout} onChange={(e) => setLayout(e.target.value)}>
            {status.aiEnabled && <option value="auto">Let AI find the products, names and categories (free Gemini)</option>}
            {LAYOUTS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
          </select>
          <p className="text-xs text-brand-dark/60">{layout === 'auto' ? 'AI reads the file, then you review everything before it is saved.' : 'The page is cut into equal parts - you pick the name, category and price in the next step. '}{!status.aiEnabled && 'To enable automatic names & categories, add a free GEMINI_API_KEY to the API .env (see SETUP_GUIDE).'}</p>
        </div>
      )}
      {step === 'pick' && (
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); start(e.dataTransfer.files); }}
          onClick={() => fileRef.current.click()} className={`card cursor-pointer border-2 border-dashed py-16 text-center ${drag ? 'border-brand-burgundy bg-brand-blush' : 'border-brand-gold/60'}`}>
          <p className="text-5xl">📄</p><p className="mt-3 font-serif text-xl text-brand-burgundy">Drop your PDF or photos here</p>
          <p className="mt-1 text-sm text-brand-dark/60">PDF, JPG, PNG · up to 40 pages at a time</p>
          <input ref={fileRef} type="file" hidden multiple accept="application/pdf,image/*" onChange={(e) => { start(e.target.files); e.target.value = ''; }} />
        </div>
      )}

      {(step === 'analyzing' || step === 'saving') && <div className="card py-16 text-center"><p className="animate-pulse text-3xl">✨</p><p className="mt-3 text-sm text-brand-dark/70">{msg}</p></div>}

      {step === 'review' && (
        <>
          <div className="card sticky top-16 z-20 mb-4 flex flex-wrap items-end gap-3">
            <label className="flex items-center gap-2 self-center text-sm"><input type="checkbox" checked={included.length === rows.length} onChange={(e) => setRows(rows.map((r) => ({ ...r, include: e.target.checked })))} /> All ({included.length}/{rows.length})</label>
            <select className={`${field} !w-44`} value={bulk.category} onChange={(e) => setBulk({ ...bulk, category: e.target.value })} aria-label="Set category for selected"><option value="">Set category…</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
            <input className={`${field} !w-28`} type="number" min="0" placeholder="Set price ₹" value={bulk.price} onChange={(e) => setBulk({ ...bulk, price: e.target.value })} />
            <input className={`${field} !w-24`} type="number" min="0" placeholder="Stock" value={bulk.stock} onChange={(e) => setBulk({ ...bulk, stock: e.target.value })} />
            <button className="btn-ghost !py-2" onClick={applyBulk}>Apply to selected</button>
            <div className="ml-auto flex gap-2"><button className="btn-ghost" onClick={reset}>Start over</button><button className="btn-primary" disabled={!included.length || blocked} onClick={confirm}>Confirm & Add {included.length}</button></div>
          </div>
          {blocked && <p className="mb-3 text-sm text-red-700">Fill the highlighted fields (red) for every selected item. Prices are never guessed - enter your selling price.</p>}

          <div className="grid gap-4 lg:grid-cols-2">
            {rows.map((r) => {
              const bad = problems(r); const prev = previewOf(r);
              return (
                <div key={r.id} className={`card flex gap-4 !p-4 ${r.include ? '' : 'opacity-50'}`}>
                  <div className="w-28 shrink-0 space-y-2">
                    <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-brand-blush">{prev ? <img src={prev} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-brand-dark/40">No photo</span>}</div>
                    <select className="input !px-2 !py-1 text-xs" value={r.mode} onChange={(e) => upd(r.id, { mode: e.target.value, customFile: null, customUrl: null })} aria-label="Photo mode">{MODES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
                    <label className="block cursor-pointer text-center text-xs text-brand-burgundy hover:underline">Replace photo<input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files[0]; if (f) upd(r.id, { customFile: f, customUrl: URL.createObjectURL(f), mode: 'crop' }); }} /></label>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start gap-2"><input type="checkbox" className="mt-3" checked={r.include} onChange={(e) => upd(r.id, { include: e.target.checked })} aria-label="Include" />
                      <input className={`${field} ${bad.includes('name') && '!border-red-500'}`} value={r.name} onChange={(e) => upd(r.id, { name: e.target.value })} aria-label="Name" /></div>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {r.nameSource === 'suggested' && layout === 'auto' && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-800">AI-suggested name</span>}
                      {r.duplicateOf && <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-800">Already exists as {r.duplicateOf}</span>}
                      {r.confidence < 0.6 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">Please check</span>}
                    </div>
                    <div className="grid grid-cols-[1fr_88px_64px] gap-2">
                      <select className={`${field} ${bad.includes('category') && '!border-red-500'}`} value={r.category} onChange={(e) => upd(r.id, { category: e.target.value })} aria-label="Category"><option value="">Category…</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
                      <input className={`${field} ${bad.includes('price') && '!border-red-500'}`} type="number" min="0" placeholder="₹ Price" value={r.price} onChange={(e) => upd(r.id, { price: e.target.value })} aria-label="Selling price" />
                      <input className={field} type="number" min="0" value={r.stock} onChange={(e) => upd(r.id, { stock: e.target.value })} aria-label="Stock" />
                    </div>
                    {r.seenPrice != null && <p className="text-xs text-brand-dark/60">Seen in file: {inr(r.seenPrice)}{r.seenPriceLabel && ` (${r.seenPriceLabel})`} - may be supplier price. <button className="text-brand-burgundy underline" onClick={() => upd(r.id, { price: r.seenPrice })}>Use as price</button></p>}
                    <textarea rows={2} className={`${field} text-xs`} value={r.description} onChange={(e) => upd(r.id, { description: e.target.value })} aria-label="Description" />
                    {r.notes && <p className="text-xs text-amber-800">⚠ {r.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {step === 'done' && result && (
        <div className="card text-center">
          <p className="text-5xl">🎉</p><h2 className="mt-2 text-2xl text-brand-burgundy">{result.created.length} product{result.created.length === 1 ? '' : 's'} added</h2>
          <p className="mt-1 text-sm text-brand-dark/60">{result.created.map((c) => c.productId).join(', ')}</p>
          {result.failed.length > 0 && <div className="mx-auto mt-4 max-w-md rounded-xl bg-red-50 p-3 text-left text-sm text-red-800"><p className="font-medium">{result.failed.length} could not be added:</p>{result.failed.map((f) => <p key={f.index}>• {f.name || `Item ${f.index + 1}`}: {f.error}</p>)}</div>}
          <div className="mt-6 flex justify-center gap-3"><Link to="/products" className="btn-primary">View products</Link><button className="btn-ghost" onClick={reset}>Import another file</button></div>
        </div>
      )}
    </>
  );
}

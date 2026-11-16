import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox, PageHeader, Spinner } from '../components/ui';

const FLAGS = [['isNewArrival', 'New Arrival'], ['isFeatured', 'Featured'], ['isFestive', 'Festive'], ['isMinimal', 'Minimal'], ['isGift', 'Gift'], ['isDailyWear', 'Daily Wear'], ['isBudget', 'Budget']];
const EMPTY = { name: '', category: '', price: '', originalPrice: '', stock: 1, isSoldOut: false, description: '', emoji: '✨', images: [], isNewArrival: true, isFeatured: false, isFestive: false, isMinimal: false, isGift: false, isDailyWear: false, isBudget: false };

export default function ProductFormPage() {
  const { id } = useParams(); const edit = Boolean(id);
  const nav = useNavigate(); const toast = useToast(); const { can } = useAuth();
  const [f, setF] = useState(EMPTY); const [cats, setCats] = useState([]);
  const [ready, setReady] = useState(!edit); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [urlInput, setUrlInput] = useState(''); const [uploading, setUploading] = useState(false); const [drag, setDrag] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.categories().then((r) => { setCats(r.data); if (!edit && r.data[0]) setF((s) => ({ ...s, category: s.category || r.data[0]._id })); });
    if (edit) api.product(id).then((r) => { const p = r.data; setF({ ...EMPTY, ...p, category: p.category, originalPrice: p.originalPrice ?? '', images: p.images || [] }); setReady(true); }).catch((e) => setErr(e.message));
  }, [id, edit]);

  if (!can('editProducts')) return <ErrorBox error="You do not have permission to add or edit products." />;
  if (!ready) return err ? <ErrorBox error={err} /> : <Spinner />;
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const addFiles = async (list) => {
    const files = [...list].filter((x) => x.type.startsWith('image/'));
    if (!files.length) return;
    if (f.images.length + files.length > 5) return setErr('Maximum 5 images per product');
    setUploading(true); setErr('');
    try { const r = await api.upload(files); set('images', [...f.images, ...r.data]); } catch (e) { setErr(e.message); } finally { setUploading(false); }
  };
  const addUrl = () => { if (!/^https?:\/\//i.test(urlInput)) return setErr('Enter a valid image URL starting with http(s)://'); if (f.images.length >= 5) return setErr('Maximum 5 images per product'); set('images', [...f.images, { url: urlInput.trim() }]); setUrlInput(''); setErr(''); };
  const move = (i, d) => { const a = [...f.images]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set('images', a); };

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    const body = { ...f, price: Number(f.price), stock: Number(f.stock), originalPrice: f.originalPrice === '' ? null : Number(f.originalPrice) };
    if (f.isSoldOut) body.stock = 0;
    try {
      if (edit) await api.updateProduct(id, body); else await api.createProduct(body);
      toast(edit ? 'Product updated' : 'Product created'); nav('/products');
    } catch (x) { setErr(x.message); window.scrollTo({ top: 0, behavior: 'smooth' }); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={edit ? `Edit ${id}` : 'Add New Product'} />
      <ErrorBox error={err} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="card">
          <h2 className="mb-3 text-lg text-brand-burgundy">Photos <span className="text-sm text-brand-dark/50">({f.images.length}/5)</span></h2>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }} onClick={() => fileRef.current.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center text-sm transition ${drag ? 'border-brand-burgundy bg-brand-blush' : 'border-brand-gold/60'}`}>
            <p className="text-3xl">📷</p><p className="mt-2">{uploading ? 'Uploading…' : 'Drag & drop photos or click to browse'}</p><p className="text-xs text-brand-dark/50">JPG, PNG, WEBP · max 5 MB each</p>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </div>
          <div className="mt-3 flex gap-2"><input className="input" placeholder="…or paste an image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} /><button type="button" className="btn-ghost" onClick={addUrl}>Add</button></div>
          {f.images.length > 0 && <div className="mt-4 grid grid-cols-3 gap-3">{f.images.map((im, i) => (
            <div key={im.url + i} className="relative overflow-hidden rounded-xl border border-[#EBD9D3]"><img src={im.url} alt={`Photo ${i + 1}`} className="aspect-square w-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-brand-burgundy px-1.5 text-[10px] text-white">Main</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 px-1 text-white"><button type="button" onClick={() => move(i, -1)} aria-label="Move left">◀</button><button type="button" onClick={() => set('images', f.images.filter((_, k) => k !== i))} aria-label="Remove photo">🗑</button><button type="button" onClick={() => move(i, 1)} aria-label="Move right">▶</button></div></div>))}</div>}
        </div>

        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="name">Product Name *</label><input id="name" required className="input" value={f.name} maxLength={120} onChange={(e) => set('name', e.target.value)} /></div>
            <div><label className="label">Product ID</label><input className="input bg-neutral-50" readOnly value={edit ? id : 'Auto-generated (TC-XXX)'} /></div>
            <div><label className="label" htmlFor="cat">Category *</label><select id="cat" required className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
            <div><label className="label" htmlFor="price">Price (₹) *</label><input id="price" required type="number" min="0" step="1" className="input" value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
            <div><label className="label" htmlFor="op">Original price (optional)</label><input id="op" type="number" min="0" className="input" value={f.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} /></div>
            <div><label className="label" htmlFor="stock">Stock (optional)</label><input id="stock" type="number" min="0" className="input" value={f.isSoldOut ? 0 : f.stock} disabled={f.isSoldOut} onChange={(e) => set('stock', e.target.value)} /></div>
            <div><label className="label">Status</label><div className="flex gap-4 pt-2 text-sm">
              <label className="flex items-center gap-2"><input type="radio" checked={!f.isSoldOut} onChange={() => { set('isSoldOut', false); if (Number(f.stock) <= 0) set('stock', 1); }} /> Available</label>
              <label className="flex items-center gap-2"><input type="radio" checked={f.isSoldOut} onChange={() => set('isSoldOut', true)} /> Sold Out</label></div></div>
          </div>
          <div><label className="label" htmlFor="desc">Description</label><textarea id="desc" rows={4} maxLength={2000} className="input" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div><label className="label">Show in</label><div className="flex flex-wrap gap-2">{FLAGS.map(([k, t]) => (
            <label key={k} className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${f[k] ? 'border-brand-burgundy bg-brand-burgundy text-white' : 'border-brand-gold/50'}`}><input type="checkbox" hidden checked={f[k]} onChange={(e) => set(k, e.target.checked)} />{t}</label>))}</div></div>
          <div className="max-w-[140px]"><label className="label" htmlFor="emoji">Placeholder emoji</label><input id="emoji" className="input" maxLength={4} value={f.emoji} onChange={(e) => set('emoji', e.target.value)} /></div>
          <div className="flex justify-end gap-2 border-t border-[#F3E6E1] pt-4"><button type="button" className="btn-ghost" onClick={() => nav('/products')}>Cancel</button><button className="btn-primary" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save Product'}</button></div>
        </div>
      </div>
    </form>
  );
}

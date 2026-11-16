import { useEffect, useState } from 'react';
import { api } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox, Modal, PageHeader, Spinner } from '../components/ui';

export default function BannersPage() {
  const { can } = useAuth(); const toast = useToast();
  const [list, setList] = useState(null); const [err, setErr] = useState(''); const [edit, setEdit] = useState(null);
  const load = () => api.banners().then((r) => setList(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try { await api.saveBanner({ ...edit, displayOrder: Number(edit.displayOrder) || 0 }, edit._id); toast('Banner saved'); setEdit(null); load(); } catch (x) { toast(x.message, 'err'); }
  };
  const remove = async (b) => { if (!window.confirm('Delete this banner?')) return; try { await api.deleteBanner(b._id); toast('Banner deleted'); load(); } catch (x) { toast(x.message, 'err'); } };
  const canEdit = can('catalogue');
  const set = (k, v) => setEdit({ ...edit, [k]: v });
  return (
    <>
      <PageHeader title="Banners" subtitle="Promotional banners for the website">{canEdit && <button className="btn-primary" onClick={() => setEdit({ title: '', subtitle: '', imageUrl: '', linkUrl: '', displayOrder: list?.length || 0, isActive: true })}>+ Add Banner</button>}</PageHeader>
      <ErrorBox error={err} />
      {!list ? <Spinner /> : !list.length ? <p className="card text-center text-sm text-brand-dark/50">No banners yet.</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => (
          <div key={b._id} className="card !p-0 overflow-hidden">{b.imageUrl ? <img src={b.imageUrl} alt="" className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center bg-brand-blush text-4xl">🖼️</div>}
            <div className="p-4"><p className="font-serif text-lg">{b.title || 'Untitled'}</p><p className="text-sm text-brand-dark/60">{b.subtitle}</p><p className="mt-1 text-xs">{b.isActive ? '🟢 Active' : '⚪ Hidden'} · order {b.displayOrder}</p>
              {canEdit && <div className="mt-3 flex gap-2"><button className="btn-ghost !py-1.5" onClick={() => setEdit(b)}>Edit</button><button className="btn-ghost !py-1.5 text-red-700" onClick={() => remove(b)}>Delete</button></div>}</div></div>))}</div>)}
      {edit && <Modal title={edit._id ? 'Edit Banner' : 'New Banner'} onClose={() => setEdit(null)}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={edit.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div><label className="label">Subtitle</label><input className="input" value={edit.subtitle} onChange={(e) => set('subtitle', e.target.value)} /></div>
          <div><label className="label">Image URL</label><input className="input" placeholder="https://…" value={edit.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} /></div>
          <div><label className="label">Link (optional)</label><input className="input" placeholder="/catalogue?collection=festive" value={edit.linkUrl} onChange={(e) => set('linkUrl', e.target.value)} /></div>
          <div className="flex items-center justify-between"><div className="w-28"><label className="label">Order</label><input type="number" className="input" value={edit.displayOrder} onChange={(e) => set('displayOrder', e.target.value)} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active</label></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form></Modal>}
    </>
  );
}

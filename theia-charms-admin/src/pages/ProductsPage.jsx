import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox, Modal, PageHeader, Spinner, StatusBadge, Thumb, inr } from '../components/ui';

export default function ProductsPage() {
  const { can } = useAuth(); const toast = useToast(); const nav = useNavigate();
  const [f, setF] = useState({ q: '', category: '', status: '', page: 1 });
  const [data, setData] = useState(null); const [cats, setCats] = useState([]);
  const [err, setErr] = useState(''); const [del, setDel] = useState(null);

  const load = useCallback(() => api.products({ ...f, limit: 10, sort: 'newest' }).then((r) => { setData(r); setErr(''); }).catch((e) => setErr(e.message)), [f]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { api.categories().then((r) => setCats(r.data)).catch(() => {}); }, []);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v, page: k === 'page' ? v : 1 }));

  const toggle = async (p) => { try { await api.setStatus(p.productId, { isSoldOut: !p.isSoldOut }); toast(`${p.productId} marked ${p.isSoldOut ? 'Available' : 'Sold Out'}`); load(); } catch (e) { toast(e.message, 'err'); } };
  const dup = async (p) => { try { const r = await api.duplicateProduct(p.productId); toast(`Duplicated as ${r.data.productId}`); nav(`/products/${r.data.productId}`); } catch (e) { toast(e.message, 'err'); } };
  const confirmDel = async () => { try { await api.deleteProduct(del.productId); toast(`${del.productId} deleted`); setDel(null); load(); } catch (e) { toast(e.message, 'err'); } };

  return (
    <>
      <PageHeader title="Products" subtitle="All catalogue items">{can('editProducts') && <Link to="/products/new" className="btn-primary">+ Add Product</Link>}</PageHeader>
      <div className="card mb-4 grid gap-3 sm:grid-cols-3">
        <input className="input" placeholder="Search name or TC-001…" value={f.q} onChange={(e) => set('q', e.target.value)} aria-label="Search" />
        <select className="input" value={f.category} onChange={(e) => set('category', e.target.value)} aria-label="Category"><option value="">All categories</option>{cats.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}</select>
        <select className="input" value={f.status} onChange={(e) => set('status', e.target.value)} aria-label="Status"><option value="">All status</option><option value="available">Available</option><option value="sold_out">Sold Out</option></select>
      </div>
      <ErrorBox error={err} />
      {!data ? <Spinner /> : (
        <div className="card overflow-x-auto !p-0">
          <table className="w-full min-w-[720px]"><thead className="border-b border-[#F3E6E1]"><tr>{['Product', 'ID', 'Category', 'Price', 'Stock', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#F3E6E1]">
              {data.data.map((p) => (
                <tr key={p._id} className="hover:bg-brand-cream/60">
                  <td className="td"><div className="flex items-center gap-3"><Thumb product={p} /><span className="font-medium">{p.name}</span></div></td>
                  <td className="td font-mono text-xs">{p.productId}</td><td className="td">{p.categoryName}</td><td className="td">{inr(p.price)}</td><td className="td">{p.stock}</td>
                  <td className="td">{can('stock') ? <button onClick={() => toggle(p)} title="Click to toggle" aria-label={`Toggle status of ${p.name}`}><StatusBadge soldOut={p.isSoldOut} /></button> : <StatusBadge soldOut={p.isSoldOut} />}</td>
                  <td className="td whitespace-nowrap text-right">
                    {can('editProducts') ? <><Link to={`/products/${p.productId}`} className="mr-1 rounded-lg p-2 hover:bg-brand-blush" title="Edit">✏️</Link>
                      <button onClick={() => dup(p)} className="mr-1 rounded-lg p-2 hover:bg-brand-blush" title="Duplicate">📄</button>
                      <button onClick={() => setDel(p)} className="rounded-lg p-2 hover:bg-red-50" title="Delete">🗑️</button></> : <span className="text-xs text-brand-dark/40">view only</span>}
                  </td>
                </tr>))}
              {!data.data.length && <tr><td colSpan={7} className="py-12 text-center text-sm text-brand-dark/50">No products found.</td></tr>}
            </tbody></table>
          <div className="flex items-center justify-between border-t border-[#F3E6E1] px-4 py-3 text-sm">
            <span className="text-brand-dark/60">{data.pagination.total} products</span>
            <div className="flex items-center gap-2"><button className="btn-ghost !py-1.5" disabled={f.page <= 1} onClick={() => set('page', f.page - 1)}>Previous</button><span>{f.page} / {data.pagination.pages || 1}</span><button className="btn-ghost !py-1.5" disabled={f.page >= data.pagination.pages} onClick={() => set('page', f.page + 1)}>Next</button></div>
          </div>
        </div>)}
      {del && <Modal title="Delete product?" onClose={() => setDel(null)}><p className="text-sm">Permanently delete <b>{del.name}</b> ({del.productId}) and its images? This cannot be undone.</p><div className="mt-5 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setDel(null)}>Cancel</button><button className="btn-danger" onClick={confirmDel}>Delete</button></div></Modal>}
    </>
  );
}

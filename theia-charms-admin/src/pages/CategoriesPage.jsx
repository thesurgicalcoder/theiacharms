import { useEffect, useState } from 'react';
import { api } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox, Modal, PageHeader, Spinner } from '../components/ui';

export default function CategoriesPage() {
  const { can } = useAuth(); const toast = useToast();
  const [list, setList] = useState(null); const [err, setErr] = useState(''); const [edit, setEdit] = useState(null);
  const load = () => api.categories().then((r) => setList(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    try { await api.saveCategory({ name: edit.name, icon: edit.icon, displayOrder: Number(edit.displayOrder) || 0, isActive: edit.isActive }, edit._id); toast('Category saved'); setEdit(null); load(); } catch (x) { toast(x.message, 'err'); }
  };
  const remove = async (c) => { if (!window.confirm(`Delete category "${c.name}"?`)) return; try { await api.deleteCategory(c._id); toast('Category deleted'); load(); } catch (x) { toast(x.message, 'err'); } };
  const canEdit = can('catalogue');
  return (
    <>
      <PageHeader title="Categories">{canEdit && <button className="btn-primary" onClick={() => setEdit({ name: '', icon: '✨', displayOrder: (list?.length || 0), isActive: true })}>+ Add Category</button>}</PageHeader>
      <ErrorBox error={err} />
      {!list ? <Spinner /> : (
        <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[520px]"><thead className="border-b border-[#F3E6E1]"><tr>{['', 'Name', 'Products', 'Order', 'Visible', ''].map((h, i) => <th key={i} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#F3E6E1]">{list.map((c) => (
            <tr key={c._id}><td className="td text-2xl">{c.icon}</td><td className="td font-medium">{c.name}</td><td className="td">{c.productCount}</td><td className="td">{c.displayOrder}</td><td className="td">{c.isActive ? 'Yes' : 'Hidden'}</td>
              <td className="td text-right">{canEdit && <><button className="mr-1 rounded-lg p-2 hover:bg-brand-blush" onClick={() => setEdit(c)} aria-label="Edit">✏️</button><button className="rounded-lg p-2 hover:bg-red-50" onClick={() => remove(c)} aria-label="Delete">🗑️</button></>}</td></tr>))}</tbody></table></div>)}
      {edit && <Modal title={edit._id ? 'Edit Category' : 'New Category'} onClose={() => setEdit(null)}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Name *</label><input required className="input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className="label">Icon (emoji)</label><input className="input" maxLength={4} value={edit.icon} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} /></div>
            <div><label className="label">Display order</label><input type="number" className="input" value={edit.displayOrder} onChange={(e) => setEdit({ ...edit, displayOrder: e.target.value })} /></div></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.isActive} onChange={(e) => setEdit({ ...edit, isActive: e.target.checked })} /> Visible on website</label>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button className="btn-primary">Save</button></div>
        </form></Modal>}
    </>
  );
}

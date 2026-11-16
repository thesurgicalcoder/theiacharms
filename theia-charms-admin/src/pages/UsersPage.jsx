import { useEffect, useState } from 'react';
import { api } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox, Modal, PageHeader, RoleBadge, Spinner, fmtDate } from '../components/ui';

export default function UsersPage() {
  const { user: me } = useAuth(); const toast = useToast();
  const [list, setList] = useState(null); const [err, setErr] = useState(''); const [form, setForm] = useState(null);
  const load = () => api.users().then((r) => setList(r.data)).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const act = async (fn, ok) => { try { await fn(); toast(ok); load(); } catch (x) { toast(x.message, 'err'); } };
  const invite = async (e) => { e.preventDefault(); try { await api.createUser(form); toast('Team member added'); setForm(null); load(); } catch (x) { toast(x.message, 'err'); } };

  return (
    <>
      <PageHeader title="Admin Users" subtitle="Only the owner can manage team access"><button className="btn-primary" onClick={() => setForm({ name: '', email: '', password: '', role: 'manager' })}>+ Invite Member</button></PageHeader>
      <ErrorBox error={err} />
      {!list ? <Spinner /> : (
        <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[640px]"><thead className="border-b border-[#F3E6E1]"><tr>{['Member', 'Role', 'Status', 'Last active', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#F3E6E1]">{list.map((u) => {
            const self = u._id === me._id; const locked = u.role === 'owner';
            return (<tr key={u._id}><td className="td"><p className="font-medium">{u.name}{self && ' (you)'}</p><p className="text-xs text-brand-dark/50">{u.email}</p></td>
              <td className="td">{locked ? <RoleBadge role={u.role} /> : <select className="input !w-auto !py-1.5" value={u.role} onChange={(e) => act(() => api.updateUser(u._id, { role: e.target.value }), 'Role updated')} aria-label={`Role for ${u.name}`}><option value="admin">Admin</option><option value="manager">Manager</option><option value="viewer">Viewer</option></select>}</td>
              <td className="td"><span className={`rounded-full px-2.5 py-0.5 text-xs ${u.isActive ? 'bg-[#E6F4EA] text-green-800' : 'bg-neutral-200 text-neutral-600'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
              <td className="td text-xs">{fmtDate(u.lastLogin)}</td>
              <td className="td whitespace-nowrap text-right">{!locked && <><button className="btn-ghost !py-1.5" onClick={() => act(() => api.updateUser(u._id, { isActive: !u.isActive }), u.isActive ? 'Account deactivated' : 'Account activated')}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                <button className="ml-2 rounded-lg p-2 hover:bg-red-50" aria-label="Revoke access" onClick={() => window.confirm(`Permanently revoke access for ${u.name}?`) && act(() => api.deleteUser(u._id), 'Access revoked')}>🗑️</button></>}</td></tr>);
          })}</tbody></table></div>)}
      {form && <Modal title="Invite Team Member" onClose={() => setForm(null)}>
        <form onSubmit={invite} className="space-y-4">
          <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div><label className="label">Temporary password (min 8)</label><input required minLength={8} type="text" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div><label className="label">Role</label><select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="admin">Admin – full catalogue</option><option value="manager">Manager – stock & status only</option><option value="viewer">Viewer – read only</option></select></div>
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary">Add member</button></div>
        </form></Modal>}
    </>
  );
}

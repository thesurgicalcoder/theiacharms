import { useEffect, useState } from 'react';
import { api } from '../services/adminApi';
import { ErrorBox, PageHeader, RoleBadge, Spinner, fmtDate } from '../components/ui';

const show = (d) => {
  if (!d) return '';
  if (d.from !== undefined && d.to !== undefined) return `${JSON.stringify(d.from)} → ${JSON.stringify(d.to)}`;
  return [d.name, d.role && `role: ${d.role}`, d.filter && `filter: ${d.filter}`, d.rows !== undefined && `${d.rows} rows`].filter(Boolean).join(' · ');
};

export default function LogsPage() {
  const [f, setF] = useState({ type: '', q: '', page: 1 });
  const [data, setData] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { const t = setTimeout(() => api.logs(f).then(setData).catch((e) => setErr(e.message)), 250); return () => clearTimeout(t); }, [f]);
  return (
    <>
      <PageHeader title="Activity Logs" subtitle="Audit trail of every admin action" />
      <div className="card mb-4 grid gap-3 sm:grid-cols-2">
        <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, page: 1 })} aria-label="Action type"><option value="">All Actions</option><option value="product">Product Updates</option><option value="stock">Stock Changes</option><option value="team">Team Changes</option></select>
        <input className="input" placeholder="Search staff member or product ID…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value, page: 1 })} />
      </div>
      <ErrorBox error={err} />
      {!data ? <Spinner /> : (
        <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[720px]"><thead className="border-b border-[#F3E6E1]"><tr>{['When', 'Who', 'Action', 'Target', 'Details'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#F3E6E1]">{data.data.map((l) => (
            <tr key={l._id}><td className="td whitespace-nowrap text-xs">{fmtDate(l.timestamp)}</td><td className="td"><p>{l.userName || '—'}</p>{l.userRole && <RoleBadge role={l.userRole} />}</td>
              <td className="td"><span className="rounded bg-brand-blush px-2 py-0.5 font-mono text-xs">{l.action}</span></td><td className="td font-mono text-xs">{l.targetId || '—'}</td><td className="td text-xs text-brand-dark/70">{show(l.details)}</td></tr>))}
            {!data.data.length && <tr><td colSpan={5} className="py-12 text-center text-sm text-brand-dark/50">No activity yet.</td></tr>}</tbody></table>
          <div className="flex items-center justify-between border-t border-[#F3E6E1] px-4 py-3 text-sm"><span>{data.pagination.total} events</span>
            <div className="flex items-center gap-2"><button className="btn-ghost !py-1.5" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Previous</button><span>{f.page} / {data.pagination.pages || 1}</span><button className="btn-ghost !py-1.5" disabled={f.page >= data.pagination.pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Next</button></div></div></div>)}
    </>
  );
}

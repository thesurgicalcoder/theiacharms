import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/adminApi';
import { ErrorBox, PageHeader, Spinner, StatusBadge, Thumb, inr } from '../components/ui';

function Donut({ available, soldOut }) {
  const total = available + soldOut || 1; const pct = Math.round((available / total) * 100);
  const r = 54; const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90" role="img" aria-label={`${pct}% available`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F4C7C2" strokeWidth="18" />
        <circle cx="70" cy="70" r={r} fill="none" stroke="#2E9B57" strokeWidth="18" strokeDasharray={`${(available / total) * c} ${c}`} />
        <text x="70" y="76" textAnchor="middle" className="rotate-90 fill-brand-burgundy font-serif text-2xl" style={{ transformOrigin: '70px 70px' }}>{pct}%</text>
      </svg>
      <ul className="space-y-2 text-sm"><li><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#2E9B57]" />Available ({available})</li><li><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#F4C7C2]" />Sold Out ({soldOut})</li></ul>
    </div>
  );
}

export default function DashboardPage() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.dashboard().then((r) => setD(r.data)).catch((e) => setErr(e.message)); }, []);
  if (err) return <ErrorBox error={err} />;
  if (!d) return <Spinner />;
  const cards = [['Total Products', d.total, '💎'], ['Available', d.available, '✅'], ['Sold Out', d.soldOut, '⛔'], ['Categories', d.categories, '🗂️']];
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live inventory overview" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map(([t, n, i]) => <div key={t} className="card"><p className="text-2xl">{i}</p><p className="mt-2 font-serif text-4xl text-brand-burgundy">{n}</p><p className="text-sm text-brand-dark/60">{t}</p></div>)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card"><div className="mb-3 flex justify-between"><h2 className="text-xl text-brand-burgundy">Recent Products</h2><Link to="/products" className="text-sm text-brand-burgundy hover:underline">View all →</Link></div>
          <ul className="divide-y divide-[#F3E6E1]">{d.recent.map((p) => (
            <li key={p._id} className="flex items-center gap-3 py-3"><Thumb product={p} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-brand-dark/50">{p.productId} · {inr(p.price)}</p></div><StatusBadge soldOut={p.isSoldOut} /></li>))}
            {!d.recent.length && <li className="py-6 text-center text-sm text-brand-dark/50">No products yet.</li>}</ul></div>
        <div className="card"><h2 className="mb-4 text-xl text-brand-burgundy">Product Status</h2><Donut available={d.available} soldOut={d.soldOut} /></div>
      </div>
    </>
  );
}

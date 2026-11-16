import { useState } from 'react';
import { api } from '../services/adminApi';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/ui';

export default function ExportPage() {
  const toast = useToast();
  const [f, setF] = useState({ filter: 'all', format: 'xlsx', from: '', to: '' });
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); try { await api.download(f); toast('Export downloaded'); } catch (e) { toast(e.message, 'err'); } finally { setBusy(false); } };
  return (
    <>
      <PageHeader title="Export Centre" subtitle="Download stock & inventory reports" />
      <div className="card max-w-xl space-y-5">
        <div><label className="label">Report</label><select className="input" value={f.filter} onChange={(e) => setF({ ...f, filter: e.target.value })}><option value="all">Complete product catalogue</option><option value="in_stock">In-stock items only</option><option value="sold_out">Sold-out items only</option></select></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="label">Created from (optional)</label><input type="date" className="input" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div><div><label className="label">Created to (optional)</label><input type="date" className="input" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div></div>
        <div><label className="label">Format</label><div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" checked={f.format === 'xlsx'} onChange={() => setF({ ...f, format: 'xlsx' })} /> Excel (.xlsx)</label><label className="flex items-center gap-2"><input type="radio" checked={f.format === 'csv'} onChange={() => setF({ ...f, format: 'csv' })} /> CSV</label></div></div>
        <p className="text-xs text-brand-dark/60">Columns: Product ID, Title, Category, Price (₹), Stock, Status, Image URLs, Created.</p>
        <button className="btn-primary" disabled={busy} onClick={go}>{busy ? 'Preparing…' : '📥 Download report'}</button>
      </div>
    </>
  );
}

import { useEffect } from 'react';

export const Spinner = ({ label = 'Loading…' }) => <p className="py-16 text-center text-sm text-brand-dark/50">{label}</p>;
export const ErrorBox = ({ error }) => error ? <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null;
export const PageHeader = ({ title, children, subtitle }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-3xl text-brand-burgundy">{title}</h1>{subtitle && <p className="mt-1 text-sm text-brand-dark/60">{subtitle}</p>}</div>
    <div className="flex gap-2">{children}</div>
  </div>
);
export const StatusBadge = ({ soldOut }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${soldOut ? 'bg-[#FCE8E6] text-red-800' : 'bg-[#E6F4EA] text-green-800'}`}>{soldOut ? 'Sold Out' : 'Available'}</span>
);
export const RoleBadge = ({ role }) => {
  const c = { owner: 'bg-brand-burgundy text-white', admin: 'bg-brand-gold/25 text-brand-wine', manager: 'bg-blue-100 text-blue-900', viewer: 'bg-neutral-200 text-neutral-700' }[role];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${c}`}>{role}</span>;
};
export function Modal({ title, onClose, children }) {
  useEffect(() => { const f = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', f); return () => document.removeEventListener('keydown', f); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-deepwine/50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl text-brand-burgundy">{title}</h2><button onClick={onClose} aria-label="Close" className="h-8 w-8 rounded-full hover:bg-brand-blush">✕</button></div>
        {children}
      </div>
    </div>
  );
}
export const Thumb = ({ product, size = 'h-12 w-12' }) => {
  const url = product.images?.[0]?.url;
  return url ? <img src={url} alt="" className={`${size} rounded-lg object-cover`} /> : <span className={`${size} flex items-center justify-center rounded-lg bg-brand-blush text-xl`}>{product.emoji || '✨'}</span>;
};
export const fmtDate = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

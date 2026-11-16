import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './ui';
import { siteImage } from '../utils/images';

const NAV = [
  ['/', '📊', 'Dashboard', 'viewProducts', true], ['/products', '💎', 'Products', 'viewProducts'], ['/products/new', '➕', 'Add Product', 'editProducts'], ['/import', '📄', 'Import from PDF', 'import'],
  ['/categories', '🗂️', 'Categories', 'viewProducts'], ['/banners', '🖼️', 'Banners', 'viewProducts'], ['/users', '👥', 'Admin Users', 'users'],
  ['/logs', '📜', 'Activity Logs', 'logs'], ['/export', '📥', 'Export Centre', 'export'], ['/settings', '⚙️', 'Settings', 'settings'],
];

export default function AdminLayout() {
  const { user, loading, logout, can } = useAuth();
  const [open, setOpen] = useState(false);
  if (loading) return <p className="py-32 text-center text-brand-dark/50">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;

  const link = ({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`;
  return (
    <div className="min-h-screen lg:flex">
      <aside className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-40 w-64 flex-col bg-brand-wine p-4 lg:sticky lg:top-0 lg:flex lg:h-screen`}>
        <div className="mb-6 flex items-center gap-2.5 px-2 pt-2">{siteImage('favicon') && <img src={siteImage('favicon')} alt="" className="h-10 w-10 object-contain brightness-0 invert" />}<div><p className="font-serif text-lg tracking-[0.12em] text-white">THEIA CHARMS</p><p className="text-[10px] uppercase tracking-[0.25em] text-brand-gold">Admin Panel</p></div></div>
        <nav className="flex-1 space-y-1 overflow-y-auto" onClick={() => setOpen(false)}>
          {NAV.filter(([, , , perm]) => can(perm)).map(([to, icon, text, , end]) => <NavLink key={to} to={to} end={end || to === '/products'} className={link}><span>{icon}</span>{text}</NavLink>)}
        </nav>
        <button onClick={logout} className="mt-3 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">🚪 Logout</button>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#EBD9D3] bg-brand-cream/95 px-4 py-3 backdrop-blur lg:px-8">
          <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 text-xl lg:hidden" aria-label="Menu">☰</button>
          <p className="hidden text-sm text-brand-dark/60 lg:block">Welcome back, <b className="text-brand-burgundy">{user.name}</b></p>
          <div className="flex items-center gap-3"><RoleBadge role={user.role} /><span className="hidden text-sm sm:block">{user.email}</span></div>
        </header>
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}

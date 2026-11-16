import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/adminApi';
import { ErrorBox } from '../components/ui';
import { siteImage } from '../utils/images';

export default function LoginPage() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const resetToken = params.get('token');
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login');
  const [f, setF] = useState({ email: '', password: '', remember: false });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const bg = siteImage('admin-login-bg'); const emblem = siteImage('favicon');

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setMsg(''); setBusy(true);
    try {
      if (mode === 'login') { await login(f.email, f.password, f.remember); nav('/'); }
      else if (mode === 'forgot') { const r = await api.forgot(f.email); setMsg(r.message); }
      else { const r = await api.reset(resetToken, f.password); setMsg(r.message); setMode('login'); setF({ ...f, password: '' }); }
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blush to-brand-cream p-4" style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
      <div className="grid w-full max-w-5xl items-center gap-8 md:grid-cols-2">
      <div className="hidden text-center md:block">
        {emblem && <img src={emblem} alt="" className="mx-auto h-36 w-36 object-contain" />}
        <p className="mt-2 font-serif text-4xl tracking-[0.12em] text-brand-burgundy">THEIA CHARMS</p><p className="mt-1 font-serif text-xl text-brand-dark/80">Admin Panel</p>
      </div>
      <form onSubmit={submit} className="w-full max-w-md justify-self-center rounded-3xl border border-brand-gold/40 bg-white/95 p-8 shadow-xl">
        <div className="mb-6 text-center md:hidden">{emblem && <img src={emblem} alt="" className="mx-auto mb-2 h-16 w-16 object-contain" />}<p className="font-serif text-2xl tracking-[0.15em] text-brand-burgundy">THEIA CHARMS</p><p className="text-xs uppercase tracking-[0.3em] text-brand-gold">Admin Panel</p></div>
        <ErrorBox error={err} />{msg && <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{msg}</p>}
        {mode !== 'reset' && <div className="mb-4"><label className="label" htmlFor="email">Email</label><input id="email" type="email" required autoComplete="username" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>}
        {mode !== 'forgot' && (
          <div className="mb-4"><label className="label" htmlFor="pw">{mode === 'reset' ? 'New password (min 8)' : 'Password'}</label>
            <div className="relative"><input id="pw" type={show ? 'text' : 'password'} required minLength={mode === 'reset' ? 8 : undefined} autoComplete={mode === 'reset' ? 'new-password' : 'current-password'} className="input pr-12" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" aria-label="Toggle password visibility">{show ? '🙈' : '👁️'}</button></div></div>
        )}
        {mode === 'login' && <div className="mb-5 flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={f.remember} onChange={(e) => setF({ ...f, remember: e.target.checked })} /> Remember me</label><button type="button" onClick={() => { setMode('forgot'); setErr(''); }} className="text-brand-burgundy hover:underline">Forgot password?</button></div>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Login →' : mode === 'forgot' ? 'Send reset link' : 'Set new password'}</button>
        {mode === 'forgot' && <button type="button" onClick={() => setMode('login')} className="mt-4 w-full text-sm text-brand-burgundy hover:underline">← Back to login</button>}
      </form>
      </div>
    </div>
  );
}

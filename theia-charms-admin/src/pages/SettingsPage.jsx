import { useEffect, useState } from 'react';
import { api } from '../services/adminApi';
import { useToast } from '../context/ToastContext';
import { ErrorBox, PageHeader, Spinner } from '../components/ui';

export default function SettingsPage() {
  const toast = useToast();
  const [f, setF] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.settings().then((r) => setF(r.data)).catch((e) => setErr(e.message)); }, []);
  if (!f) return err ? <ErrorBox error={err} /> : <Spinner />;
  const set = (k, v) => setF({ ...f, [k]: v });
  const save = async (e) => { e.preventDefault(); try { const r = await api.saveSettings(f); setF(r.data); toast('Settings saved'); } catch (x) { toast(x.message, 'err'); } };
  const T = ({ k, label, hint, ...p }) => <div><label className="label">{label}</label><input className="input" value={f[k] || ''} onChange={(e) => set(k, e.target.value)} {...p} />{hint && <p className="mt-1 text-xs text-brand-dark/50">{hint}</p>}</div>;
  return (
    <>
      <PageHeader title="Settings" subtitle="Shown on the public website" />
      <form onSubmit={save} className="card max-w-xl space-y-4">
        {T({ k: 'whatsappPhone', label: 'WhatsApp number', hint: 'Digits only with country code, e.g. 919876543210. All enquiry buttons use this.', inputMode: 'numeric', required: true })}
        {T({ k: 'announcement', label: 'Announcement bar text' })}
        {T({ k: 'tagline', label: 'Tagline' })}
        {T({ k: 'address', label: 'Store address' })}
        {T({ k: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/…' })}
        {T({ k: 'email', label: 'Contact email', type: 'email' })}
        <div className="flex justify-end"><button className="btn-primary">Save settings</button></div>
      </form>
    </>
  );
}

import { useUI } from '../../context/UIContext';
export default function Toast() {
  const { toast } = useUI();
  if (!toast) return null;
  return (
    <div key={toast.id} role="status" className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 animate-fadeUp rounded-full bg-brand-wine px-5 py-2.5 text-sm text-white shadow-xl ring-1 ring-brand-gold">
      {toast.message}
    </div>
  );
}

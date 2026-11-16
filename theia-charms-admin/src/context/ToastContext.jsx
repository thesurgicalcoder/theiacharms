import { createContext, useContext, useState, useCallback } from 'react';
const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const toast = useCallback((message, type = 'ok') => { setT({ message, type, id: Date.now() }); setTimeout(() => setT((c) => (c && Date.now() - c.id >= 3000 ? null : c)), 3100); }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      {t && <div key={t.id} role="status" className={`fixed bottom-6 right-6 z-[80] max-w-sm rounded-xl px-5 py-3 text-sm text-white shadow-xl ${t.type === 'err' ? 'bg-red-700' : 'bg-brand-wine'}`}>{t.message}</div>}
    </Ctx.Provider>
  );
}

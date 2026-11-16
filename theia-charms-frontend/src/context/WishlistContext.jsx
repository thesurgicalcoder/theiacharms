import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const KEY = 'theia_wishlist';
const Ctx = createContext(null);
export const useWishlist = () => useContext(Ctx);

function read() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; } catch { return []; }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(read);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* private mode */ } }, [ids]);
  const has = useCallback((id) => ids.includes(id), [ids]);
  const toggle = useCallback((id) => { let added = false; setIds((cur) => { added = !cur.includes(id); return added ? [...cur, id] : cur.filter((x) => x !== id); }); return added; }, []);
  const remove = useCallback((id) => setIds((cur) => cur.filter((x) => x !== id)), []);
  return <Ctx.Provider value={{ ids, count: ids.length, has, toggle, remove }}>{children}</Ctx.Provider>;
}

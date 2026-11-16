import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadCatalog } from '../services/api';

const Ctx = createContext(null);
export const useCatalog = () => useContext(Ctx);

export function CatalogProvider({ children }) {
  const [state, setState] = useState({ products: [], categories: [], banners: [], settings: null, loading: true, live: false });
  useEffect(() => { loadCatalog().then((d) => setState({ ...d, loading: false })); }, []);
  const value = useMemo(() => ({ ...state, byId: Object.fromEntries(state.products.map((p) => [p.productId, p])) }), [state]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

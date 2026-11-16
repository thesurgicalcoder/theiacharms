import { createContext, useContext, useState, useCallback, useRef } from 'react';

const Ctx = createContext(null);
export const useUI = () => useContext(Ctx);

export function UIProvider({ children }) {
  const [product, setProduct] = useState(null);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const notify = useCallback((message) => {
    setToast({ message, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  return (
    <Ctx.Provider value={{ product, openProduct: setProduct, closeProduct: () => setProduct(null), wishlistOpen, setWishlistOpen, toast, notify }}>
      {children}
    </Ctx.Provider>
  );
}

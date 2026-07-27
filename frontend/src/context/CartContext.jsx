import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import cartService from '../services/cartService';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, role } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCustomer = isAuthenticated && role === ROLES.CUSTOMER;

  const refreshCart = useCallback(async () => {
    if (!isCustomer) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getMyCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = useMemo(
    () => (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart],
  );

  const value = useMemo(
    () => ({ cart, itemCount, loading, refreshCart }),
    [cart, itemCount, loading, refreshCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

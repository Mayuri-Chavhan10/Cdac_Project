import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { onApiEvent } from '../services/apiClient';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);

  const persistSession = useCallback((jwt, profile) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setToken(jwt);
    setUser(profile);
  }, []);

  const logout = useCallback((message) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    if (message) setAuthMessage(message);
  }, []);

  // Auto-login: if a token exists, fetch the profile to hydrate role/status.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await userService.getMyProfile();
        if (!cancelled) {
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global 401 handler -> force logout everywhere
  useEffect(() => {
    const unsubscribe = onApiEvent((event) => {
      if (event.type === 'UNAUTHORIZED' && localStorage.getItem(TOKEN_KEY)) {
        logout('Your session has expired. Please log in again.');
      }
    });
    return unsubscribe;
  }, [logout]);

  const login = useCallback(
    async (credentials) => {
      const jwt = await authService.login(credentials);
      localStorage.setItem(TOKEN_KEY, jwt);
      setToken(jwt);
      const profile = await userService.getMyProfile();
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      setUser(profile);
      return profile;
    },
    [],
  );

  const refreshProfile = useCallback(async () => {
    const profile = await userService.getMyProfile();
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    setUser(profile);
    return profile;
  }, []);

  const clearAuthMessage = useCallback(() => setAuthMessage(null), []);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role || null,
      isAuthenticated: !!token && !!user,
      loading,
      authMessage,
      login,
      logout,
      refreshProfile,
      clearAuthMessage,
      persistSession,
    }),
    [token, user, loading, authMessage, login, logout, refreshProfile, clearAuthMessage, persistSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

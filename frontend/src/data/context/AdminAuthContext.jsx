import { useEffect, useState } from 'react';
import { CUSTOMER_TOKEN_STORAGE_KEY, DEMO_ADMIN_STORAGE_KEY } from '../../constants/config';
import { adminLogin, adminLogout, fetchAdminMe } from '../api/admin.api';
import { AdminAuthContext } from './useAdminAuth';

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(DEMO_ADMIN_STORAGE_KEY)));

  useEffect(() => {
    const token = localStorage.getItem(DEMO_ADMIN_STORAGE_KEY);
    if (!token) return;

    let cancelled = false;
    fetchAdminMe()
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    const res = await adminLogin(credentials);
    localStorage.setItem(DEMO_ADMIN_STORAGE_KEY, res.token);
    setUser(res.user);
    return res.user;
  };

  const setSession = (token, adminUser) => {
    localStorage.setItem(DEMO_ADMIN_STORAGE_KEY, token);
    setUser(adminUser);
    setChecking(false);
  };

  const clearSession = () => {
    localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
    setUser(null);
    setChecking(false);
  };

  const logout = async () => {
    try {
      await adminLogout();
    } catch {
      // Ignore token expiration on logout
    } finally {
      localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        checking,
        login,
        setSession,
        clearSession,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

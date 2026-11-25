import { useEffect, useState } from 'react';
import { CUSTOMER_TOKEN_STORAGE_KEY, DEMO_ADMIN_STORAGE_KEY } from '../../constants/config';
import {
  fetchCustomerMe,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from '../api/auth.api';
import { CustomerAuthContext } from './useCustomerAuth';

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() =>
    Boolean(localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY))
  );

  useEffect(() => {
    const token = localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY);
    if (!token) return;

    let cancelled = false;
    fetchCustomerMe()
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
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
    const res = await loginCustomer(credentials);
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
    return res;
  };

  const register = async (payload) => {
    const res = await registerCustomer(payload);
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, res.token);
    setUser(res.user);
    return res.user;
  };

  const clearSession = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
    setUser(null);
    setChecking(false);
  };

  const logout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // Ignore expired token
    } finally {
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
      localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
      setUser(null);
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        checking,
        login,
        register,
        clearSession,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

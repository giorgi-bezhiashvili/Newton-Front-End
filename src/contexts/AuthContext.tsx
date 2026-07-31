"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  tryRestoreSession,
  type RegisterBody,
} from "../api";

interface AuthState {
  userName: string;
  role: string;
}

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  setUser: (userName: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const restored = await tryRestoreSession();
      if (cancelled) return;
      setAuth(restored ? { userName: restored.userName, role: restored.role } : null);
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (userName: string, password: string) => {
    const data = await loginRequest(userName, password);
    setAuth({ userName: data.userName, role: data.role });
  }, []);

  const register = useCallback(async (data: RegisterBody) => {
    await registerRequest(data);
    await login(data.userName, data.password);
  }, [login]);

  const setUser = useCallback((userName: string, role: string) => {
    setAuth({ userName, role });
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isAuthenticated: !!auth, isLoading, login, register, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
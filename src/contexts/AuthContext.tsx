"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginRequest, logoutRequest, registerRequest, type RegisterBody } from "../api";

interface AuthState {
  userName: string;
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface AuthContextValue {
  auth: AuthState | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Added to prevent premature redirects or hydration shifts
  login: (userName: string, password: string) => Promise<void>;
  register: (data: RegisterBody) => Promise<void>;
  loginWithTokens: (userName: string, accessToken: string, refreshToken: string, role: string) => void;
  logout: () => void;
  setAccessToken: (accessToken: string, refreshToken?: string, role?: string) => void;
}

const STORAGE_KEY = "newton-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with null on initial render to match Server-Side HTML
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with localStorage ONLY after mounting in browser
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setAuth(JSON.parse(raw) as AuthState);
      }
    } catch (e) {
      console.error("Failed to read auth state from localStorage", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (userName: string, password: string) => {
    const data = await loginRequest(userName, password);
    const nextAuth: AuthState = {
      userName,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      role: data.role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  }, []);

  const register = useCallback(async (data: RegisterBody) => {
    await registerRequest(data);
    await login(data.userName, data.password);
  }, [login]);

  const loginWithTokens = useCallback(
    (userName: string, accessToken: string, refreshToken: string, role: string) => {
      const nextAuth: AuthState = { userName, accessToken, refreshToken, role };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
    },
    [],
  );

  const logout = useCallback(() => {
    if (auth) {
      logoutRequest(auth.refreshToken);
    }
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, [auth]);

  const setAccessToken = useCallback((accessToken: string, refreshToken?: string, role?: string) => {
    setAuth((prev) => {
      if (!prev) return prev;
      const next: AuthState = {
        ...prev,
        accessToken,
        refreshToken: refreshToken ?? prev.refreshToken,
        role: role ?? prev.role,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ auth, isAuthenticated: !!auth, isLoading, login, register, loginWithTokens, logout, setAccessToken }}
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
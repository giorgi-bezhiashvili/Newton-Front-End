"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { SavedProvider } from "../contexts/SavedContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>{children}</SavedProvider>
    </AuthProvider>
  );
}

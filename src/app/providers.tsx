"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "../contexts/AuthContext";
import { SavedProvider } from "../contexts/SavedContext";
import { DisablePinchZoom } from "../components/DisablePinchZoom";

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SavedProvider>
        <ScrollToTop />
        <DisablePinchZoom />
        {children}
      </SavedProvider>
    </AuthProvider>
  );
}
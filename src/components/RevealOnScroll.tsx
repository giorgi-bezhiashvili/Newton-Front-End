"use client";

import type { ReactNode } from "react";
import { useInView } from "../hooks/useInView";

export function RevealOnScroll({ children }: { children: ReactNode }) {
  const { ref, isInView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={`cardReveal${isInView ? " in-view" : ""}`}>
      {children}
    </div>
  );
}
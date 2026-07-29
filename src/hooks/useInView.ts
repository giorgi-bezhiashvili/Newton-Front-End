import { useEffect, useRef, useState } from "react";
import { observeElement, unobserveElement } from "./sharedObserver";

export function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isInView) return;

    observeElement(node, (entry) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        unobserveElement(node);
      }
    });

    return () => unobserveElement(node);
  }, [isInView]);

  return { ref, isInView };
}
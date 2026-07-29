type Callback = (entry: IntersectionObserverEntry) => void;

let observer: IntersectionObserver | null = null;
const callbacks = new Map<Element, Callback>();

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          callbacks.get(entry.target)?.(entry);
        }
      },
      { threshold: 0.15, rootMargin: "50px" }
    );
  }
  return observer;
}

export function observeElement(el: Element, callback: Callback) {
  callbacks.set(el, callback);
  getObserver().observe(el);
}

export function unobserveElement(el: Element) {
  callbacks.delete(el);
  getObserver()?.unobserve(el);
}
import { useEffect } from 'react';

export function useScrollReveal(active = true) {
  useEffect(() => {
    if (typeof window === 'undefined' || !active) return;

    const elements = document.querySelectorAll('.reveal-section');
    elements.forEach((el) => {
      el.classList.add('is-revealed');
    });
  }, [active]);
}

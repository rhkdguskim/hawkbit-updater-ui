import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect when an element enters the viewport.
 * Useful for lazy loading data or components.
 * Once the element enters the viewport, inView remains true (it does not toggle back).
 */
export function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        // Fallback for environments without IntersectionObserver (should be rare in modern browsers)
        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect(); // Stop observing once loaded
            }
        }, { rootMargin: '50px', ...options }); // Default rootMargin to trigger slightly before

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return { ref, inView };
}

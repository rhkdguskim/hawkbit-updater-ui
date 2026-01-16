import { useState, useEffect } from 'react';

/**
 * Hook to detect page visibility state.
 * Used to pause polling when the browser tab is not visible.
 * 
 * @returns {boolean} - true if the page is visible, false otherwise
 * 
 * @example
 * const isVisible = usePageVisibility();
 * 
 * const { data } = useQuery({
 *   refetchInterval: isVisible ? 5000 : false,
 * });
 */
export const usePageVisibility = (): boolean => {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof document === 'undefined') return true;
        return !document.hidden;
    });

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return isVisible;
};

export default usePageVisibility;

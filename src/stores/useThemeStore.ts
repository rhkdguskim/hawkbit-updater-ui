import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    systemTheme: 'light' | 'dark';
    setMode: (mode: ThemeMode) => void;
    setSystemTheme: (theme: 'light' | 'dark') => void;
    getResolvedTheme: () => 'light' | 'dark';
    customLogo: string | null;
    setCustomLogo: (logo: string | null) => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            mode: 'system',
            systemTheme: getSystemTheme(),
            customLogo: null,
            setMode: (mode) => {
                set({ mode });
                const resolved = mode === 'system' ? get().systemTheme : mode;
                document.documentElement.setAttribute('data-theme', resolved);
                if (resolved === 'dark') {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            },
            setSystemTheme: (systemTheme) => {
                set({ systemTheme });
                if (get().mode === 'system') {
                    document.documentElement.setAttribute('data-theme', systemTheme);
                    if (systemTheme === 'dark') {
                        document.body.classList.add('dark-mode');
                    } else {
                        document.body.classList.remove('dark-mode');
                    }
                }
            },
            setCustomLogo: (logo) => set({ customLogo: logo }),
            getResolvedTheme: () => {
                const { mode, systemTheme } = get();
                if (mode === 'system') {
                    return systemTheme;
                }
                return mode;
            },
        }),
        {
            name: 'updater-theme-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Listen for system theme changes
if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Initial sync
    const initialTheme = mediaQuery.matches ? 'dark' : 'light';
    useThemeStore.getState().setSystemTheme(initialTheme);

    mediaQuery.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        useThemeStore.getState().setSystemTheme(newTheme);
    });
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    getResolvedTheme: () => 'light' | 'dark';
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
            setMode: (mode) => set({ mode }),
            getResolvedTheme: () => {
                const { mode } = get();
                if (mode === 'system') {
                    return getSystemTheme();
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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        // Force re-render by getting the state (this will be picked up by React components)
        const { mode } = useThemeStore.getState();
        if (mode === 'system') {
            // Trigger a small state update to force re-render
            useThemeStore.setState({ mode: 'system' });
        }
    });
}

import React, { useEffect, useMemo, useState } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/stores/useThemeStore';
import { lightTheme, darkTheme } from '@/theme';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const mode = useThemeStore(state => state.mode);
    const getSystemTheme = () => {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    };
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

    useEffect(() => {
        if (mode !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? 'dark' : 'light');
        };

        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        mediaQuery.addListener?.(handleChange);
        return () => mediaQuery.removeListener?.(handleChange);
    }, [mode]);

    const resolvedTheme = useMemo(() => {
        if (mode === 'system') return systemTheme;
        return mode;
    }, [mode, systemTheme]);


    // Apply body background color and class for smooth theme transitions
    useEffect(() => {
        const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
        document.body.style.backgroundColor = theme.token?.colorBgLayout || '#f0f2f5';
        document.body.style.transition = 'background-color 0.3s ease';

        if (resolvedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
        }
    }, [resolvedTheme]);

    const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

    return (
        <ConfigProvider theme={{ ...currentTheme, cssVar: {} }}>
            {children}
        </ConfigProvider>
    );
};

export default ThemeProvider;

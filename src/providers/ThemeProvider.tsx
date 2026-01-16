import React, { useEffect, useMemo } from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/stores/useThemeStore';
import { lightTheme, darkTheme } from '@/theme';

import { useLanguageStore } from '@/stores/useLanguageStore';
import ko_KR from 'antd/es/locale/ko_KR';
import en_US from 'antd/es/locale/en_US';
import zh_CN from 'antd/es/locale/zh_CN';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const mode = useThemeStore(state => state.mode);
    const systemTheme = useThemeStore(state => state.systemTheme);
    const language = useLanguageStore(state => state.language);

    // Determine AntD locale
    const locale = useMemo(() => {
        switch (language) {
            case 'ko': return ko_KR;
            case 'zh': return zh_CN;
            case 'en':
            default:
                return en_US;
        }
    }, [language]);

    // Determine the actual theme to apply
    const resolvedTheme = useMemo(() => {
        if (mode === 'system') return systemTheme;
        return mode;
    }, [mode, systemTheme]);

    // Sync theme to DOM for global CSS and styling
    useEffect(() => {
        const theme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
        document.body.style.backgroundColor = theme.token?.colorBgLayout as string || '#f0f2f5';
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
        <ConfigProvider
            theme={{ ...currentTheme, cssVar: { key: 'ant' } }}
            locale={locale}
        >
            {children}
        </ConfigProvider>
    );
};

export default ThemeProvider;

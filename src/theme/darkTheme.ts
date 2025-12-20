import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
    token: {
        colorPrimary: '#177ddc',
        colorSuccess: '#49aa19',
        colorWarning: '#d89614',
        colorError: '#a61d24',
        colorInfo: '#177ddc',
        colorBgContainer: '#1f1f1f',
        colorBgLayout: '#141414',
        colorBgBase: '#141414',
        colorText: 'rgba(255, 255, 255, 0.85)',
        colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
        colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
        colorBorder: '#434343',
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#1f1f1f',
            headerBg: '#141414',
            bodyBg: '#141414',
        },
        Menu: {
            darkItemBg: '#1f1f1f',
            darkSubMenuItemBg: '#141414',
            darkItemSelectedBg: '#177ddc',
        },
        Card: {
            colorBgContainer: '#1f1f1f',
        },
        Table: {
            headerBg: '#1d1d1d',
        },
    },
};

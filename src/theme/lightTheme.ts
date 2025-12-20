import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
    token: {
        colorPrimary: '#1890ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1890ff',
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f0f2f5',
        colorBgBase: '#ffffff',
        colorText: 'rgba(0, 0, 0, 0.88)',
        colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
        colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
        colorBorder: '#d9d9d9',
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    },
    components: {
        Layout: {
            siderBg: '#001529',
            headerBg: '#ffffff',
            bodyBg: '#f0f2f5',
        },
        Menu: {
            darkItemBg: '#001529',
            darkSubMenuItemBg: '#000c17',
            darkItemSelectedBg: '#1890ff',
        },
        Card: {
            colorBgContainer: '#ffffff',
        },
        Table: {
            headerBg: '#fafafa',
        },
    },
};

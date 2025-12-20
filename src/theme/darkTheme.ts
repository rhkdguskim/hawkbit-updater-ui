import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
    token: {
        // Modern vibrant primary color palette
        colorPrimary: '#818cf8', // Lighter indigo for dark mode
        colorSuccess: '#34d399', // Emerald
        colorWarning: '#fbbf24', // Amber
        colorError: '#f87171', // Red
        colorInfo: '#60a5fa', // Blue

        // Dark backgrounds with depth
        colorBgContainer: '#1e1e2e',
        colorBgLayout: '#11111b',
        colorBgBase: '#11111b',
        colorBgElevated: '#262637',
        colorBgSpotlight: '#313244',

        // Typography for dark mode
        colorText: '#cdd6f4',
        colorTextSecondary: '#a6adc8',
        colorTextTertiary: '#7f849c',
        colorTextQuaternary: '#585b70',

        // Borders
        colorBorder: '#313244',
        colorBorderSecondary: '#45475a',

        // Design tokens
        borderRadius: 12,
        borderRadiusLG: 16,
        borderRadiusSM: 8,
        borderRadiusXS: 4,

        // Typography
        fontFamily: "'Pretendard Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 14,
        fontSizeHeading1: 38,
        fontSizeHeading2: 30,
        fontSizeHeading3: 24,

        // Spacing
        marginXS: 8,
        marginSM: 12,
        margin: 16,
        marginMD: 20,
        marginLG: 24,
        marginXL: 32,

        // Motion
        motionDurationFast: '0.1s',
        motionDurationMid: '0.2s',
        motionDurationSlow: '0.3s',

        // Shadows for dark mode
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        boxShadowSecondary: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#1e1e2e',
            headerBg: '#1e1e2e',
            bodyBg: '#11111b',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(129, 140, 248, 0.2)',
            darkItemHoverBg: 'rgba(129, 140, 248, 0.1)',
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
        },
        Card: {
            colorBgContainer: '#1e1e2e',
            borderRadiusLG: 16,
            boxShadowTertiary: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
            paddingLG: 24,
        },
        Table: {
            headerBg: '#181825',
            headerColor: '#a6adc8',
            rowHoverBg: '#262637',
            borderColor: '#313244',
            headerBorderRadius: 12,
        },
        Button: {
            borderRadius: 8,
            borderRadiusLG: 12,
            borderRadiusSM: 6,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 500,
            primaryShadow: '0 4px 14px 0 rgba(129, 140, 248, 0.25)',
        },
        Input: {
            borderRadius: 8,
            paddingInline: 12,
            activeShadow: '0 0 0 3px rgba(129, 140, 248, 0.15)',
            colorBgContainer: '#181825',
        },
        Select: {
            borderRadius: 8,
            optionSelectedBg: 'rgba(129, 140, 248, 0.2)',
        },
        Tag: {
            borderRadiusSM: 6,
        },
        Badge: {
            dotSize: 8,
        },
        Breadcrumb: {
            separatorMargin: 12,
        },
        Descriptions: {
            itemPaddingBottom: 16,
        },
        Statistic: {
            contentFontSize: 28,
        },
        Tabs: {
            cardBg: '#181825',
            itemActiveColor: '#818cf8',
            itemHoverColor: '#818cf8',
            inkBarColor: '#818cf8',
        },
        Modal: {
            contentBg: '#1e1e2e',
            headerBg: '#1e1e2e',
            borderRadiusLG: 16,
        },
        Drawer: {
            colorBgElevated: '#1e1e2e',
            borderRadiusLG: 16,
        },
        Message: {
            borderRadiusLG: 12,
        },
        Notification: {
            borderRadiusLG: 12,
        },
        Steps: {
            iconSize: 32,
        },
        Spin: {
            colorPrimary: '#818cf8',
        },
        Tooltip: {
            colorBgSpotlight: '#313244',
        },
    },
};

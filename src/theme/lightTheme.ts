import type { ThemeConfig } from 'antd';
import { modernColors } from './constants';

export const lightTheme: ThemeConfig = {
    token: {
        // Modern vibrant primary color palette
        colorPrimary: modernColors.colorPrimary,
        colorSuccess: modernColors.colorSuccess,
        colorWarning: modernColors.colorWarning,
        colorError: modernColors.colorError,
        colorInfo: modernColors.colorInfo,

        // Clean and bright backgrounds
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f8fafc',
        colorBgBase: '#ffffff',
        colorBgElevated: '#ffffff',

        // Typography
        colorText: '#1c1c1e',
        colorTextSecondary: '#636366',
        colorTextTertiary: '#a0a0a5',
        colorTextQuaternary: '#c7c7cc',

        // Borders and shadows - Industrial Crisp
        colorBorder: '#e2e8f0', // Slate-200
        colorBorderSecondary: '#f1f5f9', // Slate-100

        // Design tokens - Industrial Precision
        borderRadius: 6,      // Standard buttons / inputs
        borderRadiusLG: 12,   // Cards / Modals
        borderRadiusSM: 4,    // Tags / Tiny elements
        borderRadiusXS: 2,

        // Typography - Technical feel
        fontFamily: "'Pretendard Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 14, // Slightly smaller base for density
        fontSizeHeading1: 32,
        fontSizeHeading2: 24,
        fontSizeHeading3: 20,

        // Spacing (Dense)
        marginXS: 8,
        marginSM: 12,
        margin: 16,
        marginMD: 16,
        marginLG: 24,
        marginXL: 32,

        // Motion
        motionDurationFast: '0.1s',
        motionDurationMid: '0.2s',
        motionDurationSlow: '0.3s',

        // Shadows - Subtle technical depth
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    components: {
        Layout: {
            siderBg: '#1e293b', // Slate-800
            headerBg: '#ffffff',
            bodyBg: '#f8fafc',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(255, 255, 255, 0.1)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
            itemBorderRadius: 6,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
        },
        Card: {
            colorBgContainer: '#ffffff',
            borderRadiusLG: 12,
            boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)', // Shadow SM
            paddingLG: 24, // Tighter padding
            headerFontSize: 16,
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#64748b', // Slate-500
            rowHoverBg: '#f1f5f9',
            borderColor: '#e2e8f0',
            headerBorderRadius: 8,
            cellPaddingBlock: 12, // Denser rows
        },
        Button: {
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 500,
            primaryShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // Minimal shadow
            defaultShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        Input: {
            borderRadius: 6,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(94, 92, 230, 0.1)',
        },
        Select: {
            borderRadius: 6,
        },
        Tag: {
            borderRadiusSM: 4,
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
            contentFontSize: 24,
        },
        Tabs: {
            cardBg: '#f8fafc',
            itemActiveColor: modernColors.colorPrimary,
            itemHoverColor: modernColors.colorPrimary,
            inkBarColor: modernColors.colorPrimary,
        },
        Modal: {
            borderRadiusLG: 12,
            titleFontSize: 18,
        },
        Drawer: {
            borderRadiusLG: 12,
        },
        Message: {
            borderRadiusLG: 8,
        },
        Notification: {
            borderRadiusLG: 12,
        },
        Steps: {
            iconSize: 32,
        },
        Spin: {
            colorPrimary: modernColors.colorPrimary,
        },
    },
};

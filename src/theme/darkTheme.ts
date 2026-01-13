import { theme } from 'antd';
import type { ThemeConfig } from 'antd';
import { modernColors } from './constants';

export const darkTheme: ThemeConfig = {
    token: {
        // High Contrast Primary for Industrial Look
        colorPrimary: modernColors.colorPrimary,
        colorSuccess: modernColors.colorSuccess,
        colorWarning: modernColors.colorWarning,
        colorError: modernColors.colorError,
        colorTextHeading: '#f8fafc', // Slate-50
        colorInfo: modernColors.colorInfo,

        // Deep Industrial Backgrounds (Slate/Zinc bases)
        colorBgContainer: '#1e293b', // Slate-800
        colorBgLayout: '#0f172a',    // Slate-900 (Page BG)
        colorBgBase: '#0f172a',
        colorBgElevated: '#334155',  // Slate-700
        colorBgSpotlight: '#475569', // Slate-600

        // Typography
        colorText: '#f1f5f9',        // Slate-100
        colorTextSecondary: '#94a3b8', // Slate-400
        colorTextTertiary: '#64748b',  // Slate-500
        colorTextQuaternary: '#475569', // Slate-600

        // Borders - Visible structure
        colorBorder: '#334155',      // Slate-700
        colorBorderSecondary: '#1e293b', // Slate-800

        // Design tokens - Industrial Precision
        borderRadius: 6,
        borderRadiusLG: 12,
        borderRadiusSM: 4,
        borderRadiusXS: 2,

        // Typography
        fontFamily: "'Pretendard Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 14,
        fontSizeHeading1: 32,
        fontSizeHeading2: 24,
        fontSizeHeading3: 20,

        // Spacing
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

        // Shadows - Glow effects for depth
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#0f172a', // Darker sidebar
            headerBg: '#1e293b',
            bodyBg: '#0f172a',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(94, 92, 230, 0.2)', // Higher contrast selection
            darkItemHoverBg: 'rgba(94, 92, 230, 0.1)',
            itemBorderRadius: 6,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
        },
        Card: {
            colorBgContainer: '#1e293b',
            borderRadiusLG: 12,
            boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            paddingLG: 24,
            headerFontSize: 16,
        },
        Table: {
            headerBg: '#334155', // Slate-700
            headerColor: '#f8fafc',
            rowHoverBg: '#334155',
            borderColor: '#334155',
            headerBorderRadius: 8,
            padding: 12,
        },
        Button: {
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 500,
            primaryShadow: '0 0 10px rgba(94, 92, 230, 0.3)', // Glow effect
        },
        Input: {
            borderRadius: 6,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(94, 92, 230, 0.3)',
            colorBgContainer: '#0f172a', // Deep input background
        },
        Select: {
            borderRadius: 6,
            optionSelectedBg: 'rgba(94, 92, 230, 0.2)',
        },
        Tag: {
            borderRadiusSM: 4,
        },
        Badge: {
            dotSize: 8,
        },
        Tabs: {
            cardBg: '#0f172a',
            itemActiveColor: modernColors.colorPrimary,
            itemHoverColor: modernColors.colorPrimary,
            inkBarColor: modernColors.colorPrimary,
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            contentBg: '#1e293b',
            headerBg: '#1e293b',
            borderRadiusLG: 12,
        },
        Drawer: {
            colorBgElevated: '#1e293b',
            borderRadiusLG: 12,
        },
        Statistic: {
            contentFontSize: 24,
        },
        Tooltip: {
            colorBgSpotlight: '#334155',
        },
    },
};

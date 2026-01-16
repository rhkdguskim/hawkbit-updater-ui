import { theme } from 'antd';
import type { ThemeConfig } from 'antd';
import { modernColors } from './constants';

export const darkTheme: ThemeConfig = {
    token: {
        // AI ops palette - Neon, high contrast
        colorPrimary: '#22d3ee', // Neon Cyan
        colorSuccess: '#34d399', // Emerald Glow
        colorWarning: '#fbbf24', // Amber Signal
        colorError: '#f87171',   // Soft Red
        colorInfo: '#a855f7',    // Violet Accent
        colorTextHeading: '#e2e8f0', // Bright slate

        // Deep grid backgrounds
        colorBgBase: '#05070c',      // Near-black
        colorBgLayout: '#05070c',    // Main Layout Background
        colorBgContainer: '#0b1220', // Card Background
        colorBgElevated: '#121a2c',  // Dropdowns/Modals
        colorBgSpotlight: '#1a2440', // Tooltips

        // Typography
        colorText: '#e2e8f0',        // Slate-200
        colorTextSecondary: '#94a3b8', // Slate-400
        colorTextTertiary: '#64748b',  // Slate-500
        colorTextQuaternary: '#475569', // Slate-600

        // Borders - Sharp, technical
        colorBorder: '#1f2a44',
        colorBorderSecondary: '#121a2c',

        // Shapes - Industrial Precision
        borderRadius: 4,      // Sharper corners for "Machine" feel
        borderRadiusLG: 8,
        borderRadiusSM: 2,
        borderRadiusXS: 1,

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

        // Effects - Glows & Depth
        boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.08), 0 10px 24px rgba(5, 7, 12, 0.65)',
        boxShadowSecondary: '0 0 0 1px rgba(168, 85, 247, 0.1), 0 18px 36px rgba(5, 7, 12, 0.7)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#0a0f1b',
            headerBg: '#0b1220',
            bodyBg: '#05070c',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(34, 211, 238, 0.16)',
            darkItemHoverBg: 'rgba(34, 211, 238, 0.08)',
            itemBorderRadius: 4,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#67e8f9',
        },
        Card: {
            colorBgContainer: '#0b1220',
            borderRadiusLG: 8,
            boxShadowTertiary: '0 0 0 1px rgba(34, 211, 238, 0.08), 0 10px 24px rgba(5, 7, 12, 0.55)',
            paddingLG: 24,
            headerFontSize: 16,
            actionsBg: '#0f172a',
        },
        Table: {
            headerBg: '#0f172a',
            headerColor: '#7dd3fc',
            rowHoverBg: '#121a2c',
            borderColor: '#1f2a44',
            headerBorderRadius: 4,
            padding: 12,
        },
        Button: {
            borderRadius: 4,
            borderRadiusLG: 6,
            borderRadiusSM: 2,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 600,
            primaryShadow: '0 0 16px rgba(34, 211, 238, 0.45)',
        },
        Input: {
            borderRadius: 4,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(34, 211, 238, 0.22)',
            colorBgContainer: '#060a12',
            colorBorder: '#1f2a44',
            hoverBorderColor: '#22d3ee',
        },
        Select: {
            borderRadius: 4,
            optionSelectedBg: 'rgba(34, 211, 238, 0.15)',
        },
        Tag: {
            borderRadiusSM: 2,
        },
        Badge: {
            dotSize: 8,
        },
        Tabs: {
            cardBg: '#05070c',
            itemActiveColor: '#67e8f9',
            itemHoverColor: '#67e8f9',
            inkBarColor: '#67e8f9',
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            contentBg: '#0b1220',
            headerBg: '#0b1220',
            borderRadiusLG: 8,
            boxShadow: '0 0 0 1px rgba(34, 211, 238, 0.12), 0 30px 40px rgba(5, 7, 12, 0.75)',
        },
        Drawer: {
            colorBgElevated: '#0b1220',
            borderRadiusLG: 8,
        },
        Statistic: {
            contentFontSize: 24,
        },
        Tooltip: {
            colorBgSpotlight: '#1a2440',
            borderRadius: 4,
        },
        Alert: {
            borderRadiusLG: 4,
        },
        Progress: {
            defaultColor: '#22d3ee',
        }
    },
};

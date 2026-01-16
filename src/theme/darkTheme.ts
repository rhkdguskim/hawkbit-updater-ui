import { theme } from 'antd';
import type { ThemeConfig } from 'antd';
import { modernColors } from './constants';

export const darkTheme: ThemeConfig = {
    token: {
        // Semiconductor / IoT High Contrast Palette
        colorPrimary: '#06b6d4', // Cyan-500: Electric Tech Blue
        colorSuccess: '#10b981', // Emerald-500: Industrial Green
        colorWarning: '#f59e0b', // Amber-500: Warning Yellow
        colorError: '#ef4444',   // Red-500: Critical Red
        colorInfo: '#3b82f6',    // Blue-500: Information
        colorTextHeading: '#f1f5f9', // Slate-100: High Readability

        // Deep Space / Facility Backgrounds
        colorBgBase: '#0b1121',      // Deepest Blue-Black (Void)
        colorBgLayout: '#0b1121',    // Main Layout Background
        colorBgContainer: '#151e32', // Container/Card Background (Dark Slate Blue)
        colorBgElevated: '#1e293b',  // Dropdowns/Modals (Slate-800)
        colorBgSpotlight: '#334155', // Tooltips (Slate-700)

        // Typography - Crisp & Technical
        colorText: '#e2e8f0',        // Slate-200
        colorTextSecondary: '#94a3b8', // Slate-400
        colorTextTertiary: '#64748b',  // Slate-500
        colorTextQuaternary: '#475569', // Slate-600

        // Borders - Subtle Structure
        colorBorder: '#2e3a50',      // Muted Blue-Grey Border
        colorBorderSecondary: '#1e293b', // Darker Divider

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
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#0e1525', // Slightly lighter than body for depth
            headerBg: '#151e32', // Matches container
            bodyBg: '#0b1121',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(6, 182, 212, 0.15)', // Cyan tint
            darkItemHoverBg: 'rgba(6, 182, 212, 0.08)',
            itemBorderRadius: 4,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#22d3ee', // Bright Cyan Text
        },
        Card: {
            colorBgContainer: '#151e32',
            borderRadiusLG: 8,
            boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            paddingLG: 24,
            headerFontSize: 16,
            actionsBg: '#1e293b',
        },
        Table: {
            headerBg: '#1e293b',
            headerColor: '#94a3b8', // Muted header text
            rowHoverBg: '#1e293b',  // Subtle hover
            borderColor: '#2e3a50',
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
            primaryShadow: '0 0 12px rgba(6, 182, 212, 0.4)', // Neon Cyan Glow
        },
        Input: {
            borderRadius: 4,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(6, 182, 212, 0.2)',
            colorBgContainer: '#0b1121', // Deep Dark Input
            colorBorder: '#2e3a50',
            hoverBorderColor: '#06b6d4',
        },
        Select: {
            borderRadius: 4,
            optionSelectedBg: 'rgba(6, 182, 212, 0.15)',
        },
        Tag: {
            borderRadiusSM: 2,
        },
        Badge: {
            dotSize: 8,
        },
        Tabs: {
            cardBg: '#0b1121',
            itemActiveColor: '#22d3ee',
            itemHoverColor: '#22d3ee',
            inkBarColor: '#22d3ee',
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            contentBg: '#151e32',
            headerBg: '#151e32',
            borderRadiusLG: 8,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)', // Deep shadow
        },
        Drawer: {
            colorBgElevated: '#151e32',
            borderRadiusLG: 8,
        },
        Statistic: {
            contentFontSize: 24,
        },
        Tooltip: {
            colorBgSpotlight: '#334155',
            borderRadius: 4,
        },
        Alert: {
            borderRadiusLG: 4,
        },
        Progress: {
            defaultColor: '#06b6d4',
        }
    },
};

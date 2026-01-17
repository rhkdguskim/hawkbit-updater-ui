import type { ThemeConfig } from 'antd';
import { lightColors } from './constants';

/**
 * Light Theme: Fresh & Clean (프레시 & 클린)
 * 가볍고 산뜻한 느낌의 모던 라이트 테마
 * - 밝고 깨끗한 화이트 배경
 * - 시원한 블루 계열 악센트
 * - 부드러운 그림자와 둥근 모서리
 * - 공기처럼 가벼운 느낌
 */
export const lightTheme: ThemeConfig = {
    token: {
        // 산뜻한 컬러 팔레트
        colorPrimary: lightColors.colorPrimary,
        colorSuccess: lightColors.colorSuccess,
        colorWarning: lightColors.colorWarning,
        colorError: lightColors.colorError,
        colorInfo: lightColors.colorInfo,

        // 깨끗한 화이트 배경
        colorBgContainer: '#ffffff',
        colorBgLayout: '#fafbfc',
        colorBgBase: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBgSpotlight: '#f4f6f8',

        // 타이포그래피 - 선명한 콘트라스트
        colorText: '#111827',           // Gray-900 (더 진하게)
        colorTextSecondary: '#374151',  // Gray-700
        colorTextTertiary: '#6b7280',   // Gray-500
        colorTextQuaternary: '#9ca3af', // Gray-400

        // 보더 - 확실한 구분
        colorBorder: '#d1d5db',         // Gray-300 (더 명확하게)
        colorBorderSecondary: '#e5e7eb', // Gray-200

        // 디자인 토큰 - 부드럽고 모던한 스타일
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,
        borderRadiusXS: 4,

        // 타이포그래피
        fontFamily: "'Pretendard Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 14,
        fontSizeHeading1: 32,
        fontSizeHeading2: 24,
        fontSizeHeading3: 20,

        // 간격
        marginXS: 8,
        marginSM: 12,
        margin: 16,
        marginMD: 16,
        marginLG: 24,
        marginXL: 32,

        // 모션
        motionDurationFast: '0.1s',
        motionDurationMid: '0.2s',
        motionDurationSlow: '0.3s',

        // 그림자 - 가볍고 부드러운 깊이감
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        boxShadowSecondary: '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
    },
    components: {
        Layout: {
            siderBg: '#1e293b',       // Slate-800 사이드바
            headerBg: '#ffffff',
            bodyBg: '#fafbfc',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(59, 130, 246, 0.2)',  // Blue 계열
            darkItemHoverBg: 'rgba(59, 130, 246, 0.1)',
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#60a5fa',  // Blue-400
        },
        Card: {
            colorBgContainer: '#ffffff',
            borderRadiusLG: 12,
            boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            paddingLG: 20,
            headerFontSize: 15,
        },
        Table: {
            headerBg: '#f9fafb',
            headerColor: '#4b5563',
            rowHoverBg: '#f3f4f6',
            borderColor: '#e5e7eb',
            headerBorderRadius: 8,
            cellPaddingBlock: 12,
        },
        Button: {
            borderRadius: 8,
            borderRadiusLG: 10,
            borderRadiusSM: 6,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 600,
            primaryShadow: '0 4px 12px rgba(8, 145, 178, 0.25)',
            defaultShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            controlHeight: 36,
        },
        Input: {
            borderRadius: 8,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(8, 145, 178, 0.1)',
            hoverBorderColor: lightColors.colorPrimary,
        },
        Select: {
            borderRadius: 8,
            optionSelectedBg: 'rgba(8, 145, 178, 0.08)',
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
            contentFontSize: 24,
        },
        Tabs: {
            cardBg: '#f9fafb',
            itemActiveColor: lightColors.colorPrimary,
            itemHoverColor: lightColors.colorPrimary,
            inkBarColor: lightColors.colorPrimary,
        },
        Modal: {
            borderRadiusLG: 16,
            titleFontSize: 18,
        },
        Drawer: {
            borderRadiusLG: 16,
        },
        Message: {
            borderRadiusLG: 10,
        },
        Notification: {
            borderRadiusLG: 12,
        },
        Steps: {
            iconSize: 32,
        },
        Spin: {
            colorPrimary: lightColors.colorPrimary,
        },
        Progress: {
            defaultColor: lightColors.colorPrimary,
        },
    },
};

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

        // 깨끗한 화이트 배경 - 약간의 푸른기 추가로 더 세련되게
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f8fafc',      // Slate-50
        colorBgBase: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBgSpotlight: '#1e293b',

        // 타이포그래피 - 선명하고 현대적인 콘트라스트
        colorText: '#0f172a',           // Slate-900
        colorTextSecondary: '#475569',  // Slate-600
        colorTextTertiary: '#94a3b8',   // Slate-400
        colorTextQuaternary: '#cbd5e1', // Slate-300

        // 보더 - 은은하고 깔끔하게
        colorBorder: '#e2e8f0',         // Slate-200
        colorBorderSecondary: '#f1f5f9', // Slate-100

        // 디자인 토큰 - 더 둥글고 부드러운 느낌
        borderRadius: 10,
        borderRadiusLG: 16,
        borderRadiusSM: 6,
        borderRadiusXS: 4,

        // 타이포그래피
        fontFamily: "'Pretendard Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        fontSize: 14,
        fontSizeHeading1: 32,
        fontSizeHeading2: 24,
        fontSizeHeading3: 20,

        // 간격 - 더 여유로운 레이아웃
        marginXS: 8,
        marginSM: 12,
        margin: 16,
        marginMD: 20,
        marginLG: 24,
        marginXL: 32,

        // 모션
        motionDurationFast: '0.1s',
        motionDurationMid: '0.2s',
        motionDurationSlow: '0.3s',

        // 그림자 - 레이어드 디자인 (더 넓고 부드럽게)
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        boxShadowTertiary: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    },
    components: {
        Layout: {
            siderBg: '#ffffff',       // 라이트 사이드바 (깔끔하게)
            headerBg: 'rgba(255, 255, 255, 0.8)', // 글래스모피즘 기반
            bodyBg: '#f8fafc',
            headerPadding: '0 24px',
        },
        Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#eff6ff', // Blue-50
            itemHoverBg: '#f1f5f9',    // Slate-100
            itemBorderRadius: 10,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: lightColors.colorPrimary,
        },
        Card: {
            colorBgContainer: '#ffffff',
            borderRadiusLG: 16,
            boxShadowTertiary: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            paddingLG: 24,
            headerFontSize: 16,
            fontWeightStrong: 600,
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#475569',
            rowHoverBg: '#f1f5f9',
            borderColor: '#f1f5f9',
            headerBorderRadius: 10,
            cellPaddingBlock: 14,
            cellPaddingInline: 16,
        },
        Button: {
            borderRadius: 10,
            borderRadiusLG: 12,
            borderRadiusSM: 8,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 600,
            primaryShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            defaultShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            controlHeight: 40,
        },
        Input: {
            borderRadius: 10,
            paddingInline: 14,
            activeShadow: '0 0 0 4px rgba(37, 99, 235, 0.08)',
            hoverBorderColor: lightColors.colorPrimary,
            controlHeight: 40,
        },
        Select: {
            borderRadius: 10,
            optionSelectedBg: '#eff6ff',
            controlHeight: 40,
        },
        Tag: {
            borderRadiusSM: 6,
            fontWeightStrong: 600,
        },
        Badge: {
            dotSize: 8,
        },
        Breadcrumb: {
            separatorMargin: 12,
            fontSize: 13,
        },
        Tabs: {
            cardBg: '#f8fafc',
            itemActiveColor: lightColors.colorPrimary,
            itemHoverColor: lightColors.colorPrimary,
            inkBarColor: lightColors.colorPrimary,
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            borderRadiusLG: 20,
            titleFontSize: 18,
            paddingContentHorizontalLG: 32,
        },
        Drawer: {
            borderRadiusLG: 20,
        },
        Message: {
            borderRadiusLG: 12,
        },
        Notification: {
            borderRadiusLG: 16,
        },
        Statistic: {
            contentFontSize: 28,
            titleFontSize: 14,
        },
        Spin: {
            colorPrimary: lightColors.colorPrimary,
        },
    },
};

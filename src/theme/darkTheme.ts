import { theme } from 'antd';
import type { ThemeConfig } from 'antd';
import { darkColors } from './constants';

/**
 * Dark Theme: AI Control Center (AI 제어실)
 * 반도체 설비 제어실 + 미래형 AI 인터페이스 모티프
 * - 딥 스페이스 배경
 * - 네온 Cyan 글로우 효과
 * - 홀로그램 그리드 느낌
 * - Violet/Orange 보조 악센트
 */
export const darkTheme: ThemeConfig = {
    token: {
        // AI 제어실 컬러 팔레트 - 네온 & 글로우
        colorPrimary: darkColors.colorPrimary,    // #00ffd5 Neon Cyan
        colorSuccess: darkColors.colorSuccess,    // #22c55e Green
        colorWarning: darkColors.colorWarning,    // #eab308 Yellow
        colorError: darkColors.colorError,        // #ef4444 Red
        colorInfo: darkColors.colorInfo,          // #a855f7 Violet
        colorTextHeading: '#f1f5f9',              // Slate-100

        // 딥 스페이스 배경 - 반도체 제어실
        colorBgBase: '#030712',       // 거의 순수 블랙
        colorBgLayout: '#030712',     // 메인 레이아웃
        colorBgContainer: '#0a0f1f',  // 카드/컨테이너 배경
        colorBgElevated: '#111827',   // 드롭다운/모달
        colorBgSpotlight: '#1e293b',  // 툴팁

        // 타이포그래피 - 홀로그램 느낌
        colorText: '#e2e8f0',         // Slate-200
        colorTextSecondary: '#94a3b8', // Slate-400
        colorTextTertiary: '#64748b',  // Slate-500
        colorTextQuaternary: '#475569', // Slate-600

        // 보더 - 글로우 라인
        colorBorder: '#1e293b',
        colorBorderSecondary: '#0f172a',

        // 디자인 토큰 - 정밀 기기 스타일
        borderRadius: 4,
        borderRadiusLG: 8,
        borderRadiusSM: 2,
        borderRadiusXS: 1,

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

        // 그림자 & 글로우 - AI 제어실 스타일
        boxShadow: '0 0 0 1px rgba(0, 255, 213, 0.1), 0 10px 30px rgba(3, 7, 18, 0.8)',
        boxShadowSecondary: '0 0 0 1px rgba(168, 85, 247, 0.15), 0 20px 40px rgba(3, 7, 18, 0.85)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#050810',
            headerBg: '#0a0f1f',
            bodyBg: '#030712',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(0, 255, 213, 0.15)',
            darkItemHoverBg: 'rgba(0, 255, 213, 0.08)',
            itemBorderRadius: 4,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#00ffd5',
        },
        Card: {
            colorBgContainer: '#0a0f1f',
            borderRadiusLG: 8,
            boxShadowTertiary: '0 0 0 1px rgba(0, 255, 213, 0.08), 0 12px 32px rgba(3, 7, 18, 0.7)',
            paddingLG: 20,
            headerFontSize: 15,
            actionsBg: '#0f172a',
        },
        Table: {
            headerBg: '#0f172a',
            headerColor: '#67e8f9',  // Cyan-300
            rowHoverBg: '#111827',
            borderColor: '#1e293b',
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
            primaryShadow: '0 0 20px rgba(0, 255, 213, 0.5)',
        },
        Input: {
            borderRadius: 4,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(0, 255, 213, 0.25)',
            colorBgContainer: '#050810',
            colorBorder: '#1e293b',
            hoverBorderColor: '#00ffd5',
        },
        Select: {
            borderRadius: 4,
            optionSelectedBg: 'rgba(0, 255, 213, 0.15)',
        },
        Tag: {
            borderRadiusSM: 2,
        },
        Badge: {
            dotSize: 8,
        },
        Tabs: {
            cardBg: '#050810',
            itemActiveColor: '#00ffd5',
            itemHoverColor: '#67e8f9',
            inkBarColor: '#00ffd5',
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            contentBg: '#0a0f1f',
            headerBg: '#0a0f1f',
            borderRadiusLG: 8,
            boxShadow: '0 0 0 1px rgba(0, 255, 213, 0.15), 0 30px 50px rgba(3, 7, 18, 0.9)',
        },
        Drawer: {
            colorBgElevated: '#0a0f1f',
            borderRadiusLG: 8,
        },
        Statistic: {
            contentFontSize: 24,
        },
        Tooltip: {
            colorBgSpotlight: '#1e293b',
            borderRadius: 4,
        },
        Alert: {
            borderRadiusLG: 4,
        },
        Progress: {
            defaultColor: '#00ffd5',
        },
        Spin: {
            colorPrimary: '#00ffd5',
        },
    },
};

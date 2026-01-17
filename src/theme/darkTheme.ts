import { theme } from 'antd';
import type { ThemeConfig } from 'antd';
import { darkColors } from './constants';

/**
 * Dark Theme: Deep Dark Industrial (딥 다크 인더스트리얼)
 * 차분하고 고급스러운 다크 테마
 * - 깊은 순수 다크 배경
 * - 은은한 블루/그레이 악센트
 * - 네온 효과 없이 세련된 그림자만 사용
 * - 미니멀하고 프로페셔널한 느낌
 */
export const darkTheme: ThemeConfig = {
    token: {
        // 딥 다크 컬러 팔레트 - 차분하고 세련된
        colorPrimary: darkColors.colorPrimary,    // #3b82f6 Blue
        colorSuccess: darkColors.colorSuccess,    // #10b981 Emerald
        colorWarning: darkColors.colorWarning,    // #f59e0b Amber
        colorError: darkColors.colorError,        // #ef4444 Red
        colorInfo: darkColors.colorInfo,          // #6366f1 Indigo
        colorTextHeading: '#f1f5f9',              // Slate-100

        // 순수 딥 다크 배경 - 단색 기반
        colorBgBase: '#0a0a0b',       // 거의 순수 블랙 (약간 따뜻한 톤)
        colorBgLayout: '#0a0a0b',     // 메인 레이아웃
        colorBgContainer: '#141417',  // 카드/컨테이너 배경
        colorBgElevated: '#1c1c21',   // 드롭다운/모달
        colorBgSpotlight: '#27272a',  // 툴팁

        // 타이포그래피 - 부드러운 콘트라스트
        colorText: '#e4e4e7',         // Zinc-200
        colorTextSecondary: '#a1a1aa', // Zinc-400
        colorTextTertiary: '#71717a',  // Zinc-500
        colorTextQuaternary: '#52525b', // Zinc-600

        // 보더 - 미묘한 구분선
        colorBorder: '#27272a',       // Zinc-800
        colorBorderSecondary: '#18181b', // Zinc-900

        // 디자인 토큰 - 정밀 기기 스타일
        borderRadius: 6,
        borderRadiusLG: 8,
        borderRadiusSM: 4,
        borderRadiusXS: 2,

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

        // 그림자 - 깊이감 있는 순수 그림자 (글로우 없음)
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.5)',
        boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#0f0f11',
            headerBg: '#141417',
            bodyBg: '#0a0a0b',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(59, 130, 246, 0.15)',
            darkItemHoverBg: 'rgba(59, 130, 246, 0.08)',
            itemBorderRadius: 6,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#60a5fa',
        },
        Card: {
            colorBgContainer: '#141417',
            borderRadiusLG: 8,
            boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
            paddingLG: 20,
            headerFontSize: 15,
            actionsBg: '#1c1c21',
        },
        Table: {
            headerBg: '#18181b',
            headerColor: '#a1a1aa',
            rowHoverBg: '#1c1c21',
            borderColor: '#27272a',
            headerBorderRadius: 6,
            padding: 12,
        },
        Button: {
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 600,
            primaryShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        },
        Input: {
            borderRadius: 6,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
            colorBgContainer: '#0f0f11',
            colorBorder: '#27272a',
            hoverBorderColor: '#3b82f6',
        },
        Select: {
            borderRadius: 6,
            optionSelectedBg: 'rgba(59, 130, 246, 0.15)',
        },
        Tag: {
            borderRadiusSM: 4,
        },
        Badge: {
            dotSize: 8,
        },
        Tabs: {
            cardBg: '#0f0f11',
            itemActiveColor: '#60a5fa',
            itemHoverColor: '#93c5fd',
            inkBarColor: '#3b82f6',
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            contentBg: '#141417',
            headerBg: '#141417',
            borderRadiusLG: 12,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        },
        Drawer: {
            colorBgElevated: '#141417',
            borderRadiusLG: 12,
        },
        Statistic: {
            contentFontSize: 24,
        },
        Tooltip: {
            colorBgSpotlight: '#27272a',
            borderRadius: 6,
        },
        Alert: {
            borderRadiusLG: 6,
        },
        Progress: {
            defaultColor: '#3b82f6',
        },
        Spin: {
            colorPrimary: '#3b82f6',
        },
    },
};

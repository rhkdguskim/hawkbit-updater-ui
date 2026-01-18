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
        // 딥 다크 컬러 팔레트 - 현대적이고 세련된 블루톤 베이스
        colorPrimary: darkColors.colorPrimary,
        colorSuccess: darkColors.colorSuccess,
        colorWarning: darkColors.colorWarning,
        colorError: darkColors.colorError,
        colorInfo: darkColors.colorInfo,
        colorTextHeading: '#f8fafc',

        // 현대적인 딥 슬레이트 네이비 배경
        colorBgBase: '#020617',       // Slate-950 (매우 깊은 네이비)
        colorBgLayout: '#020617',
        colorBgContainer: '#0f172a',  // Slate-900 (컨테이너 배경)
        colorBgElevated: '#1e293b',   // Slate-800 (드롭다운/모달)
        colorBgSpotlight: '#334155',  // Slate-700

        // 타이포그래피 - 선명하고 편안한 콘트라스트
        colorText: '#f1f5f9',         // Slate-100
        colorTextSecondary: '#94a3b8', // Slate-400
        colorTextTertiary: '#64748b',  // Slate-500
        colorTextQuaternary: '#475569', // Slate-600

        // 보더 - 은은한 레이어 구분
        colorBorder: '#1e293b',       // Slate-800
        colorBorderSecondary: '#0f172a', // Slate-900

        // 디자인 토큰 - 정밀 기기 스타일 + 모던한 라운딩
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

        // 간격
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

        // 그림자 - 깊이감 있고 세련된 (약간의 네이비 틴트)
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        boxShadowSecondary: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    },
    algorithm: theme.darkAlgorithm,
    components: {
        Layout: {
            siderBg: '#020617',
            headerBg: 'rgba(15, 23, 42, 0.8)', // 글래스모피즘 기반
            bodyBg: '#020617',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(59, 130, 246, 0.15)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
            itemBorderRadius: 10,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#60a5fa',
        },
        Card: {
            colorBgContainer: '#0f172a',
            borderRadiusLG: 16,
            boxShadowTertiary: '0 4px 12px rgba(0, 0, 0, 0.2)',
            paddingLG: 24,
            headerFontSize: 16,
            fontWeightStrong: 600,
            actionsBg: '#1e293b',
        },
        Table: {
            headerBg: '#1e293b',
            headerColor: '#94a3b8',
            rowHoverBg: 'rgba(255, 255, 255, 0.02)',
            borderColor: '#1e293b',
            headerBorderRadius: 10,
            cellPaddingBlock: 14,
        },
        Button: {
            borderRadius: 10,
            borderRadiusLG: 12,
            borderRadiusSM: 8,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 600,
            primaryShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            controlHeight: 40,
        },
        Input: {
            borderRadius: 10,
            paddingInline: 14,
            activeShadow: '0 0 0 4px rgba(59, 130, 246, 0.15)',
            colorBgContainer: '#020617',
            colorBorder: '#1e293b',
            hoverBorderColor: '#3b82f6',
            controlHeight: 40,
        },
        Select: {
            borderRadius: 10,
            optionSelectedBg: 'rgba(59, 130, 246, 0.15)',
            controlHeight: 40,
        },
        Tag: {
            borderRadiusSM: 6,
            fontWeightStrong: 600,
        },
        Badge: {
            dotSize: 8,
        },
        Tabs: {
            cardBg: '#0f172a',
            itemActiveColor: '#60a5fa',
            itemHoverColor: '#93c5fd',
            inkBarColor: '#3b82f6',
            horizontalItemPadding: '12px 16px',
        },
        Modal: {
            contentBg: '#0f172a',
            headerBg: '#0f172a',
            borderRadiusLG: 24,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        },
        Drawer: {
            colorBgElevated: '#0f172a',
            borderRadiusLG: 24,
        },
        Statistic: {
            contentFontSize: 28,
            titleFontSize: 14,
        },
        Tooltip: {
            colorBgSpotlight: '#334155',
            borderRadius: 8,
        },
        Alert: {
            borderRadiusLG: 10,
        },
        Progress: {
            defaultColor: '#3b82f6',
        },
        Spin: {
            colorPrimary: '#3b82f6',
        },
    },
};

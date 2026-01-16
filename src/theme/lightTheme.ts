import type { ThemeConfig } from 'antd';
import { lightColors } from './constants';

/**
 * Light Theme: Clean Room Style (클린룸 스타일)
 * 반도체 제조 클린룸의 순백색 환경을 모티프로 한 테마
 * - 깨끗하고 정밀한 느낌
 * - 청록색 계열 악센트
 * - 기기 패널 스타일의 각진 모서리
 */
export const lightTheme: ThemeConfig = {
    token: {
        // 반도체 설비 컬러 팔레트
        colorPrimary: lightColors.colorPrimary,
        colorSuccess: lightColors.colorSuccess,
        colorWarning: lightColors.colorWarning,
        colorError: lightColors.colorError,
        colorInfo: lightColors.colorInfo,

        // 클린룸 스타일 배경 - 순백색 계열
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f8fafc',
        colorBgBase: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBgSpotlight: '#f1f5f9',

        // 타이포그래피 - 기술적 느낌
        colorText: '#0f172a',           // Slate-900 - 높은 가독성
        colorTextSecondary: '#475569',  // Slate-600
        colorTextTertiary: '#64748b',   // Slate-500
        colorTextQuaternary: '#94a3b8', // Slate-400

        // 보더 - 정밀 패널 라인
        colorBorder: '#e2e8f0',         // Slate-200
        colorBorderSecondary: '#f1f5f9', // Slate-100

        // 디자인 토큰 - 정밀 기기 스타일
        borderRadius: 6,
        borderRadiusLG: 10,
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

        // 그림자 - 정밀하고 미세한 깊이감
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
    },
    components: {
        Layout: {
            siderBg: '#0f172a',
            headerBg: '#ffffff',
            bodyBg: '#f8fafc',
            headerPadding: '0 24px',
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(8, 145, 178, 0.2)',  // Cyan 계열
            darkItemHoverBg: 'rgba(8, 145, 178, 0.1)',
            itemBorderRadius: 6,
            itemMarginInline: 8,
            itemPaddingInline: 16,
            iconSize: 18,
            collapsedIconSize: 20,
            itemSelectedColor: '#22d3ee',  // Cyan-400
        },
        Card: {
            colorBgContainer: '#ffffff',
            borderRadiusLG: 10,
            boxShadowTertiary: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
            paddingLG: 20,
            headerFontSize: 15,
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#475569',
            rowHoverBg: '#f1f5f9',
            borderColor: '#e2e8f0',
            headerBorderRadius: 6,
            cellPaddingBlock: 12,
        },
        Button: {
            borderRadius: 6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            paddingInline: 16,
            paddingInlineLG: 24,
            fontWeight: 500,
            primaryShadow: '0 1px 2px 0 rgba(8, 145, 178, 0.15)',
            defaultShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
        Input: {
            borderRadius: 6,
            paddingInline: 12,
            activeShadow: '0 0 0 2px rgba(8, 145, 178, 0.15)',
            hoverBorderColor: lightColors.colorPrimary,
        },
        Select: {
            borderRadius: 6,
            optionSelectedBg: 'rgba(8, 145, 178, 0.1)',
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
            itemActiveColor: lightColors.colorPrimary,
            itemHoverColor: lightColors.colorPrimary,
            inkBarColor: lightColors.colorPrimary,
        },
        Modal: {
            borderRadiusLG: 10,
            titleFontSize: 18,
        },
        Drawer: {
            borderRadiusLG: 10,
        },
        Message: {
            borderRadiusLG: 8,
        },
        Notification: {
            borderRadiusLG: 10,
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

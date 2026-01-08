/* eslint-disable react-refresh/only-export-components */
import styled, { keyframes } from 'styled-components';
import {
    fadeInUp,
    pulse,
    shimmer,
    OverviewPageContainer as PageContainer,
    OverviewScrollContent as BaseScrollContent,
    KPIGridContainer,
    OverviewStatsCard as StatsCard,
    OverviewChartCard as ChartCard,
    OverviewListCard as ListCard,
    IconBadge,
    BigNumber,
    LiveIndicator,
    ChartLegendItem,
    ProgressBar,
    COLORS,
    OVERVIEW_THEMES as CHART_THEMES
} from '@/components/shared/OverviewStyles';

export {
    fadeInUp,
    pulse,
    shimmer,
    PageContainer,
    KPIGridContainer,
    StatsCard,
    ChartCard,
    ListCard,
    IconBadge,
    BigNumber,
    LiveIndicator,
    ChartLegendItem,
    ProgressBar,
    COLORS,
    CHART_THEMES
};

const ambientShift = keyframes`
    0% {
        background-position: 0% 0%, 100% 0%, 0% 100%, 0% 0%;
    }
    50% {
        background-position: 10% 8%, 90% 6%, 6% 92%, 0% 0%;
    }
    100% {
        background-position: 0% 0%, 100% 0%, 0% 100%, 0% 0%;
    }
`;

export const DashboardSurface = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 1.4vw, 18px);
    min-height: 100%;
    flex: 1;
    isolation: isolate;

    &::before {
        content: '';
        position: absolute;
        inset: -40px -24px -60px -24px;
        background-image:
            radial-gradient(700px circle at 10% -10%, rgba(34, 197, 94, 0.18), transparent 55%),
            radial-gradient(900px circle at 85% 0%, rgba(14, 165, 233, 0.18), transparent 55%),
            radial-gradient(900px circle at 90% 90%, rgba(249, 115, 22, 0.12), transparent 60%),
            linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 1) 60%, rgba(255, 247, 237, 1) 100%);
        background-repeat: no-repeat;
        opacity: 0.95;
        pointer-events: none;
        z-index: 0;
        animation: ${ambientShift} 18s ease-in-out infinite;
    }

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px);
        background-size: 28px 28px;
        opacity: 0.18;
        pointer-events: none;
        z-index: 0;
    }

    & > * {
        position: relative;
        z-index: 1;
    }

    .ant-card {
        background-color: rgba(255, 255, 255, 0.84);
        background-blend-mode: soft-light;
        border: 1px solid rgba(148, 163, 184, 0.35);
        box-shadow: 0 12px 30px -22px rgba(15, 23, 42, 0.35);
        backdrop-filter: blur(14px);
    }

    .ant-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 22px 48px -32px rgba(15, 23, 42, 0.45);
    }

    .ant-card-head {
        background: transparent;
    }

    .ant-card-head-title {
        letter-spacing: 0.02em;
    }

    .ant-statistic-title {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--ant-color-text-tertiary);
    }

    [data-theme='dark'] &::before,
    .dark-mode &::before {
        background-image:
            radial-gradient(700px circle at 10% -10%, rgba(34, 197, 94, 0.16), transparent 55%),
            radial-gradient(900px circle at 85% 0%, rgba(14, 165, 233, 0.14), transparent 55%),
            radial-gradient(900px circle at 90% 90%, rgba(249, 115, 22, 0.1), transparent 60%),
            linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(17, 24, 39, 1) 60%, rgba(30, 41, 59, 1) 100%);
        opacity: 0.9;
    }

    [data-theme='dark'] &::after,
    .dark-mode &::after {
        background-image: radial-gradient(rgba(148, 163, 184, 0.18) 1px, transparent 1px);
        opacity: 0.12;
    }

    [data-theme='dark'] & .ant-card,
    .dark-mode & .ant-card {
        background-color: rgba(15, 23, 42, 0.78);
        border-color: rgba(148, 163, 184, 0.2);
        box-shadow: 0 14px 32px -24px rgba(0, 0, 0, 0.6);
    }

    [data-theme='dark'] & .ant-card:hover,
    .dark-mode & .ant-card:hover {
        box-shadow: 0 24px 56px -34px rgba(0, 0, 0, 0.7);
    }

    @media (max-width: 768px) {
        &::before {
            inset: -20px -16px -30px -16px;
        }
    }
`;

export const DashboardScrollContent = styled(BaseScrollContent)`
    gap: clamp(12px, 1.4vw, 18px);
`;

// Dashboard Specific Layouts
export const IntegratedKPIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(4, minmax(100px, 1fr));
    gap: var(--ant-margin-xs, 8px);
    width: 100%;
    height: 100%;
    align-content: stretch;
`;

export const IntegratedKPIColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--ant-margin-sm, 12px);
    min-width: 0;
    flex: 1;
`;

export const IntegratedTopRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--ant-margin, 16px);
    flex: 0 0 auto;
    align-items: stretch;
    min-height: 540px;
`;

export const IntegratedChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(3, minmax(160px, 1fr));
    grid-auto-rows: minmax(160px, 1fr);
    grid-auto-flow: row;
    gap: var(--ant-margin-sm, 12px);
    flex: 1;
    min-width: 0;
    min-height: 0;
    align-content: stretch;
    width: 100%;
    height: 100%;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-auto-flow: row;
        min-height: 0;
    }

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

export const IntegratedBottomRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--ant-margin, 16px);
    flex: 0 0 auto;
    min-height: 260px;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(2, 280px);
        flex: none;
        height: auto;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(2, 280px);
        height: auto;
    }
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: var(--ant-margin, 16px);
    flex: 1;
    min-width: 0;
`;

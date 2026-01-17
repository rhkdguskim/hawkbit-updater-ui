/* eslint-disable react-refresh/only-export-components */
import styled from 'styled-components';
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

export const DashboardSurface = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
    flex: 1;
    isolation: isolate;

    /* 카드 스타일 통일 */
    .ant-card {
        border: 1px solid var(--ant-color-border);
        box-shadow: var(--shadow-sm);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .ant-card:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    .ant-card-body {
        min-height: 0;
        overflow: visible;
    }

    [data-theme='dark'] & .ant-card,
    .dark-mode & .ant-card {
        background-color: var(--ant-color-bg-container);
        border-color: rgba(255, 255, 255, 0.06);
    }

    [data-theme='dark'] & .ant-card:hover,
    .dark-mode & .ant-card:hover {
        box-shadow: var(--shadow-md);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .dashboard-clickable {
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .dashboard-clickable:focus-visible {
        outline: 2px solid var(--ant-color-primary);
        outline-offset: 2px;
    }

    .dashboard-clickable[data-disabled='true'] {
        cursor: default;
        opacity: 0.6;
    }

    .dashboard-clickable:active {
        transform: scale(0.99);
    }
`;

export const DashboardScrollContent = styled(BaseScrollContent)`
    gap: 20px;
    padding: 4px 8px 20px;
`;

// Dashboard Specific Layouts
export const IntegratedKPIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(1, minmax(100px, 1fr)); 
    gap: 16px;
    width: 100%;
    align-content: stretch;
`;

export const IntegratedKPIColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    flex: 1;
`;

export const IntegratedTopRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    flex: 0 0 auto;
    align-items: stretch;
    min-height: 480px;
`;

export const IntegratedChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(180px, 1fr));
    gap: 16px;
    flex: 1;
    min-width: 0;
    width: 100%;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
    }
`;

export const IntegratedBottomRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    flex: 0 0 auto;
    min-height: 260px;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(2, 280px);
        height: auto;
    }
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: 20px;
    flex: 1;
    min-width: 0;
`;

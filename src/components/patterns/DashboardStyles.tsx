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
    gap: 20px;
    min-height: 100%;
    flex: 1;
    isolation: isolate;

    /* Modern card styles */
    .ant-card {
        border: 1px solid var(--ant-color-border);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }

    .ant-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 10px -5px rgba(0, 0, 0, 0.04);
        border-color: var(--ant-color-primary-border-hover);
    }

    .ant-card-head {
        border-bottom: 1px solid var(--ant-color-border-secondary);
        padding: 16px 20px;
        min-height: auto;
    }

    .ant-card-head-title {
        padding: 0;
    }

    .ant-card-body {
        min-height: 0;
        overflow: visible;
        padding: 20px;
    }

    [data-theme='dark'] & .ant-card,
    .dark-mode & .ant-card {
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
        border-color: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(10px);
    }

    [data-theme='dark'] & .ant-card:hover,
    .dark-mode & .ant-card:hover {
        box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.4), 0 8px 20px -10px rgba(0, 0, 0, 0.3);
        border-color: var(--ant-color-primary-border);
    }

    .dashboard-clickable {
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dashboard-clickable:focus-visible {
        outline: 2px solid var(--ant-color-primary);
        outline-offset: 3px;
        border-radius: 8px;
    }

    .dashboard-clickable[data-disabled='true'] {
        cursor: default;
        opacity: 0.6;
    }

    .dashboard-clickable:active {
        transform: scale(0.98);
    }
`;

export const DashboardScrollContent = styled(BaseScrollContent)`
    gap: 24px;
    padding: 8px 12px 24px;
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

import styled from 'styled-components';
export {
    fadeInUp,
    pulse,
    shimmer,
    OverviewPageContainer as PageContainer,
    OverviewScrollContent as DashboardScrollContent,
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

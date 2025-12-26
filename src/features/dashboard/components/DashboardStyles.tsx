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
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
    flex-shrink: 0;
    width: 520px;
    height: 100%;
`;

export const IntegratedTopRow = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 180px;
`;

export const IntegratedChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    flex: 1;
    min-width: 0;
    min-height: 0;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
    }
`;

export const IntegratedBottomRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    gap: 16px;
    flex: 2;
    min-height: 300px;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        flex: none;
        height: auto;
        
        & > *:last-child {
            grid-column: 1 / -1;
        }
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, 280px);
        height: auto;
        
        & > *:last-child {
            grid-column: auto;
        }
    }
`;

export const ChartsContainer = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-width: 0;
`;


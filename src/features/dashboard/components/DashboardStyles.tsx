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
    gap: clamp(12px, 1.4vw, 16px);
    min-height: 100%;
    flex: 1;
    isolation: isolate;

    /* Global Card Overrides for Dashboard Density */
    .ant-card {
        border: 1px solid var(--ant-color-border);
        box-shadow: var(--shadow-sm);
        /* Ensure precise corners */
        border-radius: var(--ant-border-radius-lg, 12px);
    }

    .ant-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--ant-color-primary-border);
    }

    [data-theme='dark'] & .ant-card,
    .dark-mode & .ant-card {
        background-color: var(--ant-color-bg-container);
        border-color: var(--ant-color-border-secondary);
        box-shadow: var(--shadow-sm);
    }

    [data-theme='dark'] & .ant-card:hover,
    .dark-mode & .ant-card:hover {
        box-shadow: var(--shadow-md);
        border-color: var(--ant-color-primary);
    }
 `;

export const DashboardScrollContent = styled(BaseScrollContent)`
    gap: clamp(12px, 1.4vw, 16px);
    padding: var(--ant-padding-sm, 12px);
`;

// Dashboard Specific Layouts
export const IntegratedKPIGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    /* Fixed height rows for uniformity */
    grid-template-rows: repeat(1, minmax(100px, 1fr)); 
    gap: var(--ant-margin-sm, 12px);
    width: 100%;
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
    min-height: 480px; /* Reduced specific height */
`;

export const IntegratedChartsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(180px, 1fr)); /* 2 substantial rows */
    gap: var(--ant-margin-sm, 12px);
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
    gap: var(--ant-margin, 16px);
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
    gap: var(--ant-margin, 16px);
    flex: 1;
    min-width: 0;
`;

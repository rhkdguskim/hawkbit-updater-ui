import React from 'react';
import styled from 'styled-components';
import { PageContainer, DashboardScrollContent, IntegratedKPIGrid, IntegratedChartsRow, IntegratedBottomRow } from '../DashboardStyles';

const HeaderRow = styled.div`
    flex-shrink: 0;
    margin-bottom: 8px;
`;

interface IntegratedDashboardGridProps {
    header: React.ReactNode;
    kpiCards: React.ReactNode;
    charts: React.ReactNode;
    bottomWidgets: React.ReactNode;
}

export const IntegratedDashboardGrid: React.FC<IntegratedDashboardGridProps> = ({
    header,
    kpiCards,
    charts,
    bottomWidgets,
}) => {
    return (
        <PageContainer>
            <HeaderRow>
                {header}
            </HeaderRow>
            <DashboardScrollContent>
                {/* KPI Row: 8 cards */}
                {kpiCards}

                {/* Charts Row: 4 charts */}
                <IntegratedChartsRow>
                    {charts}
                </IntegratedChartsRow>

                {/* Bottom Row: 3 widgets */}
                <IntegratedBottomRow>
                    {bottomWidgets}
                </IntegratedBottomRow>
            </DashboardScrollContent>
        </PageContainer>
    );
};

// Keep original DashboardGrid for backward compatibility
const TopRow = styled.div`
    display: flex;
    gap: 16px;
    flex: 0 0 auto;
    min-height: 320px;
`;

const BottomRow = styled.div`
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
`;

interface DashboardGridProps {
    header: React.ReactNode;
    kpiCards: React.ReactNode;
    charts: React.ReactNode;
    bottomWidgets: React.ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
    header,
    kpiCards,
    charts,
    bottomWidgets,
}) => {
    return (
        <PageContainer>
            {header}
            <DashboardScrollContent>
                <TopRow>
                    {kpiCards}
                    {charts}
                </TopRow>
                <BottomRow>
                    {bottomWidgets}
                </BottomRow>
            </DashboardScrollContent>
        </PageContainer>
    );
};

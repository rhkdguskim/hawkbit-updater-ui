import React from 'react';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DashboardScrollContent, IntegratedKPIGrid, IntegratedKPIColumn, IntegratedTopRow, IntegratedChartsGrid, IntegratedBottomRow } from '../DashboardStyles';

const HeaderRow = styled.div`
    flex-shrink: 0;
`;

interface IntegratedDashboardGridProps {
    header: React.ReactNode;
    kpiCards: React.ReactNode;
    kpiFooter?: React.ReactNode;
    charts: React.ReactNode;
    bottomWidgets: React.ReactNode;
}

export const IntegratedDashboardGrid: React.FC<IntegratedDashboardGridProps> = ({
    header,
    kpiCards,
    kpiFooter,
    charts,
    bottomWidgets,
}) => {
    return (
        <PageLayout fullWidth={true}>
            <HeaderRow>
                {header}
            </HeaderRow>
            <DashboardScrollContent>
                {/* Top Row: KPI 2x4 grid + 4 Charts */}
                <IntegratedTopRow>
                    <IntegratedKPIColumn>
                        <IntegratedKPIGrid>
                            {kpiCards}
                        </IntegratedKPIGrid>
                        {kpiFooter}
                    </IntegratedKPIColumn>
                    <IntegratedChartsGrid>
                        {charts}
                    </IntegratedChartsGrid>
                </IntegratedTopRow>

                {/* Bottom Row: 3 widgets with 1:1:2 ratio */}
                <IntegratedBottomRow>
                    {bottomWidgets}
                </IntegratedBottomRow>
            </DashboardScrollContent>
        </PageLayout>
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
        <PageLayout fullWidth={true}>
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
        </PageLayout>
    );
};

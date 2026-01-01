import React from 'react';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DashboardScrollContent } from '../DashboardStyles';

const HeaderRow = styled.div`
    flex-shrink: 0;
`;

// ===== Decision Layer (TOP - 20%) =====
const DecisionLayer = styled.section`
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: var(--ant-margin, 16px);
    min-height: 160px;
    flex-shrink: 0;
    padding-bottom: var(--ant-margin, 16px);
    border-bottom: 1px solid var(--ant-color-border-secondary, rgba(0, 0, 0, 0.06));

    @media (max-width: 1200px) {
        grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

// ===== Control Layer (MIDDLE - 50%) =====
const ControlLayer = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--ant-margin, 16px);
    min-height: 400px;
    flex: 1;
    padding: var(--ant-margin, 16px) 0;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`;

// ===== Monitoring Layer (BOTTOM - 30%) =====
const MonitoringLayer = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--ant-margin, 16px);
    min-height: 280px;
    flex-shrink: 0;
    padding-top: var(--ant-margin, 16px);
    border-top: 1px solid var(--ant-color-border-secondary, rgba(0, 0, 0, 0.06));

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`;

const SectionLabel = styled.div`
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--ant-color-text-quaternary);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;

    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--ant-color-border-secondary);
    }
`;

const SectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

export interface ThreeLayerDashboardGridProps {
    header: React.ReactNode;
    // Decision Layer
    healthSummary: React.ReactNode;
    actionRequired: React.ReactNode;
    extraDecision?: React.ReactNode;
    // Control Layer
    activeRollouts: React.ReactNode;
    inProgressUpdates: React.ReactNode;
    // Monitoring Layer
    statusTrend: React.ReactNode;
    actionActivity: React.ReactNode;
    // Labels
    showLayerLabels?: boolean;
}

export const ThreeLayerDashboardGrid: React.FC<ThreeLayerDashboardGridProps> = ({
    header,
    healthSummary,
    actionRequired,
    extraDecision,
    activeRollouts,
    inProgressUpdates,
    statusTrend,
    actionActivity,
    showLayerLabels = false,
}) => {
    return (
        <PageLayout fullWidth={true}>
            <HeaderRow>
                {header}
            </HeaderRow>
            <DashboardScrollContent>
                {/* TOP: Decision Layer */}
                <SectionWrapper>
                    {showLayerLabels && <SectionLabel>Decision Layer</SectionLabel>}
                    <DecisionLayer>
                        {healthSummary}
                        {actionRequired}
                        {extraDecision}
                    </DecisionLayer>
                </SectionWrapper>

                {/* MIDDLE: Control Layer */}
                <SectionWrapper>
                    {showLayerLabels && <SectionLabel>Control Layer</SectionLabel>}
                    <ControlLayer>
                        {activeRollouts}
                        {inProgressUpdates}
                    </ControlLayer>
                </SectionWrapper>

                {/* BOTTOM: Monitoring Layer */}
                <SectionWrapper>
                    {showLayerLabels && <SectionLabel>Monitoring Layer</SectionLabel>}
                    <MonitoringLayer>
                        {statusTrend}
                        {actionActivity}
                    </MonitoringLayer>
                </SectionWrapper>
            </DashboardScrollContent>
        </PageLayout>
    );
};

export default ThreeLayerDashboardGrid;

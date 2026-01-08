import React from 'react';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DashboardScrollContent, DashboardSurface, fadeInUp } from '../DashboardStyles';

const HeaderRow = styled.div`
    flex-shrink: 0;
    animation: ${fadeInUp} 0.6s ease-out;
    animation-fill-mode: both;
`;

// ===== Decision Layer (TOP) =====
const DecisionLayer = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(10px, 1.2vw, 16px);
    min-height: 160px;
    flex-shrink: 0;
    padding-bottom: var(--ant-margin, 16px);
    border-bottom: 1px solid var(--ant-color-border-secondary, rgba(0, 0, 0, 0.06));

    @media (max-width: 1600px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

// ===== Stats Layer (Between Top & Middle) =====
const StatsLayer = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(10px, 1.2vw, 16px);
    flex-shrink: 0;
    padding-bottom: var(--ant-margin, 16px);
    // border-bottom: 1px solid var(--ant-color-border-secondary, rgba(0, 0, 0, 0.03));

    @media (max-width: 1600px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

// ===== Control Layer (MIDDLE) =====
const ControlLayer = styled.section`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(10px, 1.2vw, 16px);
    min-height: 380px;
    flex: 1;
    padding-bottom: var(--ant-margin, 16px);

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`;

// ===== Monitoring Layer (BOTTOM) =====
const MonitoringLayer = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr);
    gap: clamp(10px, 1.2vw, 16px);
    min-height: 280px;
    flex-shrink: 0;
    padding-top: var(--ant-margin, 16px);
    border-top: 1px solid var(--ant-color-border-secondary, rgba(0, 0, 0, 0.06));

    @media (max-width: 1400px) {
        grid-template-columns: 1fr 1fr;
    }

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
    animation: ${fadeInUp} 0.6s ease-out;
    animation-fill-mode: both;

    &:nth-of-type(1) {
        animation-delay: 0.06s;
    }

    &:nth-of-type(2) {
        animation-delay: 0.12s;
    }

    &:nth-of-type(3) {
        animation-delay: 0.18s;
    }

    &:nth-of-type(4) {
        animation-delay: 0.24s;
    }
`;

export interface ThreeLayerDashboardGridProps {
    header: React.ReactNode;
    // Decision Layer
    healthSummary: React.ReactNode;
    actionRequired: React.ReactNode;
    extraDecision?: React.ReactNode;
    overviewItem4?: React.ReactNode;
    // Stats Layer
    statsRow?: React.ReactNode;
    // Control Layer
    activeRollouts: React.ReactNode;
    inProgressUpdates: React.ReactNode;
    // Monitoring Layer
    statusTrend: React.ReactNode;
    actionActivity: React.ReactNode;
    recentlyFinishedActions?: React.ReactNode;
    // Labels
    showLayerLabels?: boolean;
}

export const ThreeLayerDashboardGrid: React.FC<ThreeLayerDashboardGridProps> = ({
    header,
    healthSummary,
    actionRequired,
    extraDecision,
    overviewItem4,
    statsRow,
    activeRollouts,
    inProgressUpdates,
    statusTrend,
    actionActivity,
    recentlyFinishedActions,
    showLayerLabels = false,
}) => {
    return (
        <PageLayout fullWidth={true}>
            <DashboardSurface>
                <HeaderRow>
                    {header}
                </HeaderRow>
                <DashboardScrollContent>
                    {/* TOP: Decision Layer */}
                    <SectionWrapper>
                        {showLayerLabels && <SectionLabel>Overview</SectionLabel>}
                        <DecisionLayer>
                            {healthSummary}
                            {actionRequired}
                            {extraDecision}
                            {overviewItem4}
                        </DecisionLayer>
                    </SectionWrapper>

                    {/* NEW: Stats Layer */}
                    {statsRow && (
                        <SectionWrapper>
                            <StatsLayer>
                                {statsRow}
                            </StatsLayer>
                        </SectionWrapper>
                    )}

                    {/* MIDDLE: Control Layer */}
                    <SectionWrapper>
                        {showLayerLabels && <SectionLabel>Operations</SectionLabel>}
                        <ControlLayer>
                            {activeRollouts}
                            {inProgressUpdates}
                        </ControlLayer>
                    </SectionWrapper>

                    {/* BOTTOM: Monitoring Layer */}
                    <SectionWrapper>
                        {showLayerLabels && <SectionLabel>Analytics & Trends</SectionLabel>}
                        <MonitoringLayer>
                            {statusTrend}
                            {actionActivity}
                            {recentlyFinishedActions}
                        </MonitoringLayer>
                    </SectionWrapper>
                </DashboardScrollContent>
            </DashboardSurface>
        </PageLayout>
    );
};

export default ThreeLayerDashboardGrid;

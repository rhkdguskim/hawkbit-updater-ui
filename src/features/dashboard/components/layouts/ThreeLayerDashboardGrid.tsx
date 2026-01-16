import React from 'react';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DashboardScrollContent, DashboardSurface, fadeInUp } from '../DashboardStyles';
import { useTranslation } from 'react-i18next';

const HeaderRow = styled.div`
    flex-shrink: 0;
    animation: ${fadeInUp} 0.6s ease-out;
    animation-fill-mode: both;
`;

// ===== Decision Layer (TOP) =====
const DecisionLayer = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(12px, 1vw, 16px);
    min-height: 96px;
    flex-shrink: 0;
    padding-bottom: 8px;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;
const ControlLayer = styled.section`
    display: grid;
    grid-template-columns: 1.8fr 1fr 1fr;
    gap: clamp(12px, 1vw, 16px);
    min-height: 360px;
    flex-shrink: 0;
    padding-bottom: 8px;

    @media (max-width: 1600px) {
        grid-template-columns: 1.2fr 1fr 1fr;
    }

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;
// ===== Stats Layer (Between Top & Middle) =====
const StatsLayer = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(12px, 1vw, 16px);
    flex-shrink: 0;
    padding-bottom: 8px;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;


// ===== Monitoring Layer (BOTTOM) =====
const MonitoringLayer = styled.section`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(12px, 1vw, 16px);
    min-height: 180px;
    flex-shrink: 1;
    padding-top: 6px;

    @media (max-width: 992px) {
        grid-template-columns: 1fr;
        min-height: auto;
    }
`;

const SectionLabel = styled.div`
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ant-color-text-secondary);
    opacity: 0.8;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    user-select: none;

    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, var(--ant-color-border-secondary), transparent);
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
    // Control Layer
    activeRollouts: React.ReactNode;
    inProgressUpdates?: React.ReactNode;
    recentlyFinishedActions?: React.ReactNode;
    // Stats Layer
    statsRow?: React.ReactNode;
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
    overviewItem4,
    statsRow,
    activeRollouts,
    inProgressUpdates,
    recentlyFinishedActions,
    statusTrend,
    actionActivity,
    showLayerLabels = false,
}) => {
    const { t } = useTranslation('dashboard');
    return (
        <PageLayout fullWidth={true} padding="8px 12px 10px" gap="8px">
            <DashboardSurface>
                <HeaderRow>
                    {header}
                </HeaderRow>
                <DashboardScrollContent>
                    {/* TOP: Overview & Metrics Layer */}
                    <SectionWrapper>
                        {showLayerLabels && <SectionLabel>{t('sections.decision', 'Decision Support')}</SectionLabel>}
                        <DecisionLayer>
                            {healthSummary}
                            {actionRequired}
                            {extraDecision}
                            {overviewItem4}
                        </DecisionLayer>
                    </SectionWrapper>

                    {/* MIDDLE: Control & Activity Layer */}
                    <SectionWrapper>
                        {showLayerLabels && <SectionLabel>{t('sections.operations', 'Active Operations')}</SectionLabel>}
                        <ControlLayer>
                            {activeRollouts}
                            {inProgressUpdates}
                            {recentlyFinishedActions}
                        </ControlLayer>
                    </SectionWrapper>

                    {/* NEW: Performance Stats Layer */}
                    {statsRow && (
                        <SectionWrapper>
                            {showLayerLabels && <SectionLabel>{t('sections.analytics', 'Performance Analytics')}</SectionLabel>}
                            <StatsLayer>
                                {statsRow}
                            </StatsLayer>
                        </SectionWrapper>
                    )}

                    {/* BOTTOM: Monitoring & History Layer */}
                    <SectionWrapper>
                        {showLayerLabels && <SectionLabel>{t('sections.trends', 'Trend & History')}</SectionLabel>}
                        <MonitoringLayer>
                            {statusTrend}
                            {actionActivity}
                        </MonitoringLayer>
                    </SectionWrapper>
                </DashboardScrollContent>
            </DashboardSurface>
        </PageLayout>
    );
};

export default ThreeLayerDashboardGrid;

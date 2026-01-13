import React, { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Tooltip, Skeleton } from 'antd';
import {
    CheckCircleFilled,
    WarningFilled,
    CloseCircleFilled,
    InfoCircleOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import EmergencyStopButton from '@/components/shared/EmergencyStopButton';

const { Text } = Typography;

// Health status types
export type HealthStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

interface HealthData {
    status: HealthStatus;
    totalTargets: number;
    updatingCount: number;
    errorRate1h: number;
    pausedRollouts: number;
    reasons: string[];
}

// Pulse animation for CRITICAL status
const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`;

const statusColors = {
    SAFE: {
        bg: 'var(--ant-color-bg-container)', // Solid BG
        border: 'var(--ant-color-success)',
        badge: 'rgba(var(--ant-color-success-rgb), 0.15)',
        badgeText: 'var(--ant-color-success)',
        text: 'var(--ant-color-success)',
    },
    WARNING: {
        bg: 'var(--ant-color-bg-container)',
        border: 'var(--ant-color-warning)',
        badge: 'rgba(var(--ant-color-warning-rgb), 0.15)',
        badgeText: 'var(--ant-color-warning)',
        text: 'var(--ant-color-warning)',
    },
    CRITICAL: {
        bg: 'var(--ant-color-bg-container)',
        border: 'var(--ant-color-error)',
        badge: 'rgba(var(--ant-color-error-rgb), 0.15)',
        badgeText: 'var(--ant-color-error)',
        text: 'var(--ant-color-error)',
    },
};

const Container = styled.div<{ $status: HealthStatus }>`
    background: ${props => statusColors[props.$status].bg};
    /* Top Border Indicator instead of full border? Or full border for critical */
    border: 1px solid ${props => props.$status === 'SAFE' ? 'var(--ant-color-border)' : statusColors[props.$status].border};
    border-top: 4px solid ${props => statusColors[props.$status].text}; /* Industrial Status Bar */
    
    border-radius: var(--ant-border-radius-lg, 12px);
    padding: 16px; /* Tighter padding */
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    transition: all 0.2s ease;
    box-shadow: var(--shadow-sm);

    ${props => props.$status === 'CRITICAL' && css`
        animation: ${pulse} 2s infinite;
        border-color: var(--ant-color-error);
    `}

    &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
    }
`;

const StatusBadge = styled.div<{ $status: HealthStatus }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 4px; /* Industrial capsule */
    background: ${props => statusColors[props.$status].badge};
    color: ${props => statusColors[props.$status].badgeText};
    border: 1px solid ${props => statusColors[props.$status].border};
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const MetricLabel = styled(Text)`
    font-size: 11px;
    color: var(--ant-color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const MetricValue = styled.span`
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--ant-color-text);
`;

const ReasonsList = styled.div<{ $status: HealthStatus }>`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    background: var(--ant-color-bg-container-secondary);
    border: 1px solid ${props => statusColors[props.$status].border};
    border-radius: 6px;
    font-size: 12px;
`;

const ReasonItem = styled.div<{ $status: HealthStatus; $type?: 'error' | 'warning' | 'info' }>`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.$type === 'error' ? 'var(--ant-color-error)' : props.$type === 'warning' ? 'var(--ant-color-warning)' : statusColors[props.$status].text};
    font-weight: 500;
    font-family: var(--font-mono); /* Technical error log look */
`;

const ViewAnalysisButton = styled.div<{ $status: HealthStatus }>`
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    background: transparent;
    border-radius: 6px;
    color: ${props => statusColors[props.$status].text};
    border: 1px solid ${props => statusColors[props.$status].border};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => statusColors[props.$status].badge};
    }
`;

interface HealthSummaryWidgetProps {
    isLoading: boolean;
    totalTargets: number;
    updatingCount: number;
    pausedRollouts: number;
    errorRollouts: number;
    errorActions1h: number;
    onAnalysisClick?: () => void;
}

export const HealthSummaryWidget: React.FC<HealthSummaryWidgetProps> = ({
    isLoading,
    totalTargets,
    updatingCount,
    pausedRollouts,
    errorRollouts,
    errorActions1h,
    onAnalysisClick,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const healthData = useMemo((): HealthData => {
        const errorRate = totalTargets > 0 ? (errorActions1h / totalTargets) * 100 : 0;
        const reasons: string[] = [];
        let status: HealthStatus = 'SAFE';

        // Determine status based on rules from request doc
        if (pausedRollouts > 0) {
            reasons.push(t('health.pausedRolloutsReason', { count: pausedRollouts }));
            status = 'WARNING';
        }

        if (errorRollouts > 0) {
            reasons.push(t('health.errorRolloutsReason', { count: errorRollouts }));
            status = 'CRITICAL';
        }

        if (errorRate > 5) {
            reasons.push(t('health.highErrorRateReason', { rate: errorRate.toFixed(1) }));
            status = 'CRITICAL';
        } else if (errorRate > 2) {
            reasons.push(t('health.moderateErrorRateReason', { rate: errorRate.toFixed(1) }));
            if (status !== 'CRITICAL') status = 'WARNING';
        }

        return {
            status,
            totalTargets,
            updatingCount,
            errorRate1h: errorRate,
            pausedRollouts,
            reasons,
        };
    }, [totalTargets, updatingCount, pausedRollouts, errorRollouts, errorActions1h, t]);

    const getStatusIcon = (status: HealthStatus) => {
        switch (status) {
            case 'SAFE':
                return <CheckCircleFilled />;
            case 'WARNING':
                return <WarningFilled />;
            case 'CRITICAL':
                return <CloseCircleFilled />;
        }
    };

    if (isLoading) {
        return (
            <Container $status="SAFE">
                <Skeleton active paragraph={{ rows: 3 }} />
            </Container>
        );
    }

    return (
        <Container
            $status={healthData.status}
            onClick={healthData.status !== 'SAFE' ? onAnalysisClick : undefined}
            style={{ cursor: healthData.status !== 'SAFE' ? 'pointer' : 'default' }}
        >
            <Flex justify="space-between" align="center">
                <StatusBadge $status={healthData.status}>
                    {getStatusIcon(healthData.status)}
                    {t(`actionActivity.status.${healthData.status.toLowerCase()}`, healthData.status)}
                </StatusBadge>
                <Flex align="center" gap={8}>
                    <EmergencyStopButton size="small" />
                    <Tooltip title={t('health.infoTooltip')}>
                        <InfoCircleOutlined style={{ color: 'var(--ant-color-text-tertiary)', cursor: 'help' }} />
                    </Tooltip>
                </Flex>
            </Flex>

            <MetricsGrid>
                <MetricItem>
                    <MetricLabel>{t('health.totalTargets')}</MetricLabel>
                    <MetricValue>{healthData.totalTargets.toLocaleString()}</MetricValue>
                </MetricItem>
                <MetricItem>
                    <MetricLabel>{t('health.updating')}</MetricLabel>
                    <MetricValue>{healthData.updatingCount.toLocaleString()}</MetricValue>
                </MetricItem>
                <MetricItem>
                    <MetricLabel>{t('health.errorRate1h')}</MetricLabel>
                    <MetricValue>{healthData.errorRate1h.toFixed(1)}%</MetricValue>
                </MetricItem>
                <MetricItem>
                    <MetricLabel>{t('health.pausedRollouts')}</MetricLabel>
                    <MetricValue>{healthData.pausedRollouts}</MetricValue>
                </MetricItem>
            </MetricsGrid>

            {healthData.reasons.length > 0 && (
                <ReasonsList $status={healthData.status}>
                    {healthData.reasons.map((reason, index) => (
                        <ReasonItem key={index} $status={healthData.status}>
                            <WarningFilled style={{ fontSize: 14 }} />
                            {reason}
                        </ReasonItem>
                    ))}
                </ReasonsList>
            )}

            {healthData.status !== 'SAFE' && (
                <ViewAnalysisButton $status={healthData.status} onClick={(e) => {
                    e.stopPropagation();
                    onAnalysisClick?.();
                }}>
                    <span>{t('health.viewAnalysis', 'View Analysis')}</span>
                    <ArrowRightOutlined />
                </ViewAnalysisButton>
            )}
        </Container>
    );
};

export default HealthSummaryWidget;

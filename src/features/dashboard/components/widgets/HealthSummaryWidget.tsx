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
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
`;

const statusColors = {
    SAFE: {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
        border: 'rgba(16, 185, 129, 0.3)',
        badge: '#10b981',
        text: '#059669',
    },
    WARNING: {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
        border: 'rgba(245, 158, 11, 0.3)',
        badge: '#f59e0b',
        text: '#d97706',
    },
    CRITICAL: {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
        border: 'rgba(239, 68, 68, 0.4)',
        badge: '#ef4444',
        text: '#dc2626',
    },
};

const Container = styled.div<{ $status: HealthStatus }>`
    background: ${props => statusColors[props.$status].bg};
    border: 2px solid ${props => statusColors[props.$status].border};
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    transition: all 0.3s ease;

    ${props => props.$status === 'CRITICAL' && css`
        animation: ${pulse} 2s infinite;
    `}

    [data-theme='dark'] &,
    .dark-mode & {
        background: ${props =>
        props.$status === 'SAFE'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
            : props.$status === 'WARNING'
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
    };
    }
`;

const StatusBadge = styled.div<{ $status: HealthStatus }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    background: ${props => statusColors[props.$status].badge};
    color: white;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.5px;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2px;
`;

const MetricLabel = styled(Text)`
    font-size: 11px;
    color: var(--ant-color-text-secondary);
`;

const MetricValue = styled.span`
    font-size: 18px;
    font-weight: 600;
    color: var(--ant-color-text);
`;

const ReasonsList = styled.div<{ $status: HealthStatus }>`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    background: ${props =>
        props.$status === 'CRITICAL'
            ? 'rgba(239, 68, 68, 0.1)'
            : props.$status === 'WARNING'
                ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(16, 185, 129, 0.1)'
    };
    border-radius: 8px;
    font-size: 12px;
`;

const ReasonItem = styled.div<{ $status: HealthStatus }>`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => statusColors[props.$status].text};
    font-weight: 500;
`;

const ViewAnalysisButton = styled.div<{ $status: HealthStatus }>`
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 8px;
    color: ${props => statusColors[props.$status].text};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
        background: rgba(255, 255, 255, 0.8);
        transform: translateY(-2px);
    }

    [data-theme='dark'] &,
    .dark-mode & {
        background: rgba(0, 0, 0, 0.2);
        &:hover {
            background: rgba(0, 0, 0, 0.4);
        }
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
            status = 'CRITICAL';
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
                    {healthData.status}
                </StatusBadge>
                <Tooltip title={t('health.infoTooltip')}>
                    <InfoCircleOutlined style={{ color: 'var(--ant-color-text-tertiary)', cursor: 'help' }} />
                </Tooltip>
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

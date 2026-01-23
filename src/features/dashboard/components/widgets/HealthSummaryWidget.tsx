import React, { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Tooltip, Skeleton, theme } from 'antd';
import {
    CheckCircleFilled,
    WarningFilled,
    CloseCircleFilled,
    InfoCircleOutlined,
    ArrowRightOutlined,
} from '@ant-design/icons';
import EmergencyStopButton from '@/components/shared/EmergencyStopButton';

const { Text } = Typography;
const { useToken } = theme;

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

const Container = styled.div<{ $status: HealthStatus; $token: any }>`
    background: ${props => props.$token.colorBgContainer};
    border: 1px solid ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorError;
        if (props.$status === 'WARNING') return props.$token.colorWarning;
        return props.$token.colorBorder;
    }};
    border-top: 5px solid ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorError;
        if (props.$status === 'WARNING') return props.$token.colorWarning;
        return props.$token.colorSuccess;
    }};
    
    border-radius: ${props => props.$token.borderRadiusLG}px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.$token.boxShadowTertiary};

    ${props => props.$status === 'CRITICAL' && css`
        animation: ${pulse} 2s infinite;
    `}

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$token.boxShadow};
    }
`;

const StatusBadge = styled.div<{ $status: HealthStatus; $token: any }>`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    border-radius: 4px;
    background: ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorErrorBg;
        if (props.$status === 'WARNING') return props.$token.colorWarningBg;
        return props.$token.colorSuccessBg;
    }};
    color: ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorErrorText;
        if (props.$status === 'WARNING') return props.$token.colorWarningText;
        return props.$token.colorSuccessText;
    }};
    border: 1px solid ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorErrorBorder;
        if (props.$status === 'WARNING') return props.$token.colorWarningBorder;
        return props.$token.colorSuccessBorder;
    }};
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 24px;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
`;

const MetricLabel = styled(Text)`
    font-size: 10px;
    color: var(--ant-color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
`;

const MetricValue = styled.span<{ $token: any }>`
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.$token.colorText};
    line-height: 1.2;
`;

const ReasonsList = styled.div<{ $status: HealthStatus; $token: any }>`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    background: ${props => props.$token.colorFillQuaternary};
    border-left: 3px solid ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorError;
        if (props.$status === 'WARNING') return props.$token.colorWarning;
        return props.$token.colorSuccess;
    }};
    border-radius: 4px;
    font-size: 12px;
`;

const ReasonItem = styled.div<{ $token: any; $type?: 'error' | 'warning' | 'info' }>`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => {
        if (props.$type === 'error') return props.$token.colorError;
        if (props.$type === 'warning') return props.$token.colorWarning;
        return props.$token.colorTextSecondary;
    }};
    font-weight: 500;
    font-family: var(--font-mono);
`;

const ViewAnalysisButton = styled.div<{ $status: HealthStatus; $token: any }>`
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    background: transparent;
    border-radius: ${props => props.$token.borderRadius}px;
    color: ${props => {
        if (props.$status === 'CRITICAL') return props.$token.colorError;
        if (props.$status === 'WARNING') return props.$token.colorWarning;
        return props.$token.colorPrimary;
    }};
    border: 1px solid currentColor;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => {
            if (props.$status === 'CRITICAL') return props.$token.colorErrorBg;
            if (props.$status === 'WARNING') return props.$token.colorWarningBg;
            return props.$token.colorPrimaryBg;
        }};
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
    const { token } = useToken();

    const healthData = useMemo((): HealthData => {
        const errorRate = totalTargets > 0 ? (errorActions1h / totalTargets) * 100 : 0;
        const reasons: string[] = [];
        let status: HealthStatus = 'SAFE';

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
            <Container $status="SAFE" $token={token}>
                <Skeleton active paragraph={{ rows: 3 }} />
            </Container>
        );
    }

    const isClickable = healthData.status !== 'SAFE' && !!onAnalysisClick;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isClickable) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onAnalysisClick?.();
        }
    };

    return (
        <Container
            $status={healthData.status}
            $token={token}
            onClick={isClickable ? onAnalysisClick : undefined}
            onKeyDown={handleKeyDown}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : -1}
            aria-disabled={!isClickable}
            className={isClickable ? 'dashboard-clickable' : undefined}
        >
            <Flex justify="space-between" align="center">
                <StatusBadge $status={healthData.status} $token={token}>
                    {getStatusIcon(healthData.status)}
                    {t(`actionActivity.status.${healthData.status.toLowerCase()}`, healthData.status)}
                </StatusBadge>
                <Flex align="center" gap={8}>
                    <EmergencyStopButton size="small" />
                    <Tooltip title={t('health.infoTooltip')}>
                        <InfoCircleOutlined style={{ color: token.colorTextTertiary, cursor: 'help' }} />
                    </Tooltip>
                </Flex>
            </Flex>

            <MetricsGrid>
                <MetricItem>
                    <MetricLabel>{t('health.totalTargets')}</MetricLabel>
                    <MetricValue $token={token}>{healthData.totalTargets.toLocaleString()}</MetricValue>
                </MetricItem>
                <MetricItem>
                    <MetricLabel>{t('health.updating')}</MetricLabel>
                    <MetricValue $token={token}>{healthData.updatingCount.toLocaleString()}</MetricValue>
                </MetricItem>
                <MetricItem>
                    <MetricLabel>{t('health.errorRate1h')}</MetricLabel>
                    <MetricValue $token={token}>{healthData.errorRate1h.toFixed(1)}%</MetricValue>
                </MetricItem>
                <MetricItem>
                    <MetricLabel>{t('health.pausedRollouts')}</MetricLabel>
                    <MetricValue $token={token}>{healthData.pausedRollouts}</MetricValue>
                </MetricItem>
            </MetricsGrid>

            {healthData.reasons.length > 0 && (
                <ReasonsList $status={healthData.status} $token={token}>
                    {healthData.reasons.map((reason, index) => (
                        <ReasonItem key={index} $token={token}>
                            <WarningFilled style={{ fontSize: token.fontSizeSM }} />
                            {reason}
                        </ReasonItem>
                    ))}
                </ReasonsList>
            )}

            {healthData.status !== 'SAFE' && (
                <ViewAnalysisButton $status={healthData.status} $token={token} onClick={(e) => {
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
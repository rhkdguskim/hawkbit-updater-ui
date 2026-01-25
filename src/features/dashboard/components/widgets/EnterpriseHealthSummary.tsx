import React, { useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Flex, Typography, Tooltip, Button, Progress } from 'antd';
import type { GlobalToken } from 'antd';
import { theme } from 'antd';
import {
    CheckCircleFilled,
    WarningFilled,
    CloseCircleFilled,
    InfoCircleOutlined,
    ArrowRightOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import EmergencyStopButton from '@/components/shared/EmergencyStopButton';
import { DASHBOARD_COLORS, TYPOGRAPHY, SPACING, SHADOWS, TRANSITIONS } from '@/theme/dashboard-design-system';

const { Text } = Typography;
const { useToken } = theme;

export type HealthStatus = 'SAFE' | 'WARNING' | 'CRITICAL';

interface HealthData {
    status: HealthStatus;
    totalTargets: number;
    updatingCount: number;
    errorRate1h: number;
    pausedRollouts: number;
    reasons: string[];
}

const pulseAnimation = keyframes`
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
    }
    50% { 
        box-shadow: 0 0 0 20px rgba(220, 38, 38, 0);
    }
`;

const shimmerAnimation = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`;

const glowAnimation = keyframes`
    0%, 100% {
        filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.4));
    }
    50% {
        filter: drop-shadow(0 0 16px rgba(220, 38, 38, 0.8));
    }
`;

const EnterpriseContainer = styled.div<{ $status: HealthStatus }>`
    position: relative;
    background: var(--ant-color-bg-container);
    border-radius: 16px;
    padding: ${SPACING[6]};
    display: flex;
    flex-direction: column;
    gap: ${SPACING[5]};
    height: 100%;
    min-height: 0;
    overflow: hidden;
    transition: ${TRANSITIONS.default};
    border: 2px solid ${props => {
        if (props.$status === 'CRITICAL') return DASHBOARD_COLORS.status.critical;
        if (props.$status === 'WARNING') return DASHBOARD_COLORS.status.warning;
        return DASHBOARD_COLORS.status.success;
    }};

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: ${props => {
            if (props.$status === 'CRITICAL') return DASHBOARD_COLORS.gradients.error;
            if (props.$status === 'WARNING') return DASHBOARD_COLORS.gradients.warning;
            return DASHBOARD_COLORS.gradients.success;
        }};
    }

    ${props => props.$status === 'CRITICAL' && css`
        animation: ${pulseAnimation} 2.5s ease-in-out infinite;
    `}

    &:hover {
        transform: translateY(-3px);
        box-shadow: ${SHADOWS.xl};
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none !important;
    }
`;

const StatusHeader = styled(Flex)`
    width: 100%;
    align-items: flex-start;
    justify-content: space-between;
`;

const StatusBadge = styled.div<{ $status: HealthStatus }>`
    display: inline-flex;
    align-items: center;
    gap: ${SPACING[2]};
    padding: ${SPACING[2]} ${SPACING[4]};
    border-radius: 24px;
    font-weight: ${TYPOGRAPHY.fontWeight.extrabold};
    font-size: ${TYPOGRAPHY.fontSize.sm};
    letter-spacing: ${TYPOGRAPHY.letterSpacing.wider};
    text-transform: uppercase;
    border: 2px solid;
    transition: ${TRANSITIONS.default};
    
    background: ${props => {
        if (props.$status === 'CRITICAL') return DASHBOARD_COLORS.status.critical;
        if (props.$status === 'WARNING') return DASHBOARD_COLORS.status.warning;
        return DASHBOARD_COLORS.status.success;
    }};
    
    color: white;
    border-color: ${props => {
        if (props.$status === 'CRITICAL') return DASHBOARD_COLORS.status.critical;
        if (props.$status === 'WARNING') return DASHBOARD_COLORS.status.warning;
        return DASHBOARD_COLORS.status.success;
    }};

    svg {
        font-size: ${TYPOGRAPHY.fontSize.lg};
    }

    ${props => props.$status === 'CRITICAL' && css`
        animation: ${glowAnimation} 2s ease-in-out infinite;
    `}
`;

const MetricsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${SPACING[5]};
    width: 100%;
`;

const MetricItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[2]};
`;

const MetricLabel = styled(Text)`
    font-size: ${TYPOGRAPHY.components.metricLabel.fontSize};
    font-weight: ${TYPOGRAPHY.components.metricLabel.fontWeight};
    color: var(--ant-color-text-tertiary);
    text-transform: ${TYPOGRAPHY.components.metricLabel.textTransform};
    letter-spacing: ${TYPOGRAPHY.components.metricLabel.letterSpacing};
    display: flex;
    align-items: center;
    gap: ${SPACING[1]};
`;

const MetricValue = styled.div`
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    font-size: ${TYPOGRAPHY.fontSize['3xl']};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
    color: var(--ant-color-text);
    line-height: 1.1;
    letter-spacing: ${TYPOGRAPHY.letterSpacing.tight};
`;

const MetricSubtext = styled(Text)`
    font-size: ${TYPOGRAPHY.fontSize.xs};
    color: var(--ant-color-text-secondary);
    margin-top: ${SPACING[1]};
`;

const ReasonsPanel = styled.div<{ $status: HealthStatus }>`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[2]};
    padding: ${SPACING[4]};
    background: ${props => {
        if (props.$status === 'CRITICAL') return 'rgba(220, 38, 38, 0.08)';
        if (props.$status === 'WARNING') return 'rgba(245, 158, 11, 0.08)';
        return 'rgba(16, 185, 129, 0.08)';
    }};
    border-left: 4px solid ${props => {
        if (props.$status === 'CRITICAL') return DASHBOARD_COLORS.status.critical;
        if (props.$status === 'WARNING') return DASHBOARD_COLORS.status.warning;
        return DASHBOARD_COLORS.status.success;
    }};
    border-radius: 8px;
    margin-top: auto;
`;

const ReasonItem = styled.div<{ $severity: 'error' | 'warning' | 'info' }>`
    display: flex;
    align-items: flex-start;
    gap: ${SPACING[2]};
    font-size: ${TYPOGRAPHY.fontSize.sm};
    color: ${props => {
        if (props.$severity === 'error') return DASHBOARD_COLORS.status.critical;
        if (props.$severity === 'warning') return DASHBOARD_COLORS.status.warning;
        return 'var(--ant-color-text-secondary)';
    }};
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
    line-height: 1.5;

    svg {
        flex-shrink: 0;
        margin-top: 2px;
        font-size: ${TYPOGRAPHY.fontSize.base};
    }
`;

const ActionCTA = styled(Button)<{ $status: HealthStatus }>`
    margin-top: auto;
    width: 100%;
    height: 44px;
    border-radius: 10px;
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    font-size: ${TYPOGRAPHY.fontSize.base};
    text-transform: uppercase;
    letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
    transition: ${TRANSITIONS.default};
    border: 2px solid;

    ${props => {
        if (props.$status === 'CRITICAL') {
            return css`
                background: ${DASHBOARD_COLORS.status.critical};
                border-color: ${DASHBOARD_COLORS.status.critical};
                color: white;

                &:hover {
                    background: ${DASHBOARD_COLORS.status.critical} !important;
                    border-color: ${DASHBOARD_COLORS.status.critical} !important;
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                    box-shadow: ${SHADOWS.lg};
                }
            `;
        }
        if (props.$status === 'WARNING') {
            return css`
                background: ${DASHBOARD_COLORS.status.warning};
                border-color: ${DASHBOARD_COLORS.status.warning};
                color: white;

                &:hover {
                    background: ${DASHBOARD_COLORS.status.warning} !important;
                    border-color: ${DASHBOARD_COLORS.status.warning} !important;
                    filter: brightness(1.1);
                    transform: translateY(-2px);
                    box-shadow: ${SHADOWS.md};
                }
            `;
        }
        return css`
            background: transparent;
            border-color: ${DASHBOARD_COLORS.status.success};
            color: ${DASHBOARD_COLORS.status.success};

            &:hover {
                background: ${DASHBOARD_COLORS.status.success} !important;
                border-color: ${DASHBOARD_COLORS.status.success} !important;
                color: white !important;
                transform: translateY(-2px);
                box-shadow: ${SHADOWS.md};
            }
        `;
    }}

    &:focus-visible {
        outline: 3px solid var(--ant-color-primary);
        outline-offset: 3px;
        box-shadow: 0 0 0 4px var(--ant-color-primary-bg);
    }
`;

const ErrorRateIndicator = styled.div<{ $rate: number }>`
    width: 100%;
    height: 8px;
    background: var(--ant-color-border-secondary);
    border-radius: 4px;
    overflow: hidden;
    margin-top: ${SPACING[2]};

    &::after {
        content: '';
        display: block;
        height: 100%;
        width: ${props => Math.min(props.$rate, 100)}%;
        background: ${props => {
            if (props.$rate > 5) return DASHBOARD_COLORS.status.critical;
            if (props.$rate > 2) return DASHBOARD_COLORS.status.warning;
            return DASHBOARD_COLORS.status.success;
        }};
        transition: width 0.5s ease;
    }
`;

interface EnterpriseHealthSummaryProps {
    isLoading: boolean;
    totalTargets: number;
    updatingCount: number;
    pausedRollouts: number;
    errorRollouts: number;
    errorActions1h: number;
    onAnalysisClick?: () => void;
}

export const EnterpriseHealthSummary: React.FC<EnterpriseHealthSummaryProps> = ({
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

    const getStatusLabel = (status: HealthStatus) => {
        switch (status) {
            case 'SAFE':
                return t('actionActivity.status.normal', 'System Healthy');
            case 'WARNING':
                return t('actionActivity.status.warning', 'Attention Required');
            case 'CRITICAL':
                return t('actionActivity.status.critical', 'Critical Issues');
        }
    };

    if (isLoading) {
        return (
            <EnterpriseContainer $status="SAFE">
                <StatusHeader>
                    <StatusBadge $status="SAFE">
                        <ThunderboltOutlined spin />
                        <span>{t('health.loadingText')}</span>
                    </StatusBadge>
                </StatusHeader>
                <MetricsGrid>
                    {[1, 2, 3, 4].map(i => (
                        <MetricItem key={i}>
                            <MetricLabel>···</MetricLabel>
                            <MetricValue>—</MetricValue>
                        </MetricItem>
                    ))}
                </MetricsGrid>
            </EnterpriseContainer>
        );
    }

    const isClickable = healthData.status !== 'SAFE' && !!onAnalysisClick;

    return (
        <EnterpriseContainer
            $status={healthData.status}
            onClick={isClickable ? onAnalysisClick : undefined}
            role={isClickable ? 'button' : 'region'}
            tabIndex={isClickable ? 0 : -1}
            aria-label="System health summary"
            aria-pressed={isClickable ? 'false' : undefined}
            onKeyDown={(e) => {
                if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onAnalysisClick?.();
                }
            }}
        >
            <StatusHeader>
                <StatusBadge $status={healthData.status} role="status" aria-live="polite">
                    {getStatusIcon(healthData.status)}
                    <span>{getStatusLabel(healthData.status)}</span>
                </StatusBadge>
                <Flex align="center" gap={8}>
                    <EmergencyStopButton size="small" />
                    <Tooltip title={t('health.infoTooltip')}>
                        <InfoCircleOutlined 
                            style={{ 
                                color: 'var(--ant-color-text-tertiary)', 
                                cursor: 'help',
                                fontSize: TYPOGRAPHY.fontSize.lg,
                            }} 
                        />
                    </Tooltip>
                </Flex>
            </StatusHeader>

            <MetricsGrid>
                <MetricItem>
                    <MetricLabel>
                        {t('health.totalTargets')}
                        <Tooltip title={t('health.totalTargets')}>
                            <InfoCircleOutlined style={{ fontSize: '10px' }} />
                        </Tooltip>
                    </MetricLabel>
                    <MetricValue>{healthData.totalTargets.toLocaleString()}</MetricValue>
                    <MetricSubtext>{t('health.registeredDevices')}</MetricSubtext>
                </MetricItem>

                <MetricItem>
                    <MetricLabel>
                        {t('health.updating')}
                        <Tooltip title={t('health.updatingTooltip')}>
                            <InfoCircleOutlined style={{ fontSize: '10px' }} />
                        </Tooltip>
                    </MetricLabel>
                    <MetricValue style={{ color: DASHBOARD_COLORS.status.info }}>
                        {healthData.updatingCount.toLocaleString()}
                    </MetricValue>
                    <Progress 
                        percent={totalTargets > 0 ? (updatingCount / totalTargets) * 100 : 0} 
                        showInfo={false}
                        strokeColor={DASHBOARD_COLORS.status.info}
                        size="small"
                    />
                </MetricItem>

                <MetricItem>
                    <MetricLabel>
                        {t('health.errorRate1h')}
                        <Tooltip title={t('health.errorRateTooltip')}>
                            <InfoCircleOutlined style={{ fontSize: '10px' }} />
                        </Tooltip>
                    </MetricLabel>
                    <MetricValue 
                        style={{ 
                            color: healthData.errorRate1h > 5 
                                ? DASHBOARD_COLORS.status.critical 
                                : healthData.errorRate1h > 2 
                                    ? DASHBOARD_COLORS.status.warning 
                                    : DASHBOARD_COLORS.status.success 
                        }}
                    >
                        {healthData.errorRate1h.toFixed(1)}%
                    </MetricValue>
                    <ErrorRateIndicator $rate={healthData.errorRate1h} />
                </MetricItem>

                <MetricItem>
                    <MetricLabel>
                        {t('health.pausedRollouts')}
                        <Tooltip title={t('health.pausedRolloutsTooltip')}>
                            <InfoCircleOutlined style={{ fontSize: '10px' }} />
                        </Tooltip>
                    </MetricLabel>
                    <MetricValue style={{ color: pausedRollouts > 0 ? DASHBOARD_COLORS.status.warning : 'var(--ant-color-text)' }}>
                        {healthData.pausedRollouts}
                    </MetricValue>
                    <MetricSubtext>
                        {pausedRollouts > 0 ? t('kpi.requiresAttention') : t('kpi.allClear')}
                    </MetricSubtext>
                </MetricItem>
            </MetricsGrid>

            {healthData.reasons.length > 0 && (
                <ReasonsPanel $status={healthData.status}>
                    {healthData.reasons.map((reason, index) => (
                        <ReasonItem 
                            key={index} 
                            $severity={healthData.status === 'CRITICAL' ? 'error' : 'warning'}
                        >
                            <WarningFilled />
                            <span>{reason}</span>
                        </ReasonItem>
                    ))}
                </ReasonsPanel>
            )}

            {healthData.status !== 'SAFE' && onAnalysisClick && (
                <ActionCTA 
                    $status={healthData.status}
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    iconPosition="end"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAnalysisClick();
                    }}
                >
                    {t('health.viewAnalysis', 'Analyze Issues')}
                </ActionCTA>
            )}
        </EnterpriseContainer>
    );
};

export default EnterpriseHealthSummary;

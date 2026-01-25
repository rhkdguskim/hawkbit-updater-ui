import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Flex, Typography, Skeleton, Tooltip, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
    HeartOutlined, 
    ArrowUpOutlined, 
    ArrowDownOutlined,
    MinusOutlined,
    InfoCircleOutlined,
    ThunderboltFilled,
    CheckCircleFilled,
    WarningFilled,
} from '@ant-design/icons';
import { DASHBOARD_COLORS, TYPOGRAPHY, SPACING, SHADOWS, TRANSITIONS, MEDIA_QUERIES } from '@/theme/dashboard-design-system';

const { Text } = Typography;

const shimmerAnimation = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`;

const EnterpriseCard = styled.div`
    position: relative;
    background: var(--ant-color-bg-container);
    border-radius: 16px;
    padding: ${SPACING[6]};
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: ${SPACING[5]};
    border: 1px solid var(--ant-color-border);
    box-shadow: ${SHADOWS.base};
    transition: ${TRANSITIONS.default};
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${DASHBOARD_COLORS.gradients.info};
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${SHADOWS.lg};
        border-color: var(--ant-color-primary-border);
    }

    ${MEDIA_QUERIES.maxMd} {
        padding: ${SPACING[4]};
        gap: ${SPACING[4]};
    }
`;

const CardHeader = styled(Flex)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding-bottom: ${SPACING[3]};
    border-bottom: 1px solid var(--ant-color-border-secondary);
`;

const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: ${SPACING[2]};
`;

const IconBadge = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
    border: 1px solid rgba(59, 130, 246, 0.2);
    
    svg {
        font-size: ${TYPOGRAPHY.fontSize.xl};
        background: ${DASHBOARD_COLORS.gradients.info};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

const TitleText = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[1]};
`;

const Title = styled.span`
    font-size: ${TYPOGRAPHY.fontSize.base};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    color: var(--ant-color-text);
`;

const Subtitle = styled(Text)`
    font-size: ${TYPOGRAPHY.fontSize.xs};
    color: var(--ant-color-text-secondary);
`;

const StatusBadge = styled.div<{ $status: 'healthy' | 'warning' | 'critical' }>`
    padding: ${SPACING[1]} ${SPACING[3]};
    border-radius: 12px;
    font-size: ${TYPOGRAPHY.fontSize.xs};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    text-transform: uppercase;
    letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
    display: flex;
    align-items: center;
    gap: ${SPACING[1]};

    ${props => {
        switch (props.$status) {
            case 'healthy':
                return `
                    background: rgba(16, 185, 129, 0.1);
                    color: ${DASHBOARD_COLORS.status.success};
                    border: 1px solid ${DASHBOARD_COLORS.status.success};
                `;
            case 'warning':
                return `
                    background: rgba(245, 158, 11, 0.1);
                    color: ${DASHBOARD_COLORS.status.warning};
                    border: 1px solid ${DASHBOARD_COLORS.status.warning};
                `;
            case 'critical':
                return `
                    background: rgba(220, 38, 38, 0.1);
                    color: ${DASHBOARD_COLORS.status.critical};
                    border: 1px solid ${DASHBOARD_COLORS.status.critical};
                `;
        }
    }}
`;

const MetricsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[4]};
    flex: 1;
`;

const MetricRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[2]};
`;

const MetricHeader = styled(Flex)`
    width: 100%;
    align-items: center;
    justify-content: space-between;
`;

const MetricLabel = styled.div`
    display: flex;
    align-items: center;
    gap: ${SPACING[1]};
    font-size: ${TYPOGRAPHY.fontSize.sm};
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
    color: var(--ant-color-text-secondary);
`;

const MetricValue = styled.div<{ $color?: string }>`
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    font-size: ${TYPOGRAPHY.fontSize['2xl']};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
    line-height: 1;
    color: ${props => props.$color || 'var(--ant-color-text)'};
    display: flex;
    align-items: center;
    gap: ${SPACING[2]};
`;

const TrendIndicator = styled.div<{ $trend: 'up' | 'down' | 'stable' }>`
    display: inline-flex;
    align-items: center;
    gap: ${SPACING[1]};
    padding: ${SPACING[1]} ${SPACING[2]};
    border-radius: 6px;
    font-size: ${TYPOGRAPHY.fontSize.xs};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    
    ${props => {
        switch (props.$trend) {
            case 'up':
                return `
                    background: rgba(16, 185, 129, 0.1);
                    color: ${DASHBOARD_COLORS.status.success};
                `;
            case 'down':
                return `
                    background: rgba(220, 38, 38, 0.1);
                    color: ${DASHBOARD_COLORS.status.critical};
                `;
            case 'stable':
                return `
                    background: rgba(107, 114, 128, 0.1);
                    color: ${DASHBOARD_COLORS.status.neutral};
                `;
        }
    }}

    svg {
        font-size: ${TYPOGRAPHY.fontSize.sm};
    }
`;

const EnhancedProgressBar = styled.div`
    width: 100%;
    height: 10px;
    background: var(--ant-color-border-secondary);
    border-radius: 5px;
    overflow: hidden;
    position: relative;
`;

const ProgressFill = styled.div<{ $percent: number; $color: string }>`
    height: 100%;
    width: ${props => props.$percent}%;
    background: ${props => props.$color};
    border-radius: 5px;
    position: relative;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
        );
        animation: ${shimmerAnimation} 2s infinite;
    }
`;

const ProgressLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${SPACING[1]};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    color: var(--ant-color-text-tertiary);
`;

const SummaryFooter = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${SPACING[3]};
    padding-top: ${SPACING[3]};
    border-top: 1px solid var(--ant-color-border-secondary);

    ${MEDIA_QUERIES.maxMd} {
        grid-template-columns: 1fr;
        gap: ${SPACING[2]};
    }
`;

const FooterItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const FooterLabel = styled(Text)`
    color: var(--ant-color-text-tertiary);
`;

const FooterValue = styled.span<{ $highlight?: boolean }>`
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    color: ${props => props.$highlight ? DASHBOARD_COLORS.status.info : 'var(--ant-color-text)'};
`;

interface EnterpriseKPIHealthSummaryProps {
    isLoading: boolean;
    onlineRate: number | null;
    deploymentRate: number | null;
    errorRate: number | null;
    pendingCount: number;
    runningRolloutCount: number;
    securityCoverage?: number | null;
}

export const EnterpriseKPIHealthSummary: React.FC<EnterpriseKPIHealthSummaryProps> = ({
    isLoading,
    onlineRate,
    deploymentRate,
    errorRate,
    pendingCount,
    runningRolloutCount,
    securityCoverage,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const overallStatus = useMemo<'healthy' | 'warning' | 'critical'>(() => {
        if (isLoading || onlineRate === null || errorRate === null) return 'healthy';
        
        if (errorRate > 5 || onlineRate < 70) return 'critical';
        if (errorRate > 2 || onlineRate < 85 || pendingCount > 50) return 'warning';
        return 'healthy';
    }, [isLoading, onlineRate, errorRate, pendingCount]);

    const getTrendIndicator = (value: number | null, threshold: { good: number; bad: number }): 'up' | 'down' | 'stable' => {
        if (value === null) return 'stable';
        if (value >= threshold.good) return 'up';
        if (value <= threshold.bad) return 'down';
        return 'stable';
    };

    const getProgressColor = (value: number | null, isErrorMetric: boolean = false): string => {
        if (value === null) return DASHBOARD_COLORS.status.neutral;
        
        if (isErrorMetric) {
            if (value > 5) return DASHBOARD_COLORS.status.critical;
            if (value > 2) return DASHBOARD_COLORS.status.warning;
            return DASHBOARD_COLORS.status.success;
        } else {
            if (value >= 90) return DASHBOARD_COLORS.status.success;
            if (value >= 70) return DASHBOARD_COLORS.status.warning;
            return DASHBOARD_COLORS.status.critical;
        }
    };

    const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <ArrowUpOutlined />;
            case 'down':
                return <ArrowDownOutlined />;
            case 'stable':
                return <MinusOutlined />;
        }
    };

    const renderStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
        switch (status) {
            case 'healthy':
                return <CheckCircleFilled />;
            case 'warning':
                return <WarningFilled />;
            case 'critical':
                return <ThunderboltFilled />;
        }
    };

    if (isLoading) {
        return (
            <EnterpriseCard>
                <Skeleton active paragraph={{ rows: 4 }} />
            </EnterpriseCard>
        );
    }

    return (
        <EnterpriseCard>
            <CardHeader>
                <HeaderTitle>
                    <IconBadge>
                        <HeartOutlined />
                    </IconBadge>
                    <TitleText>
                        <Title>{t('snapshot.title', 'System Health')}</Title>
                        <Subtitle>{t('snapshot.subtitle', 'Key performance indicators')}</Subtitle>
                    </TitleText>
                </HeaderTitle>
                <StatusBadge $status={overallStatus}>
                    {renderStatusIcon(overallStatus)}
                    <span>
                        {overallStatus === 'healthy' && t('snapshot.stable', 'Healthy')}
                        {overallStatus === 'warning' && t('snapshot.attention', 'Warning')}
                        {overallStatus === 'critical' && 'Critical'}
                    </span>
                </StatusBadge>
            </CardHeader>

            <MetricsContainer>
                <MetricRow>
                    <MetricHeader>
                        <MetricLabel>
                            {t('snapshot.onlineRate', 'Device Availability')}
                            <Tooltip title="Percentage of devices currently online and responsive">
                                <InfoCircleOutlined style={{ fontSize: '12px', cursor: 'help' }} />
                            </Tooltip>
                        </MetricLabel>
                        <TrendIndicator $trend={getTrendIndicator(onlineRate, { good: 90, bad: 70 })}>
                            {renderTrendIcon(getTrendIndicator(onlineRate, { good: 90, bad: 70 }))}
                            {onlineRate !== null ? `${onlineRate.toFixed(1)}%` : 'N/A'}
                        </TrendIndicator>
                    </MetricHeader>
                    <EnhancedProgressBar>
                        <ProgressFill 
                            $percent={onlineRate ?? 0} 
                            $color={getProgressColor(onlineRate)}
                        />
                    </EnhancedProgressBar>
                    <ProgressLabel>
                        <span>
                            {onlineRate && onlineRate >= 90 ? t('kpi.excellent') : 
                             onlineRate && onlineRate >= 70 ? t('kpi.good') : t('kpi.poor')}
                        </span>
                        <span>{t('kpi.target')}: 90%</span>
                    </ProgressLabel>
                </MetricRow>

                <MetricRow>
                    <MetricHeader>
                        <MetricLabel>
                            {t('snapshot.deploymentRate', 'Deployment Progress')}
                            <Tooltip title="Percentage of targets with completed deployments">
                                <InfoCircleOutlined style={{ fontSize: '12px', cursor: 'help' }} />
                            </Tooltip>
                        </MetricLabel>
                        <TrendIndicator $trend={getTrendIndicator(deploymentRate, { good: 80, bad: 50 })}>
                            {renderTrendIcon(getTrendIndicator(deploymentRate, { good: 80, bad: 50 }))}
                            {deploymentRate !== null ? `${deploymentRate.toFixed(1)}%` : 'N/A'}
                        </TrendIndicator>
                    </MetricHeader>
                    <EnhancedProgressBar>
                        <ProgressFill 
                            $percent={deploymentRate ?? 0} 
                            $color={getProgressColor(deploymentRate)}
                        />
                    </EnhancedProgressBar>
                    <ProgressLabel>
                        <span>
                            {deploymentRate && deploymentRate >= 80 ? t('kpi.onTrack') : 
                             deploymentRate && deploymentRate >= 50 ? t('kpi.inProgressStatus') : t('kpi.behind')}
                        </span>
                        <span>{t('kpi.target')}: 80%</span>
                    </ProgressLabel>
                </MetricRow>

                <MetricRow>
                    <MetricHeader>
                        <MetricLabel>
                            {t('snapshot.errorRate', 'Error Rate (1h)')}
                            <Tooltip title="Percentage of actions that failed in the last hour">
                                <InfoCircleOutlined style={{ fontSize: '12px', cursor: 'help' }} />
                            </Tooltip>
                        </MetricLabel>
                        <TrendIndicator $trend={errorRate !== null && errorRate > 2 ? 'down' : 'up'}>
                            {errorRate !== null && errorRate > 2 ? <ArrowUpOutlined /> : <CheckCircleFilled />}
                            {errorRate !== null ? `${errorRate.toFixed(1)}%` : 'N/A'}
                        </TrendIndicator>
                    </MetricHeader>
                    <EnhancedProgressBar>
                        <ProgressFill 
                            $percent={Math.min(errorRate ?? 0, 100)} 
                            $color={getProgressColor(errorRate, true)}
                        />
                    </EnhancedProgressBar>
                    <ProgressLabel>
                        <span>
                            {errorRate && errorRate <= 2 ? t('kpi.excellent') : 
                             errorRate && errorRate <= 5 ? t('kpi.acceptable') : t('kpi.highStatus')}
                        </span>
                        <span>{t('kpi.target')}: &lt;2%</span>
                    </ProgressLabel>
                </MetricRow>

                {securityCoverage !== undefined && securityCoverage !== null && (
                    <MetricRow>
                        <MetricHeader>
                            <MetricLabel>
                                {t('snapshot.securityCoverage', 'Security Coverage')}
                                <Tooltip title="Percentage of devices with security tokens enabled">
                                    <InfoCircleOutlined style={{ fontSize: '12px', cursor: 'help' }} />
                                </Tooltip>
                            </MetricLabel>
                            <TrendIndicator $trend={getTrendIndicator(securityCoverage, { good: 90, bad: 70 })}>
                                {renderTrendIcon(getTrendIndicator(securityCoverage, { good: 90, bad: 70 }))}
                                {securityCoverage.toFixed(1)}%
                            </TrendIndicator>
                        </MetricHeader>
                        <EnhancedProgressBar>
                            <ProgressFill 
                                $percent={securityCoverage} 
                                $color={getProgressColor(securityCoverage)}
                            />
                        </EnhancedProgressBar>
                        <ProgressLabel>
                            <span>
                                {securityCoverage >= 90 ? t('kpi.secure') : 
                                 securityCoverage >= 70 ? t('kpi.moderate') : t('kpi.atRisk')}
                            </span>
                            <span>{t('kpi.target')}: 90%</span>
                        </ProgressLabel>
                    </MetricRow>
                )}
            </MetricsContainer>

            <SummaryFooter>
                <FooterItem>
                    <FooterLabel>{t('snapshot.pendingActions', 'Pending')}</FooterLabel>
                    <FooterValue $highlight={pendingCount > 50}>{pendingCount}</FooterValue>
                </FooterItem>
                <FooterItem>
                    <FooterLabel>{t('snapshot.activeRollouts', 'Active')}</FooterLabel>
                    <FooterValue $highlight={runningRolloutCount > 0}>{runningRolloutCount}</FooterValue>
                </FooterItem>
            </SummaryFooter>
        </EnterpriseCard>
    );
};

export default EnterpriseKPIHealthSummary;

import React, { useMemo } from 'react';
import { Flex, Typography, Skeleton, Tag, Tooltip } from 'antd';
import {
    ThunderboltOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { MgmtAction } from '@/api/generated/model';
import {
    WidgetContainer,
    HeaderRow,
    IconBadge,
    MetricCard,
    MetricLabel,
    MetricValue,
    ThresholdText,
    BottleneckBanner,
    BottleneckHeader,
    BottleneckDesc
} from './WidgetStyles';

const { Text, Title } = Typography;

interface ActionActivityMetrics {
    waitingActions: number;
    avgCompletionTimeMin: number;
    isBottleneck: boolean;
    runningActionsTotal: number;
    completedRecently: number;
}

interface ActionActivityWidgetProps {
    isLoading: boolean;
    runningActions: MgmtAction[];
    recentFinishedActions: MgmtAction[];
    waitingThreshold?: number;
    completionTimeThreshold?: number;
}

export const ActionActivityWidget: React.FC<ActionActivityWidgetProps> = ({
    isLoading,
    runningActions,
    recentFinishedActions,
    waitingThreshold = 30,
    completionTimeThreshold = 15,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const metrics = useMemo<ActionActivityMetrics>(() => {
        // Calculate average completion time from finished actions
        const completionTimes = recentFinishedActions
            .filter(a => a.createdAt && a.lastModifiedAt)
            .map(a => (a.lastModifiedAt! - a.createdAt!));

        const avgCompletionMs = completionTimes.length > 0
            ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
            : 0;
        const avgCompletionTimeMin = Math.round(avgCompletionMs / 60000);

        const waitingActions = runningActions.length;
        const isBottleneck = waitingActions > waitingThreshold || avgCompletionTimeMin > completionTimeThreshold;

        return {
            waitingActions,
            avgCompletionTimeMin,
            isBottleneck,
            runningActionsTotal: runningActions.length,
            completedRecently: recentFinishedActions.length,
        };
    }, [runningActions, recentFinishedActions, waitingThreshold, completionTimeThreshold]);

    const getWaitingStatus = (): 'normal' | 'warning' | 'critical' => {
        if (metrics.waitingActions > waitingThreshold * 1.5) return 'critical';
        if (metrics.waitingActions > waitingThreshold) return 'warning';
        return 'normal';
    };

    const getCompletionTimeStatus = (): 'normal' | 'warning' | 'critical' => {
        if (metrics.avgCompletionTimeMin > completionTimeThreshold * 1.5) return 'critical';
        if (metrics.avgCompletionTimeMin > completionTimeThreshold) return 'warning';
        return 'normal';
    };

    const overallStatus = metrics.isBottleneck
        ? (getWaitingStatus() === 'critical' || getCompletionTimeStatus() === 'critical' ? 'critical' : 'warning')
        : 'normal';

    const getStatusTag = () => {
        if (overallStatus === 'critical') {
            return <Tag color="error" icon={<WarningOutlined />}>{t('actionActivity.status.critical', 'Critical')}</Tag>;
        }
        if (overallStatus === 'warning') {
            return <Tag color="warning" icon={<WarningOutlined />}>{t('actionActivity.status.warning', 'Warning')}</Tag>;
        }
        return <Tag color="success" icon={<CheckCircleOutlined />}>{t('actionActivity.status.normal', 'Normal')}</Tag>;
    };

    if (isLoading) {
        return (
            <WidgetContainer>
                <Skeleton active paragraph={{ rows: 4 }} />
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer>
            <HeaderRow align="center" justify="space-between">
                <Flex align="center" gap={12}>
                    <IconBadge $status={overallStatus}>
                        <ThunderboltOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <Title level={5} style={{ margin: 0 }}>
                            {t('actionActivity.title', 'Action Activity')}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('actionActivity.subtitle', 'System load and bottleneck detection')}
                        </Text>
                    </Flex>
                </Flex>
                {getStatusTag()}
            </HeaderRow>

            <Flex gap={16}>
                <MetricCard>
                    <MetricLabel>{t('actionActivity.waitingActions', 'Waiting Actions')}</MetricLabel>
                    <Tooltip title={t('actionActivity.waitingActionsTooltip', 'Number of actions currently running/pending')}>
                        <MetricValue $status={getWaitingStatus()}>
                            {metrics.waitingActions}
                            {getWaitingStatus() !== 'normal' && <WarningOutlined style={{ fontSize: 16 }} />}
                        </MetricValue>
                    </Tooltip>
                    <ThresholdText>
                        {t('actionActivity.threshold', 'Threshold')}: {waitingThreshold}
                    </ThresholdText>
                </MetricCard>

                <MetricCard>
                    <MetricLabel>{t('actionActivity.avgCompletionTime', 'Avg. Completion Time')}</MetricLabel>
                    <Tooltip title={t('actionActivity.avgCompletionTimeTooltip', 'Average time to complete an action')}>
                        <MetricValue $status={getCompletionTimeStatus()}>
                            <ClockCircleOutlined style={{ fontSize: 16, opacity: 0.7 }} />
                            {metrics.avgCompletionTimeMin > 0 ? `${metrics.avgCompletionTimeMin}m` : '-'}
                        </MetricValue>
                    </Tooltip>
                    <ThresholdText>
                        {t('actionActivity.normalRange', 'Normal')}: {'<'} {completionTimeThreshold}m
                    </ThresholdText>
                </MetricCard>
            </Flex>

            {metrics.isBottleneck && (
                <BottleneckBanner $status={overallStatus === 'critical' ? 'critical' : 'warning'}>
                    <BottleneckHeader align="center" gap={8} color={overallStatus === 'critical' ? 'var(--ant-color-error)' : 'var(--ant-color-warning)'}>
                        <WarningOutlined />
                        <span>{t('actionActivity.bottleneckDetected', 'Bottleneck Detected')}</span>
                    </BottleneckHeader>
                    <BottleneckDesc>
                        {t('actionActivity.bottleneckDesc', 'System load is higher than recommended thresholds. Consider pausing new rollouts or investigating slow actions.')}
                    </BottleneckDesc>
                </BottleneckBanner>
            )}
        </WidgetContainer>
    );
};

export default ActionActivityWidget;

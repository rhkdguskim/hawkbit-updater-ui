import React from 'react';
import { HourglassOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DonutChartCard } from './DonutChartCard';

interface RolloutQueueChartProps {
    isLoading: boolean;
    pendingApprovalCount: number;
    pausedCount: number;
    scheduledReadyCount: number;
}

export const RolloutQueueChart: React.FC<RolloutQueueChartProps> = ({
    isLoading,
    pendingApprovalCount,
    pausedCount,
    scheduledReadyCount,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const data = [
        { name: t('chart.waitingApproval', 'Waiting approval'), value: pendingApprovalCount, color: 'var(--ant-color-warning)' },
        { name: t('chart.paused', 'Paused'), value: pausedCount, color: 'var(--ant-color-warning-active)' },
        { name: t('chart.scheduledReady', 'Scheduled/Ready'), value: scheduledReadyCount, color: 'var(--ant-color-info)' },
    ].filter(item => item.value > 0);
    const total = pendingApprovalCount + pausedCount + scheduledReadyCount;

    return (
        <DonutChartCard
            isLoading={isLoading}
            data={data}
            theme="rollouts"
            icon={<HourglassOutlined />}
            title={t('chart.rolloutQueue', 'Rollout Queue')}
            subtitle={t('chart.totalRollouts', { count: total })}
            emptyText={t('common:messages.noData')}
            delay={11}
            paddingAngle={3}
        />
    );
};

export default RolloutQueueChart;

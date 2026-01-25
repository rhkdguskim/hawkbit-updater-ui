import React, { useMemo } from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DonutChartCard } from './DonutChartCard';

interface RolloutStatusChartProps {
    isLoading: boolean;
    activeRolloutCount: number;
    finishedRolloutCount: number;
    errorRolloutCount: number;
}

export const RolloutStatusChart: React.FC<RolloutStatusChartProps> = ({
    isLoading,
    activeRolloutCount,
    finishedRolloutCount,
    errorRolloutCount
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const total = activeRolloutCount + finishedRolloutCount + errorRolloutCount;

    const rolloutStatusData = useMemo(() => [
        { name: t('common:status.running'), value: activeRolloutCount, color: 'var(--ant-color-primary)' },
        { name: t('common:status.finished'), value: finishedRolloutCount, color: 'var(--ant-color-success)' },
        { name: t('common:status.error'), value: errorRolloutCount, color: 'var(--ant-color-error)' },
    ].filter(d => d.value > 0), [activeRolloutCount, finishedRolloutCount, errorRolloutCount, t]);



    return (
        <DonutChartCard
            isLoading={isLoading}
            data={rolloutStatusData}
            theme="rollouts"
            icon={<PlayCircleOutlined />}
            title={t('chart.rolloutStatus')}
            subtitle={t('chart.totalRollouts', { count: total })}
            emptyText={t('common:messages.noData')}
            delay={7}
            showShadow
        />
    );
};

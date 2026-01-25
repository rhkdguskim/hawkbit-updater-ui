import React, { useMemo } from 'react';
import { AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DonutChartCard } from './DonutChartCard';

interface FragmentationChartProps {
    isLoading: boolean;
    stats: {
        inSync: number;
        pending: number;
        unknown: number;
        error: number;
        registered: number;
    };
}

export const FragmentationChart: React.FC<FragmentationChartProps> = ({ isLoading, stats }) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const total = stats.inSync + stats.pending + stats.unknown + stats.error + stats.registered;

    const data = useMemo(() => [
        { name: t('common:status.in_sync', 'In Sync'), value: stats.inSync, color: 'var(--ant-color-success)' },
        { name: t('common:status.pending', 'Pending'), value: stats.pending, color: 'var(--ant-color-warning)' },
        { name: t('common:status.registered', 'Registered'), value: stats.registered, color: '#6366f1' },
        { name: t('common:status.unknown', 'Unknown'), value: stats.unknown, color: '#94a3b8' },
        { name: t('common:status.error', 'Error'), value: stats.error, color: 'var(--ant-color-error)' },
    ].filter(d => d.value > 0), [stats, t]);



    return (
        <DonutChartCard
            isLoading={isLoading}
            data={data}
            theme="fragmentation"
            icon={<AppstoreOutlined />}
            title={t('chart.fragmentation')}
            subtitle={`${total} ${t('kpi.devices')}`}
            emptyText={t('common:messages.noData')}
            delay={6}
            showShadow
            legendLimit={4}
            legendGap={3}
            legendItemStyle={{ padding: '4px 8px' }}
            legendDotStyle={{ width: 8, height: 8, borderRadius: 2 }}
            legendTextStyle={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
        />
    );
};

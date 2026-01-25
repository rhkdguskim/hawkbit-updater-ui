import React from 'react';
import { TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DonutChartCard } from './DonutChartCard';

interface TargetTypeCoverageChartProps {
    isLoading: boolean;
    data: { name: string; value: number; color: string }[];
}

export const TargetTypeCoverageChart: React.FC<TargetTypeCoverageChartProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <DonutChartCard
            isLoading={isLoading}
            data={data}
            theme="targets"
            icon={<TagsOutlined />}
            title={t('chart.targetTypeCoverage', 'Target Type Coverage')}
            subtitle={t('chart.totalTargets', { count: total })}
            emptyText={t('common:messages.noData')}
            delay={9}
            paddingAngle={3}
            legendLimit={4}
        />
    );
};

export default TargetTypeCoverageChart;

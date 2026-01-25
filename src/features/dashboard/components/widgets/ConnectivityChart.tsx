import React, { useMemo } from 'react';
import { ApiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { COLORS } from '@/components/patterns/DashboardStyles';
import { DonutChartCard } from './DonutChartCard';

interface ConnectivityChartProps {
    isLoading: boolean;
    onlineCount: number;
    offlineCount: number;
}

export const ConnectivityChart: React.FC<ConnectivityChartProps> = ({ isLoading, onlineCount, offlineCount }) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const total = onlineCount + offlineCount;
    const onlinePercent = total > 0 ? Math.round((onlineCount / total) * 100) : 0;

    const connectivityPieData = useMemo(() => [
        { name: t('chart.online'), value: onlineCount, color: COLORS.online },
        { name: t('chart.offline'), value: offlineCount, color: COLORS.offline },
    ].filter(d => d.value > 0), [onlineCount, offlineCount, t]);



    return (
        <DonutChartCard
            isLoading={isLoading}
            data={connectivityPieData}
            theme="connectivity"
            icon={<ApiOutlined />}
            title={t('chart.connectivityStatus')}
            subtitle={t('overview.percentOnline', { percent: onlinePercent })}
            emptyText={t('common:messages.noData')}
            delay={5}
            showShadow
        />
    );
};

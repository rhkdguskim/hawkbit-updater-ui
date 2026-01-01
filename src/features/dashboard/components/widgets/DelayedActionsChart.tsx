import React from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

interface DelayedActionsChartProps {
    isLoading: boolean;
    delayedCount: number;
    activeCount: number;
}

export const DelayedActionsChart: React.FC<DelayedActionsChartProps> = ({
    isLoading,
    delayedCount,
    activeCount,
}) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const onTimeCount = Math.max(activeCount - delayedCount, 0);
    const data = [
        { name: t('chart.delayed', 'Delayed'), value: delayedCount },
        { name: t('chart.onTime', 'On time'), value: onTimeCount },
    ];

    return (
        <ChartCard
            $theme="actions"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="actions">
                        <ClockCircleOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.delayedActions', 'Delayed Actions')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{t('chart.activeActions', { count: activeCount })}</Text>
                    </Flex>
                </Flex>
            }
            $delay={10}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                background: 'rgba(255,255,255,0.95)'
                            }}
                        />
                        <Bar dataKey="value" fill="var(--ant-color-warning)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </ChartCard>
    );
};

export default DelayedActionsChart;

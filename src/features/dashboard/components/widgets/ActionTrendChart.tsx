import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
} from 'recharts';
import { Flex, Typography, Skeleton, Tag } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ChartCard, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

interface ActionTrendChartProps {
    isLoading: boolean;
    data: {
        time: string;
        total: number;
        error: number;
        finished: number;
        errorRate: number;
    }[];
}

export const ActionTrendChart: React.FC<ActionTrendChartProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);

    const summary = useMemo(() => {
        const totalActions = data.reduce((sum, item) => sum + item.total, 0);
        const totalErrors = data.reduce((sum, item) => sum + item.error, 0);
        const averageErrorRate = totalActions > 0 ? Math.round((totalErrors / totalActions) * 100) : 0;
        return { totalActions, totalErrors, averageErrorRate };
    }, [data]);

    const hasData = data.some(item => item.total > 0);

    const getErrorTagColor = () => {
        if (summary.averageErrorRate >= 20) return 'error';
        if (summary.averageErrorRate >= 10) return 'warning';
        if (summary.averageErrorRate > 0) return 'processing';
        return 'success';
    };

    return (
        <ChartCard
            $theme="actions"
            title={
                <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                    <Flex align="center" gap={10}>
                        <IconBadge $theme="actions">
                            <LineChartOutlined />
                        </IconBadge>
                        <Flex vertical gap={0}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.actionTrend', 'Action Volume Trend')}</span>
                            <Text type="secondary" style={{ fontSize: 11 }}>{t('chart.actionTrendDesc', 'Last 24h activity')}</Text>
                        </Flex>
                    </Flex>
                    <Tag color={getErrorTagColor()}>
                        {t('common:status.error', 'Error')} {summary.averageErrorRate}%
                    </Tag>
                </Flex>
            }
            $delay={8}
        >
            {isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
            ) : hasData ? (
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'var(--ant-color-text-description)' }}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <RechartsTooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    background: 'rgba(255,255,255,0.95)'
                                }}
                                formatter={(value: number | string | undefined, name?: string) => {
                                    const safeValue = typeof value === 'number' ? value : 0;
                                    if (name === 'errorRate') {
                                        return [`${safeValue}%`, t('chart.errorRateLabel', 'Error rate')];
                                    }
                                    return [safeValue, t('chart.actionsLabel', 'Actions')];
                                }}
                                labelFormatter={(label) => `${label}`}
                            />
                            <Bar
                                yAxisId="left"
                                dataKey="total"
                                fill="var(--ant-color-info)"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={24}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="errorRate"
                                stroke="var(--ant-color-error)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};

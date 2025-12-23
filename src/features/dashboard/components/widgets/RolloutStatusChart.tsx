import React, { useMemo } from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard, ChartLegendItem, COLORS, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

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
        { name: t('common:status.running', 'Running'), value: activeRolloutCount, color: '#8b5cf6' },
        { name: t('common:status.finished', 'Finished'), value: finishedRolloutCount, color: '#10b981' },
        { name: t('common:status.error', 'Error'), value: errorRolloutCount, color: COLORS.error },
    ].filter(d => d.value > 0), [activeRolloutCount, finishedRolloutCount, errorRolloutCount, t]);

    const renderCustomLegend = (data: { name: string; value: number; color: string }[]) => (
        <Flex vertical gap={4} style={{ marginTop: 4 }}>
            {data.map(entry => (
                <ChartLegendItem key={entry.name}>
                    <Flex align="center" gap={6}>
                        <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: entry.color,
                            boxShadow: `0 1px 3px ${entry.color}40`
                        }} />
                        <Text style={{ fontSize: 11, color: '#475569' }}>{entry.name}</Text>
                    </Flex>
                    <Text strong style={{ fontSize: 12, color: entry.color }}>{entry.value}</Text>
                </ChartLegendItem>
            ))}
        </Flex>
    );

    return (
        <ChartCard
            $theme="rollout"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="rollout">
                        <PlayCircleOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.rolloutStatus', 'Rollout')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{total} total rollouts</Text>
                    </Flex>
                </Flex>
            }
            $delay={7}
        >
            {isLoading ? (
                <Skeleton.Avatar active size={80} shape="circle" style={{ margin: '12px auto', display: 'block' }} />
            ) : rolloutStatusData.length > 0 ? (
                <Flex vertical style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                            <Pie
                                data={rolloutStatusData}
                                innerRadius={32}
                                outerRadius={48}
                                paddingAngle={4}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {rolloutStatusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                    />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{
                                    borderRadius: 8,
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {renderCustomLegend(rolloutStatusData)}
                </Flex>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};

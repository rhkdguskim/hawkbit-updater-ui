import React, { useMemo } from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard, ChartLegendItem, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

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
        { name: t('common:status.in_sync', 'In Sync'), value: stats.inSync, color: '#10b981' },
        { name: t('common:status.pending', 'Pending'), value: stats.pending, color: '#f59e0b' },
        { name: t('common:status.registered', 'Registered'), value: stats.registered, color: '#6366f1' },
        { name: t('common:status.unknown', 'Unknown'), value: stats.unknown, color: '#94a3b8' },
        { name: t('common:status.error', 'Error'), value: stats.error, color: '#ef4444' },
    ].filter(d => d.value > 0), [stats, t]);

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
            $theme="fragmentation"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="fragmentation">
                        <AppstoreOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.fragmentation', 'Firmware Status')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{total} devices</Text>
                    </Flex>
                </Flex>
            }
            $delay={6}
        >
            {isLoading ? (
                <Skeleton.Avatar active size={80} shape="circle" style={{ margin: '12px auto', display: 'block' }} />
            ) : data.length > 0 ? (
                <Flex vertical style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={32}
                                outerRadius={48}
                                paddingAngle={4}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
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
                    {renderCustomLegend(data)}
                </Flex>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};

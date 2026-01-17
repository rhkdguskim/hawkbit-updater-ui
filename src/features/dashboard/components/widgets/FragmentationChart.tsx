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
        { name: t('common:status.in_sync', 'In Sync'), value: stats.inSync, color: 'var(--ant-color-success)' },
        { name: t('common:status.pending', 'Pending'), value: stats.pending, color: 'var(--ant-color-warning)' },
        { name: t('common:status.registered', 'Registered'), value: stats.registered, color: '#6366f1' },
        { name: t('common:status.unknown', 'Unknown'), value: stats.unknown, color: '#94a3b8' },
        { name: t('common:status.error', 'Error'), value: stats.error, color: 'var(--ant-color-error)' },
    ].filter(d => d.value > 0), [stats, t]);



    return (
        <ChartCard
            $theme="fragmentation"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="fragmentation">
                        <AppstoreOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 'var(--ant-font-size)', fontWeight: 600 }}>{t('chart.fragmentation', 'Firmware Status')}</span>
                        <Text type="secondary" style={{ fontSize: 'var(--ant-font-size-sm)' }}>{total} devices</Text>
                    </Flex>
                </Flex>
            }
            $delay={6}
        >
            {isLoading ? (
                <Skeleton.Avatar active size={80} shape="circle" style={{ margin: '12px auto', display: 'block' }} />
            ) : data.length > 0 ? (
                <Flex gap={8} style={{ flex: 1 }} align="center">
                    <ResponsiveContainer width="45%" height={100}>
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={28}
                                outerRadius={42}
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
                    <Flex vertical gap={3} style={{ flex: 1, minWidth: 0 }}>
                        {data.slice(0, 4).map(entry => (
                            <ChartLegendItem key={entry.name} style={{ padding: '4px 8px' }}>
                                <Flex align="center" gap={4}>
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 2,
                                        background: entry.color,
                                        flexShrink: 0
                                    }} />
                                    <Text style={{ fontSize: 'var(--ant-font-size-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.name}</Text>
                                </Flex>
                                <Text strong style={{ fontSize: 'var(--ant-font-size-sm)', color: entry.color }}>{entry.value}</Text>
                            </ChartLegendItem>
                        ))}
                    </Flex>
                </Flex>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};

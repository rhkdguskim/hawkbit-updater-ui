import React, { useMemo } from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard, ChartLegendItem, COLORS, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

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
            $theme="connectivity"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="connectivity">
                        <ApiOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.connectivityStatus', 'Connectivity')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{onlinePercent}% Online</Text>
                    </Flex>
                </Flex>
            }
            $delay={5}
        >
            {isLoading ? (
                <Skeleton.Avatar active size={80} shape="circle" style={{ margin: '12px auto', display: 'block' }} />
            ) : connectivityPieData.length > 0 ? (
                <Flex vertical style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={110}>
                        <PieChart>
                            <Pie
                                data={connectivityPieData}
                                innerRadius={32}
                                outerRadius={48}
                                paddingAngle={4}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {connectivityPieData.map((entry, index) => (
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
                    {renderCustomLegend(connectivityPieData)}
                </Flex>
            ) : (
                <Flex justify="center" align="center" style={{ flex: 1 }}>
                    <Text type="secondary">{t('common:messages.noData')}</Text>
                </Flex>
            )}
        </ChartCard>
    );
};

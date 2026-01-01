import React from 'react';
import { Skeleton, Flex, Typography } from 'antd';
import { TagsOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ChartCard, ChartLegendItem, IconBadge } from '../DashboardStyles';

const { Text } = Typography;

interface TargetTypeCoverageChartProps {
    isLoading: boolean;
    data: { name: string; value: number; color: string }[];
}

export const TargetTypeCoverageChart: React.FC<TargetTypeCoverageChartProps> = ({ isLoading, data }) => {
    const { t } = useTranslation(['dashboard', 'common']);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <ChartCard
            $theme="targets"
            title={
                <Flex align="center" gap={10}>
                    <IconBadge $theme="targets">
                        <TagsOutlined />
                    </IconBadge>
                    <Flex vertical gap={0}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{t('chart.targetTypeCoverage', 'Target Type Coverage')}</span>
                        <Text type="secondary" style={{ fontSize: 11 }}>{t('chart.totalTargets', { count: total })}</Text>
                    </Flex>
                </Flex>
            }
            $delay={9}
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
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                    <Flex vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
                        {data.slice(0, 4).map(entry => (
                            <ChartLegendItem key={entry.name} style={{ padding: '6px 10px' }}>
                                <Flex align="center" gap={6}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color, flexShrink: 0 }} />
                                    <Text style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{entry.name}</Text>
                                </Flex>
                                <Text strong style={{ fontSize: 12, color: entry.color }}>{entry.value}</Text>
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

export default TargetTypeCoverageChart;
